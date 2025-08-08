const LOTE_SIZE = 10;

let counter = 0;
let videosSeen = {};

console.log('[Shorts Counter] Service Worker carregado!');


chrome.storage.local.get(['shortCounter', 'videosSeen'], (data) => {
  counter = data.shortCounter || 0;
  videosSeen = data.videosSeen || {};
  console.log(`[Shorts Counter] Dados carregados: contador = ${counter}, vídeos no lote: ${Object.keys(videosSeen).length}`);
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "INCREMENT_COUNTER") {
    console.log(`[Shorts Counter] Mensagem recebida: INCREMENT_COUNTER para o vídeo ${message.videoId}`);

    if (!videosSeen[message.videoId]) {
      videosSeen[message.videoId] = true;
      counter++;  // Agora soma 1 a cada vídeo novo
      console.log(`[Shorts Counter] Novo vídeo registrado: ${message.videoId} (total no lote: ${Object.keys(videosSeen).length}), contador = ${counter}`);

      if (Object.keys(videosSeen).length >= LOTE_SIZE) {
        videosSeen = {};
        chrome.storage.local.set({ shortCounter: counter, videosSeen }, () => {
          console.log(`[Shorts Counter] Lote de ${LOTE_SIZE} fechado! Lote reiniciado. Contador permanece: ${counter}`);
        });
        chrome.action.setBadgeText({ text: counter.toString() });
      } else {
        chrome.storage.local.set({ shortCounter: counter, videosSeen }, () => {
          console.log(`[Shorts Counter] Estado intermediário salvo: contador = ${counter}, vídeos no lote = ${Object.keys(videosSeen).length}`);
        });
        chrome.action.setBadgeText({ text: counter.toString() });
      }
    } else {
      console.log(`[Shorts Counter] Vídeo ${message.videoId} já registrado neste lote. Nada feito.`);
    }
  }
});
