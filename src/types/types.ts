/* 
  Scraped pagedata type
*/
export interface ScrapedPageData {
  title: string;
  url: string;
  leetcodeProblem?: LeetCodeProblem;
}

export interface LeetCodeProblem {
  questionId: string;
  title: string;
  titleSlug: string;
  content: string;
  difficulty: string;
  hints: string[];
  exampleTestcases: string;
}

/* 
  Chrome extension communication types
*/
export const Message = {
  GET_DATA: "GET_DATA",
  DATA_UPDATED: "DATA_UPDATED",
  ASK_AI: "ASK_AI",
  STREAM_AI_TOKEN: "STREAM_AI_TOKEN",
  STREAM_AI_DONE: "STREAM_AI_DONE",
  MODEL_DOWNLOAD_PROGRESS: "MODEL_DOWNLOAD_PROGRESS",
  STOP_ASK_AI: "STOP_ASK_AI",
  SUMMARIZE_CONVERSATION: "SUMMARIZE_CONVERSATION",
  SUMMARY_DONE: "SUMMARY_DONE",
} as const;

export type MessageType = (typeof Message)[keyof typeof Message];

export type RuntimeMessageInterface =
  | { type: typeof Message.GET_DATA }
  | { type: typeof Message.DATA_UPDATED; data: ScrapedPageData }
  | { type: typeof Message.ASK_AI; userPrompt: string; language?: string }
  | { type: typeof Message.STOP_ASK_AI }
  | { type: typeof Message.SUMMARIZE_CONVERSATION; messages: ChatMessage[]; metadata: { title: string } }
  | { type: typeof Message.SUMMARY_DONE; session: any; error?: string };

/* 
  Chat message type
*/
export type ChatMessage = {
  id: string;
  role: "user" | "bot";
  content: string;
  createdAt: number;
};

export type ModelParams = {
  defaultTopK: number;
  maxTopK: number;
  defaultTemperature: number;
  maxTemperature: number;
};
