# Shorts Counter

> Extensão para Chrome que **conta quantos Shorts do YouTube e Reels do Instagram você assistiu** no navegador.  
> Simples, leve e direto para quem quer monitorar o próprio tempo gasto com vídeos curtos.

---

## ⚠️ Aviso

> - Projeto experimental, pode conter bugs.  
> - Use por sua conta e risco.

---

## Funcionalidades

> ✅ Conta automaticamente quantos Shorts (YouTube) e Reels (Instagram) você assistiu.  
> ✅ Mostra o total em um popup ao clicar no ícone da extensão.  
> ✅ Permite zerar o contador a qualquer momento.  
> ✅ Contador permanece salvo mesmo fechando o navegador.

---

## Como instalar

> 1️⃣ Baixe ou clone este repositório.  
>
> 2️⃣ Acesse `chrome://extensions/` no Chrome e ative o modo desenvolvedor.  
>
> 3️⃣ Clique em **Carregar sem compactação** e selecione a pasta do projeto.

---

## Como usar

> - Basta navegar pelos Shorts do YouTube ou Reels do Instagram normalmente.  
> - O contador será atualizado automaticamente.  
> - Clique no ícone da extensão para ver ou resetar a contagem.

---

## Estrutura dos arquivos

> - `background.js` — Lida com a contagem e armazenamento dos dados.  
> - `content.js` — Detecta troca de vídeos e envia para o contador.  
> - `popup.html` + `popup.js` — Interface do popup.  
> - `manifest.json` — Manifesto da extensão.

---

## Licença

> Este projeto é experimental e sem garantia, sendo disponibilizado sob a [licença MIT](https://github.com/caue-r/Shorts-Counter/blob/main/LICENSE).
