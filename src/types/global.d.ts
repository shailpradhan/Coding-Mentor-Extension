export {};

declare global {
  interface Window {
    ai?: {
      prompt: (options: {
        systemPrompt?: string;
        prompt: string;
        temperature?: number;
      }) => Promise<{
        text: string;
      }>;
    };
  }

  interface WorkerGlobalScope {
    ai?: Window["ai"];
  }

}
