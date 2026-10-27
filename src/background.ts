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

Teaching approach:
- For an open-ended request about solving a problem, start with one useful hint of at most 20 words. Do not lead with the complete approach or solution.
- When the learner asks for another hint, reveal the next useful observation without repeating earlier hints or jumping straight to the solution.
- Respond directly when the learner asks for a concept explanation, correctness reasoning, approach comparison, or complexity analysis. Keep the explanation focused and invite the learner to think through the next step when useful.
- For a requested walkthrough, explain the intuition, then compare a straightforward approach with a more efficient one when applicable. State the time and space complexity and meaningful trade-offs.
- Keep explanations concise, usually under 150 words, unless the learner asks for more detail.
- Preserve the current problem and prior discussion across follow-up questions. Interpret requests such as “teach me the idea” and “why does this work?” using that context.
- Never provide a complete solution or full code unless the learner explicitly asks for it. A request for a hint, explanation, or approach is not a request for full code.
- If you are uncertain or required information is missing, say so instead of inventing details.

Problem context:
- Use the active LeetCode problem information supplied in the conversation, including its statement, difficulty, constraints, examples, and hints when available.
- Base reasoning on the supplied information. Do not invent missing constraints, examples, or problem details.
- If no active problem information is available, answer the learner's general question without pretending a problem was provided.

Formatting:
- Use plain text with simple line breaks. Do not use markdown headings, bullet lists, or numbered lists.
- Use short section labels followed by a colon when structure helps.
- Put requested code inside triple-backtick code fences; do not use markdown outside code fences.
- Provide code in the learner's selected language when one is specified.
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
              ? `\n\nThe learner's selected programming language is ${message.language}. Use it for code only when code is explicitly requested.`
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
