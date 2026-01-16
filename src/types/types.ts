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

export const Message = {
    GET_DATA: "GET_DATA",
    DATA_UPDATED: "DATA_UPDATED",
} as const;

export type Message = typeof Message[keyof typeof Message];

export interface RuntimeMessageInterface {
    type: Message;
}
