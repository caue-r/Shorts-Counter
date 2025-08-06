let lastVideoId = null;

// Função para extrair o ID do vídeo da URL atual
function getVideoIdFromUrl() {
  const url = window.location.href;
  // YouTube Shorts
  let match = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (match) return 'yt-' + match[1];
  // Instagram Reels
  match = url.match(/instagram\.com\/reels\/([a-zA-Z0-9_-]+)/);
  if (match) return 'insta-' + match[1];
  return null;
}

function checkForVideoChange() {
  const currentId = getVideoIdFromUrl();
  if (currentId && currentId !== lastVideoId) {
    lastVideoId = currentId;
    chrome.runtime.sendMessage({ type: "INCREMENT_COUNTER", videoId: currentId });
  }
}

// Verifica a cada 500ms se mudou o vídeo
setInterval(checkForVideoChange, 500);
