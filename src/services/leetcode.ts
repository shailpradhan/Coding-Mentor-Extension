import type { LeetCodeProblem } from "../types/types";

const LEETCODE_GRAPHQL_URL = import.meta.env.VITE_LEETCODE_GRAPHQL_URL;

const QUESTION_QUERY = `
  query questionData($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionId
      title
      titleSlug
      content
      difficulty
      hints
      exampleTestcases
    }
  }
`;

const REQUEST_TIMEOUT = 8000;
const MAX_RETRIES = 2;

async function fetchWithTimeout(
  input: RequestInfo,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(id);
  }
}

export async function fetchLeetCodeProblem(
  titleSlug: string,
): Promise<LeetCodeProblem | null> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetchWithTimeout(
        LEETCODE_GRAPHQL_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            query: QUESTION_QUERY,
            variables: { titleSlug },
          }),
        },
        REQUEST_TIMEOUT,
      );

      if (!response.ok) {
        // Retry only on gateway / server issues
        if (response.status >= 500 && attempt < MAX_RETRIES) {
          continue;
        }

        console.warn(
          "LeetCode request failed:",
          response.status,
          response.statusText,
        );
        return null;
      }

      const data = await response.json();
      return data.data?.question ?? null;
    } catch (error) {
      // AbortError or network error
      if (attempt < MAX_RETRIES) {
        continue;
      }

      console.warn("LeetCode request error:", error);
      return null;
    }
  }

  return null;
}

export function extractTitleSlug(url: string): string | null {
  const match = url.match(/leetcode\.com\/problems\/([^/]+)/);
  return match ? match[1] : null;
}
