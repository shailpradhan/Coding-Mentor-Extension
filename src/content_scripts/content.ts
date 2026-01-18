import { Message } from "../types/types";
import type { ScrapedPageData } from "../types/types";
import { fetchLeetCodeProblem, extractTitleSlug } from "../services/leetcode";

console.log("Content script loaded:", window.location.href);

let currentUrl = window.location.href;
let cachedProblemData: ScrapedPageData["leetcodeProblem"] | undefined;

async function getLeetCodeData(url: string) {
  const slug = extractTitleSlug(url);
  if (slug) {
    const problem = await fetchLeetCodeProblem(slug);
    if (problem) {
      cachedProblemData = problem;
      console.log("Fetched LeetCode problem:", problem.title);

      const data = await scrapePage();
      chrome.runtime.sendMessage({
        type: Message.DATA_UPDATED,
        data,
      });
    }
  }
}

// Initial load
getLeetCodeData(currentUrl);

// Monitor URL changes (SPA support)
const observer = new MutationObserver(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    console.log("URL changed:", currentUrl);
    getLeetCodeData(currentUrl);
  }
});

observer.observe(document.body, { childList: true, subtree: true });

async function scrapePage(): Promise<ScrapedPageData> {
  if (!cachedProblemData && extractTitleSlug(window.location.href)) {
    await getLeetCodeData(window.location.href);
  }

  return {
    title: document.title,
    url: window.location.href,
    leetcodeProblem: cachedProblemData,
  };
}
