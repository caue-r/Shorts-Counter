# Shorts Counter

Extensão para Chrome que conta quantos Shorts do YouTube e Reels do Instagram você assistiu no navegador.

## Como funciona

- Ao assistir um novo vídeo curto (YouTube Shorts ou Instagram Reels), o contador da extensão é incrementado.
- O total é exibido em um popup acessível pelo ícone da extensão na barra do Chrome.
- O contador pode ser zerado a qualquer momento.

## Instalação

1. Baixe este repositório.
2. Abra `chrome://extensions/` no Chrome.
3. Ative o modo desenvolvedor.
4. Clique em "Carregar sem compactação" e selecione a pasta do projeto.

## Funcionalidades

- Conta vídeos assistidos em:
  - YouTube Shorts (`youtube.com/shorts/*`)
  - Instagram Reels (`instagram.com/reels/*`)
- Contador persistente, mesmo ao fechar o navegador.
- Botão para resetar o contador.

## Estrutura dos arquivos

- `background.js` — Gerencia a contagem e armazenamento.
- `content.js` — Detecta mudança de vídeo nas páginas.
- `popup.html` — Popup visual da extensão.
- `popup.js` — Lógica do popup.
- `manifest.json` — Manifesto da extensão.

## Licença

> Este projeto é experimental e sem garantia, sendo disponibilizado sob a [licença MIT](https://github.com/caue-r/Shorts-Counter/blob/main/LICENSE).
