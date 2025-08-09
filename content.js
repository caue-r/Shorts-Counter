// === SHORTS COUNTER CONTENT SCRIPT ===
const DEBUG = false;
const log = (...args) => DEBUG && console.log("[Shorts Counter]", ...args);

// Verifica se a extensão está ativa antes de inicializar
if (!chrome.runtime?.id) {
  log("Extensão não está ativa, content script não será inicializado");
} else {
  class ShortsCounter {
    constructor() {
      this.lastVideoId = null;
      this.debounceTimer = null;
      this.isInitialized = false;
      this.init();
    }

    init() {
      try {
        this.setupEventListeners();
        this.hookHistoryAPI();
        this.setupMutationObserver();
        this.isInitialized = true;
        log("Shorts Counter inicializado em:", location.href);
        this.maybeCount();
      } catch (error) {
        console.error("[Shorts Counter] Erro na inicialização:", error);
      }
    }

    // Extrai ID do vídeo da URL atual
    getVideoIdFromUrl() {
      try {
        const url = location.href;
        
        // YouTube Shorts
        const ytMatch = url.match(/https?:\/\/(?:www\.)?youtube\.com\/shorts\/([\w-]+)/);
        if (ytMatch) return `yt-${ytMatch[1]}`;

        // Instagram Reels
        const instaMatch = url.match(/https?:\/\/(?:www\.)?instagram\.com\/reels\/([\w-]+)/);
        if (instaMatch) return `insta-${instaMatch[1]}`;

        return null;
      } catch (error) {
        log("Erro ao extrair ID do vídeo:", error);
        return null;
      }
    }

    // Conta o vídeo se for novo
    maybeCount() {
      try {
        const videoId = this.getVideoIdFromUrl();
        if (!videoId) {
          log("Sem ID detectado para a URL:", location.href);
          return;
        }

        if (videoId !== this.lastVideoId) {
          this.lastVideoId = videoId;
          log("Novo vídeo detectado:", videoId);
          this.sendIncrementMessage(videoId);
        } else {
          log("Mesmo vídeo, ignorando:", videoId);
        }
      } catch (error) {
        console.error("[Shorts Counter] Erro ao contar vídeo:", error);
      }
    }

    // Envia mensagem para o background script
    sendIncrementMessage(videoId) {
      try {
        // Verifica se a extensão ainda está ativa
        if (!chrome.runtime?.id) {
          log("Extensão não está mais ativa, ignorando mensagem");
          return;
        }

        // Verifica se o runtime está disponível
        if (typeof chrome.runtime.sendMessage !== 'function') {
          log("Runtime não está disponível, ignorando mensagem");
          return;
        }

        chrome.runtime.sendMessage({ 
          type: "INCREMENT_COUNTER", 
          videoId: videoId,
          timestamp: Date.now()
        }).then(response => {
          if (chrome.runtime.lastError) {
            // Ignora erros de contexto inválido (extensão recarregada)
            if (chrome.runtime.lastError.message.includes('Extension context invalidated')) {
              log("Contexto da extensão inválido - extensão pode ter sido recarregada");
            } else {
              log("Erro ao enviar mensagem:", chrome.runtime.lastError.message);
            }
          } else if (response && response.success) {
            log("Mensagem enviada com sucesso:", response);
          }
        }).catch(error => {
          // Ignora erros de contexto inválido
          if (error.message && error.message.includes('Extension context invalidated')) {
            log("Contexto da extensão inválido - extensão pode ter sido recarregada");
          } else {
            log("Erro ao enviar mensagem:", error);
          }
        });
      } catch (error) {
        // Ignora erros de contexto inválido
        if (error.message && error.message.includes('Extension context invalidated')) {
          log("Contexto da extensão inválido - extensão pode ter sido recarregada");
        } else {
          console.error("[Shorts Counter] Erro ao enviar mensagem:", error);
        }
      }
    }

    // Debounce para evitar múltiplas contagens
    debouncedMaybeCount(delay = 150) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => this.maybeCount(), delay);
    }

    // Configura listeners de eventos
    setupEventListeners() {
      // YouTube specific events
      window.addEventListener("yt-navigate-finish", () => {
        log("yt-navigate-finish");
        this.debouncedMaybeCount();
      });

      window.addEventListener("yt-navigate-start", () => {
        log("yt-navigate-start");
      });

      // Location change events
      window.addEventListener("locationchange", () => {
        log("locationchange");
        this.debouncedMaybeCount();
      });
    }

    // Hook na API de histórico para detectar mudanças de URL
    hookHistoryAPI() {
      const { pushState, replaceState } = history;

      history.pushState = (...args) => {
        const result = pushState.apply(history, args);
        window.dispatchEvent(new Event("locationchange"));
        return result;
      };

      history.replaceState = (...args) => {
        const result = replaceState.apply(history, args);
        window.dispatchEvent(new Event("locationchange"));
        return result;
      };

      window.addEventListener("popstate", () => {
        window.dispatchEvent(new Event("locationchange"));
      });
    }

    // Observer para mudanças no DOM
    setupMutationObserver() {
      const observer = new MutationObserver(() => {
        if (/\/shorts\/|\/reels\//.test(location.pathname)) {
          this.debouncedMaybeCount(200);
        }
      });

      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    }
  }

  // Inicializa o contador quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ShortsCounter());
  } else {
    new ShortsCounter();
  }
}
