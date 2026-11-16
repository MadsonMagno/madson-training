# Registro de Testes e Validação — Madson Training v2

## 1. Verificações automatizadas (executadas)

| Caso | Procedimento | Resultado |
|---|---|---|
| Sintaxe JS | `node --check assets/app.js` e `node --check assets/data.js` | Aprovado |
| Integridade do JSON | Parse de `manifest.json` | Aprovado |
| Ícones | `icon-192.png` (29 KB), `icon-512.png` (210 KB), `icon-maskable-512.png` (133 KB) | Aprovado |
| Totais de séries | A 22 · B 22 · C 19 (21 com opcionais) · Qua 13 · Sex 7 | Aprovado |
| Faixa semanal | Seg/Dom sem rotina; Ter A · Qua casa · Qui B · Sex casa · Sáb C | Aprovado |
| Smoke test em DOM simulado | jsdom carregando `index.html` + `data.js` + `app.js`: 40 verificações (render, séries, auto-start, transição, pausa, presets, 100%, reset global e por rotina, opcional, persistência, dia atual) | 40/40 aprovadas |

## 2. Roteiro de teste manual — desktop

| Caso | Procedimento | Resultado |
|---|---|---|
| Accordions | Abrir/fechar ambientes e rotinas; apenas uma rotina aberta por vez | A validar |
| Progresso por rotina | Marcar séries e conferir % no cartão, header e barra fixa | A validar |
| Reset global | Botão oculto sem séries; visível após o primeiro check; confirmação antes de apagar | A validar |
| Reset por rotina | "Recomeçar esta rotina" limpa apenas aquela rotina | A validar |
| Exercício opcional | Paralelas não alteram o denominador do progresso | A validar |
| Celebração | 100% dispara overlay com fogos uma única vez; reset permite repetir | A validar |
| Persistência | Recarregar mantém séries, rotina aberta e descansos por exercício | A validar |
| Temas | Alternância claro/escuro com contraste legível | A validar |
| Movimento reduzido | `prefers-reduced-motion` remove animações e fogos | A validar |

## 3. Roteiro de teste manual — mobile (Brave/Chrome Android)

| Caso | Procedimento | Resultado |
|---|---|---|
| Auto-start | Marcar série inicia o descanso no tempo do exercício | A validar |
| Última série do treino | Não inicia descanso; vai direto para a celebração | A validar |
| Transição | Última série de um exercício mostra "TRANSIÇÃO" e o próximo exercício | A validar |
| Presets | Um toque define e inicia (30s/1min/1m30/2min/3min/livre) | A validar |
| Sinal de início | Anel pulsa e bipe soa ao iniciar | A validar |
| Alarme com tela bloqueada | Bloquear o celular durante o descanso e aguardar | A validar |
| Assumir áudio | Com Spotify tocando, testar o toggle e observar se a mídia abaixa/pausa | A validar |
| Vibração | Padrão longo no fim do descanso | A validar |
| Barra fixa | Rolar a página e confirmar que a barra compacta aparece no topo | A validar |
| Instalação | Nome do atalho "Treino" após instalar | A validar |
| Offline | Instalar, ativar modo avião e reabrir | A validar |

## 4. Observações
- Teste de Service Worker exige `http(s)` (GitHub Pages ou servidor local). Em `file://` o app funciona sem cache.
- O nome do atalho só muda no Android após desinstalar e instalar novamente.
- Após publicar, pode ser necessário fechar e reabrir o app instalado para o novo Service Worker assumir.
- Se o alarme não tocar com a tela bloqueada, verificar a otimização de bateria do Android para o navegador/PWA.
