import type { LeetCodeProblem } from "../types/types";

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

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

export async function fetchLeetCodeProblem(titleSlug: string): Promise<LeetCodeProblem | null> {
  try {
    const response = await fetch(LEETCODE_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: QUESTION_QUERY,
        variables: { titleSlug },
      }),
    });

    if (!response.ok) {
      console.error("Failed to fetch LeetCode problem:", response.statusText);
      return null;
    }

    const data = await response.json();
    return data.data?.question || null;
  } catch (error) {
    console.error("Error fetching LeetCode problem:", error);
    return null;
  }
}

export function extractTitleSlug(url: string): string | null {
  const match = url.match(/leetcode\.com\/problems\/([^/]+)/);
  return match ? match[1] : null;
}
