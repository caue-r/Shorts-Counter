// === SHORTS COUNTER POPUP SCRIPT ===
class ShortsCounterPopup {
  constructor() {
    this.counterElement = document.getElementById('counter');
    this.resetButton = document.getElementById('reset');
    this.isInitialized = false;
    this.init();
  }

  async init() {
    try {
      this.setupEventListeners();
      await this.updateCounter();
      this.isInitialized = true;
    } catch (error) {
      console.error("[Shorts Counter] Erro na inicialização do popup:", error);
      this.showError("Erro ao carregar dados");
    }
  }

  // Configura listeners de eventos
  setupEventListeners() {
    this.resetButton.addEventListener('click', () => this.handleReset());
    
    // Atualiza o contador quando a janela ganha foco
    window.addEventListener('focus', () => this.updateCounter());
  }

  // Atualiza o contador na interface
  async updateCounter() {
    try {
      const data = await chrome.storage.local.get(['shortCounter']);
      const counter = data.shortCounter || 0;
      this.counterElement.textContent = counter.toLocaleString('pt-BR');
      this.counterElement.setAttribute('aria-label', `${counter} shorts e reels vistos`);
    } catch (error) {
      console.error("[Shorts Counter] Erro ao atualizar contador:", error);
      this.showError("Erro ao carregar contador");
    }
  }

  // Processa o reset do contador
  async handleReset() {
    try {
      // Confirma antes de resetar
      if (!confirm('Tem certeza que deseja resetar o contador? Esta ação não pode ser desfeita.')) {
        return;
      }

      this.resetButton.disabled = true;
      this.resetButton.textContent = 'Resetando...';

      // Envia mensagem para o background script
      const response = await chrome.runtime.sendMessage({ type: "RESET_COUNTER" });
      
      if (response.success) {
        await this.updateCounter();
        this.showSuccess("Contador resetado com sucesso!");
      } else {
        throw new Error(response.error || "Erro desconhecido");
      }
    } catch (error) {
      console.error("[Shorts Counter] Erro ao resetar contador:", error);
      this.showError("Erro ao resetar contador");
    } finally {
      this.resetButton.disabled = false;
      this.resetButton.textContent = 'Resetar contador';
    }
  }

  // Mostra mensagem de erro
  showError(message) {
    this.counterElement.textContent = "Erro";
    this.counterElement.style.color = "#ff6b6b";
    setTimeout(() => {
      this.counterElement.style.color = "#fff";
      this.updateCounter();
    }, 2000);
  }

  // Mostra mensagem de sucesso
  showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.textContent = message;
    successDiv.style.cssText = `
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: #00e676;
      color: #222;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 1000;
    `;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
      document.body.removeChild(successDiv);
    }, 2000);
  }
}

// Inicializa o popup quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  new ShortsCounterPopup();
});
  