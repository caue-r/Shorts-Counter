let counter = 0;
let videosSeen = {};

chrome.storage.local.get(['shortCounter', 'videosSeen'], (data) => {
  counter = data.shortCounter || 0;
  videosSeen = data.videosSeen || {};
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "INCREMENT_COUNTER") {
    if (!videosSeen[message.videoId]) {
      counter++;
      videosSeen[message.videoId] = true;
      chrome.storage.local.set({ shortCounter: counter, videosSeen });
      chrome.action.setBadgeText({ text: counter.toString() });
    }
  }
});
