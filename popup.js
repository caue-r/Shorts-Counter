function updateCounter() {
    chrome.storage.local.get(['shortCounter'], (data) => {
      document.getElementById('counter').textContent = data.shortCounter || 0;
    });
  }
  updateCounter();
  
  document.getElementById('reset').onclick = () => {
    chrome.storage.local.set({ shortCounter: 0, videosSeen: {} }, updateCounter);
    chrome.action.setBadgeText({ text: "" });
  };
  