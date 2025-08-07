const LOTE_SIZE = 10;

let counter = 0;
let videosSeen = {};

// Log inicial
console.log('[Shorts Counter] Service Worker carregado!');

// Carrega dados do storage ao iniciar
chrome.storage.local.get(['shortCounter', 'videosSeen'], (data) => {
  counter = data.shortCounter || 0;
  videosSeen = data.videosSeen || {};
  console.log(`[Shorts Counter] Dados carregados: contador = ${counter}, vídeos no lote: ${Object.keys(videosSeen).length}`);
});

// Recebe mensagem do content script para contar novo vídeo
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "INCREMENT_COUNTER") {
    console.log(`[Shorts Counter] Mensagem recebida: INCREMENT_COUNTER para o vídeo ${message.videoId}`);

    if (!videosSeen[message.videoId]) {
      videosSeen[message.videoId] = true;
      console.log(`[Shorts Counter] Novo vídeo registrado no lote: ${message.videoId} (total no lote: ${Object.keys(videosSeen).length})`);

      // Se atingiu o lote, soma ao contador e zera
      if (Object.keys(videosSeen).length >= LOTE_SIZE) {
        counter += LOTE_SIZE;
        videosSeen = {};
        chrome.storage.local.set({ shortCounter: counter, videosSeen }, () => {
          console.log(`[Shorts Counter] Lote de ${LOTE_SIZE} fechado! Contador incrementado para ${counter}. Lote reiniciado.`);
        });
        chrome.action.setBadgeText({ text: counter.toString() });
      } else {
        // Salva o estado intermediário (a cada novo vídeo visto)
        chrome.storage.local.set({ shortCounter: counter, videosSeen }, () => {
          console.log(`[Shorts Counter] Estado intermediário salvo: contador = ${counter}, vídeos no lote = ${Object.keys(videosSeen).length}`);
        });
      }
    } else {
      console.log(`[Shorts Counter] Vídeo ${message.videoId} já registrado neste lote. Nada feito.`);
    }
  }
});
