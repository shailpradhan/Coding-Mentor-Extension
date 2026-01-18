/// <reference types="chrome" />

import { Message } from "./types/types";
import type {
  ModelParams,
  RuntimeMessageInterface,
  ScrapedPageData,
} from "./types/types";

/* ------------------------------------------------------------------------------------------------------------- */

/* Global state */
let latestScrapedData: ScrapedPageData | null = null;
let lmSession: any | null = null;
let isSessionInitialized = false;
let modelParams: ModelParams | null = null;

const FALLBACK_MODEL_PARAMS: ModelParams = {
  defaultTopK: 3,
  maxTopK: 128,
  defaultTemperature: 1,
  maxTemperature: 2,
};

/* Window handling */
let mentorWindowId: number | null = null;

function openExtension(): void {
  if (mentorWindowId !== null) {
    chrome.windows.update(mentorWindowId, { focused: true }).catch(() => {
      mentorWindowId = null;
      openExtension();
    });
    return;
  }

  chrome.windows.create(
    {
      url: chrome.runtime.getURL("index.html"),
      type: "popup",
      width: 350,
      height: 500,
    },
    (win) => {
      mentorWindowId = win?.id ?? null;
    },
  );
}

chrome.action.onClicked.addListener(openExtension);
chrome.commands.onCommand.addListener((cmd) => {
  if (cmd === "open-tab") openExtension();
});
chrome.windows.onRemoved.addListener((id) => {
  if (id === mentorWindowId) mentorWindowId = null;
});

/* ------------------------------------------------------------------------------------------------------------- */
/* AI Helpers */

function getAIModel() {
  if (
    typeof (self as any).ai !== "undefined" &&
    (self as any).ai.languageModel
  ) {
    return (self as any).ai.languageModel;
  }
  return (self as any).LanguageModel;
}

async function getAvailability() {
  const model = getAIModel();
  if (!model) return "unavailable";

  if (model.capabilities) {
    const caps = await model.capabilities();
    console.log("Model capabilities:", caps);
    return caps.available;
  }

  return model.availability();
}

async function getModelParams(): Promise<ModelParams> {
  if (modelParams) return modelParams;

  const model = getAIModel();
  if (!model || typeof model.capabilities !== "function") {
    modelParams = FALLBACK_MODEL_PARAMS;
    return modelParams;
  }

  try {
    const caps = await model.capabilities();

    modelParams = {
      defaultTemperature: caps.defaultTemperature ?? 0.7,
      maxTemperature: caps.maxTemperature ?? 1,
      defaultTopK: caps.defaultTopK ?? 40,
      maxTopK: caps.maxTopK ?? 100,
    };

    return modelParams;
  } catch (e) {
    console.error("Gemini Nano capabilities failed", e);
    modelParams = FALLBACK_MODEL_PARAMS;
    return modelParams;
  }
}

/* ------------------------------------------------------------------------------------------------------------- */
/* Session initialization */

async function initializeSystemPrompt() {
  if (!lmSession || isSessionInitialized) return;

  const systemPrompt = `
You are an expert DSA mentor helping students solve LeetCode problems.

Rules:

- Give hints before full solutions.
- Do NOT provide full code unless the user explicitly asks for full code.
- Start with a brute force approach. 
- Afterwards start with better solutions with better performance.
- Explain intuition, approach, and time/space complexity.
- Keep hints under 20 words. 2-3 sentences max.
- Keep full explanations under 150 words.

- Be concise, structured, and encouraging.
- If you are not sure about the answer, say so.

Formatting rules (IMPORTANT):
- Reply in plain text only.
- Do NOT use markdown of any kind.
- Do NOT use **, __, *, -, bullet points, or numbered markdown lists.
- Use simple sentences and line breaks only.
- Section titles must be plain text followed by a colon (example: Update Maximum Area:).

Code rules:

- ONLY when the user explicitly asks for “full code”, return code.
- Code must be inside a proper code block using triple backticks.
- Outside of code blocks, no markdown is allowed.
`;

  await lmSession.prompt(systemPrompt);
  isSessionInitialized = true;
}

/* Problem context update */

async function updateProblemContext() {
  if (!lmSession || !latestScrapedData) return;

  console.log("Updating AI context with:", latestScrapedData.title);

  await lmSession.prompt(`
New LeetCode Problem Context:
${JSON.stringify(latestScrapedData, null, 2)}
`);
}

/* Session Creation */

