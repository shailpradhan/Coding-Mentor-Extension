/// <reference types="chrome" />
import { Message } from "./types/types";
import type { RuntimeMessageInterface, ScrapedPageData } from "./types/types";

let mentorWindowId: number | null = null;
let latestScrapedData: ScrapedPageData | null = null;

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
    }
  );
}


chrome.action.onClicked.addListener(() => {
  openExtension();
});

chrome.commands.onCommand.addListener((command: string) => {
  if (command !== "open-tab") return;
  openExtension();
});

/**
 * Viewer → background data request
 */
chrome.runtime.onMessage.addListener(
  (
    message: RuntimeMessageInterface,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: ScrapedPageData | null) => void
  ) => {
    // send page data to app
    if (message.type === Message.GET_DATA) {
      sendResponse(latestScrapedData);
    }

    // receive page data from content script
    if (message.type === Message.DATA_UPDATED) {
      // @ts-expect-error - data property exists on message for DATA_UPDATED
      latestScrapedData = message.data;
    }
    return true;
  }
);

/**
 * Cleanup when popup window closes
 */
chrome.windows.onRemoved.addListener((id: number) => {
  if (id === mentorWindowId) {
    mentorWindowId = null;
  }
});
