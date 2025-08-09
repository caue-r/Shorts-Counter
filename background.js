// === SHORTS COUNTER BACKGROUND SCRIPT ===
// Service Worker para gerenciar o contador de Shorts e Reels
const DEBUG = false;
const log = (...args) => DEBUG && console.log("[Shorts Counter]", ...args);

class ShortsCounterBackground {
  constructor() {
    this.counter = 0;
    this.videosSeen = {};
    this.batchSize = 10;
    this.isInitialized = false;
    this.init();
  }

  async init() {
    try {
      await this.loadData();
      this.setupMessageListener();
      this.isInitialized = true;
      log("Service Worker inicializado com sucesso!");
    } catch (error) {
      console.error("[Shorts Counter] Erro na inicialização do Service Worker:", error);
    }
  }

  // Carrega dados salvos do storage
  async loadData() {
    try {
      const data = await chrome.storage.local.get(['shortCounter', 'videosSeen']);
      this.counter = data.shortCounter || 0;
      this.videosSeen = data.videosSeen || {};
      log(`Dados carregados: contador = ${this.counter}, vídeos no lote: ${Object.keys(this.videosSeen).length}`);
    } catch (error) {
      console.error("[Shorts Counter] Erro ao carregar dados:", error);
      this.counter = 0;
      this.videosSeen = {};
    }
  }

  // Configura listener de mensagens
  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      try {
        // Verifica se a extensão ainda está ativa
        if (!chrome.runtime?.id) {
          log("Extensão não está mais ativa, ignorando mensagem");
          return;
        }

        this.handleMessage(message, sender, sendResponse);
        return true; // Mantém a conexão aberta para async response
      } catch (error) {
        console.error("[Shorts Counter] Erro ao processar mensagem:", error);
        // Tenta enviar resposta apenas se ainda for possível
        try {
          sendResponse({ success: false, error: error.message });
        } catch (sendError) {
          log("Não foi possível enviar resposta de erro:", sendError);
        }
      }
    });
  }

  // Processa mensagens recebidas
  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.type) {
        case "INCREMENT_COUNTER":
          await this.handleIncrementCounter(message, sender, sendResponse);
          break;
        case "GET_COUNTER":
          sendResponse({ success: true, counter: this.counter });
          break;
        case "RESET_COUNTER":
          await this.handleResetCounter(sendResponse);
          break;
        default:
          log("Tipo de mensagem desconhecido:", message.type);
          sendResponse({ success: false, error: "Tipo de mensagem desconhecido" });
      }
    } catch (error) {
      console.error("[Shorts Counter] Erro ao processar mensagem:", error);
      try {
        sendResponse({ success: false, error: error.message });
      } catch (sendError) {
        log("Não foi possível enviar resposta de erro:", sendError);
      }
    }
  }

  // Processa incremento do contador
  async handleIncrementCounter(message, sender, sendResponse) {
    try {
      const { videoId, timestamp } = message;
      log(`Mensagem recebida: INCREMENT_COUNTER para o vídeo ${videoId}`);

      if (!videoId) {
        sendResponse({ success: false, error: "ID do vídeo não fornecido" });
        return;
      }

      if (!this.videosSeen[videoId]) {
        this.videosSeen[videoId] = {
          timestamp: timestamp || Date.now(),
          url: sender?.tab?.url || 'unknown'
        };
        
        this.counter++;
        log(`Novo vídeo registrado: ${videoId} (total no lote: ${Object.keys(this.videosSeen).length}), contador = ${this.counter}`);

        // Verifica se o lote está cheio
        if (Object.keys(this.videosSeen).length >= this.batchSize) {
          await this.saveDataAndResetBatch();
        } else {
          await this.saveData();
        }

        await this.updateBadge();
        sendResponse({ success: true, counter: this.counter });
      } else {
        log(`Vídeo ${videoId} já registrado neste lote. Nada feito.`);
        sendResponse({ success: true, counter: this.counter, alreadySeen: true });
      }
    } catch (error) {
      console.error("[Shorts Counter] Erro ao processar incremento:", error);
      sendResponse({ success: false, error: error.message });
    }
  }

  // Processa reset do contador
  async handleResetCounter(sendResponse) {
    try {
      this.counter = 0;
      this.videosSeen = {};
      await this.saveData();
      await this.updateBadge();
      log("Contador resetado com sucesso");
      sendResponse({ success: true, counter: this.counter });
    } catch (error) {
      console.error("[Shorts Counter] Erro ao resetar contador:", error);
      sendResponse({ success: false, error: error.message });
    }
  }

  // Salva dados no storage
  async saveData() {
    try {
      await chrome.storage.local.set({ 
        shortCounter: this.counter, 
        videosSeen: this.videosSeen 
      });
      log(`Estado salvo: contador = ${this.counter}, vídeos no lote = ${Object.keys(this.videosSeen).length}`);
    } catch (error) {
      console.error("[Shorts Counter] Erro ao salvar dados:", error);
      throw error;
    }
  }

  // Salva dados e reseta o lote
  async saveDataAndResetBatch() {
    this.videosSeen = {};
    await this.saveData();
    log(`Lote de ${this.batchSize} fechado! Lote reiniciado. Contador permanece: ${this.counter}`);
  }

  // Atualiza o badge da extensão
  async updateBadge() {
    try {
      const badgeText = this.counter > 0 ? this.counter.toString() : "";
      await chrome.action.setBadgeText({ text: badgeText });
      await chrome.action.setBadgeBackgroundColor({ color: "#00e676" });
    } catch (error) {
      console.error("[Shorts Counter] Erro ao atualizar badge:", error);
    }
  }
}

// Inicializa o background script
new ShortsCounterBackground();
