// === DEBUG LOG ===
const log = (...args) => console.log("[Shorts Counter]", ...args);

let lastVideoId = null;

// Extrai ID do vídeo
function getVideoIdFromUrl() {
  const url = location.href;

  // YouTube Shorts
  let m = url.match(/https?:\/\/(?:www\.)?youtube\.com\/shorts\/([\w-]+)/);
  if (m) return "yt-" + m[1];

  // Instagram Reels
  m = url.match(/https?:\/\/(?:www\.)?instagram\.com\/reels\/([\w-]+)/);
  if (m) return "insta-" + m[1];

  return null;
}

function maybeCount() {
  const id = getVideoIdFromUrl();
  if (!id) {
    log("Sem ID detectado para a URL:", location.href);
    return;
  }
  if (id !== lastVideoId) {
    lastVideoId = id;
    log("Novo vídeo detectado:", id);
    chrome.runtime.sendMessage({ type: "INCREMENT_COUNTER", videoId: id });
  } else {
    log("Mesmo vídeo, ignorando:", id);
  }
}

// --- Debounce util ---
let debounceTimer = null;
function debouncedMaybeCount(delay = 150) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(maybeCount, delay);
}


(function hookHistoryAPI() {
  const { pushState, replaceState } = history;

  history.pushState = function () {
    const ret = pushState.apply(this, arguments);
    window.dispatchEvent(new Event("locationchange"));
    return ret;
  };

  history.replaceState = function () {
    const ret = replaceState.apply(this, arguments);
    window.dispatchEvent(new Event("locationchange"));
    return ret;
  };

  window.addEventListener("popstate", () => {
    window.dispatchEvent(new Event("locationchange"));
  });

  window.addEventListener("locationchange", () => {
    log("locationchange");
    debouncedMaybeCount();
  });
})();

window.addEventListener("yt-navigate-finish", () => {
  log("yt-navigate-finish");
  debouncedMaybeCount();
});
window.addEventListener("yt-navigate-start", () => {
  log("yt-navigate-start");
});

const mo = new MutationObserver(() => {
  if (/\/shorts\/|\/reels\//.test(location.pathname)) {
    debouncedMaybeCount(200);
  }
});
mo.observe(document.documentElement, {
  childList: true,
  subtree: true,
});

setInterval(() => {
  if (/\/shorts\/|\/reels\//.test(location.pathname)) maybeCount();
}, 2000);

log("content.js injetado em:", location.href);
maybeCount();