async function getSession(): Promise<any> {
  if (lmSession) return lmSession;

  const model = getAIModel();
  if (!model) {
    throw new Error(
      "Gemini Nano is not available. Enable it in chrome://flags",
    );
  }

  if ((await getAvailability()) !== "available") {
    throw new Error(
      "Gemini Nano is not available. Enable it in chrome://flags",
    );
  }

  lmSession = await model.create({
    monitor(m: any) {
      m.addEventListener("downloadprogress", (e: any) => {
        const percent = Math.round((e.loaded / e.total) * 100);

        chrome.runtime
          .sendMessage({
            type: Message.MODEL_DOWNLOAD_PROGRESS,
            progress: percent,
          })
          .catch(() => {});
      });
    },
  });

  await initializeSystemPrompt();

  if (latestScrapedData) {
    await updateProblemContext();
  }

  return lmSession;
}

const streamAI = async (
  prompt: string,
  onToken: (token: string) => void,
  signal: AbortSignal,
) => {
  const session = await getSession();
  const params = await getModelParams();

  const stream = session.promptStreaming(prompt, {
    temperature: params?.defaultTemperature,
    topK: params?.defaultTopK,
    signal,
  });

  for await (const chunk of stream) {
    onToken(chunk);
  }
};

/* Runtime messaging */

let currentAbortController: AbortController | null = null;

chrome.runtime.onMessage.addListener(
  (message: RuntimeMessageInterface, _sender, sendResponse) => {
    switch (message.type) {
      // Provide data to popup
      case Message.GET_DATA: {
        sendResponse(latestScrapedData);
        return;
      }

      // Update data when page changes
      case Message.DATA_UPDATED: {
        latestScrapedData = message.data;
        updateProblemContext();
        return;
      }

      case Message.STOP_ASK_AI: {
        if (currentAbortController) {
          currentAbortController.abort();
          currentAbortController = null;
        }
        return;
      }

      case Message.ASK_AI: {
        // Abort previous if exists
        if (currentAbortController) {
          currentAbortController.abort();
        }
        currentAbortController = new AbortController();
        const signal = currentAbortController.signal;

        (async () => {
          try {
            const langInstruction = message.language
              ? `\n\n(IMPORTANT: Provide code examples in ${message.language} if applicable)`
              : "";

            await streamAI(
              message.userPrompt + langInstruction,
              (token) => {
                chrome.runtime.sendMessage({
                  type: Message.STREAM_AI_TOKEN,
                  token,
                });
              },
              signal,
            );

            chrome.runtime.sendMessage({
              type: Message.STREAM_AI_DONE,
            });

            sendResponse({ success: true });
          } catch (err) {
            if ((err as Error).name === "AbortError") {
              // Optionally notify UI that it was stopped, but UI likely knows since it triggered it.
              // We might want to send a "Done" or specific "Aborted" message if the UI needs to clean up state.
              // For now, let's assume the UI handles the "Stop" click by resetting its own state or we send DONE.
              chrome.runtime.sendMessage({
                type: Message.STREAM_AI_DONE,
              });
            } else {
              console.error("AI Error:", err);
              sendResponse({
                success: false,
                error: err instanceof Error ? err.message : String(err),
              });
            }
          } finally {
            currentAbortController = null;
          }
        })();

        return true;
      }

      case Message.SUMMARIZE_CONVERSATION: {
        const { messages, metadata } = message;

        (async () => {
          let summarySession: any = null;
          try {
            const model = getAIModel();
            const params = await getModelParams();

            // Create a fresh session for summarization to avoid context length issues or state conflicts
            summarySession = await model.create({
              systemPrompt:
                "You are a helpful assistant that summarizes technical conversations.",
            });

            const summaryPrompt = `
Summarize this LeetCode mentoring conversation into a concise note.

Title: ${metadata.title}

Conversation:
${messages.map((m: any) => `${m.role}: ${m.content}`).join("\n")}

Output rules:
- Plain text only
- No markdown
- Sections separated by line breaks
- Include:
Title:
Key Insights:
Approach:
Time Complexity:
Space Complexity:
Tricky Parts:
`;

            const summary = await summarySession.prompt(summaryPrompt, {
              temperature: params.defaultTemperature,
              topK: params.defaultTopK,
            });

            const savedSession = {
              id: crypto.randomUUID(),
              title: metadata.title,
              summary,
              createdAt: Date.now(),
            };

            chrome.storage.local.get({ savedSummaries: [] }, (result) => {
              const savedSummaries = Array.isArray(result.savedSummaries)
                ? result.savedSummaries
                : [];

              chrome.storage.local.set({
                savedSummaries: [...savedSummaries, savedSession],
              });
            });

            chrome.runtime.sendMessage({
              type: Message.SUMMARY_DONE,
              session: savedSession,
            });
            sendResponse({ success: true });
          } catch (err) {
            console.error("Summary failed:", err);
            chrome.runtime.sendMessage({
              type: Message.SUMMARY_DONE,
              error: err instanceof Error ? err.message : String(err),
            });
            sendResponse({ success: false, error: String(err) });
          } finally {
            if (summarySession) {
              summarySession.destroy();
            }
          }
        })();

        return true;
      }
    }
  },
);
