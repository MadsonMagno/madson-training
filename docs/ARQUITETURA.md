# Arquitetura Técnica — Madson Training v2

## 1. Visão geral
Aplicação web client-side autônoma (SPA estática) em HTML5, CSS3 e JavaScript ES6+ puro. Sem bundler, transpiler, framework ou backend. Instalável como PWA e funcional offline.

## 2. Estrutura de arquivos
| Arquivo | Responsabilidade |
|---|---|
| `index.html` | Estrutura: header, resumo, rotinas, rodapé com cronômetro, diálogos e overlay de celebração |
| `assets/styles.css` | Tokens de tema, layout mobile-first, anel do timer, barra fixa, celebração |
| `assets/data.js` | Dados puros: `WORKOUTS`, `SAFETY`, `DEFAULT_REST` (expostos em `window`) |
| `assets/app.js` | Render, estado, progresso, motor do cronômetro, áudio, celebração, registro do SW |
| `sw.js` | Service Worker (na raiz, para escopo total) |
| `manifest.json` | Metadados de instalação |
| `assets/icons/` | Ícones 192, 512 e maskable |

Scripts clássicos (não `type="module"`), para que o app também funcione aberto direto do disco (`file://`).

## 3. Modelo de dados (`assets/data.js`)
```js
WORKOUTS[] = {
  id, group: "gym" | "home", symbol,
  title, subtitle, focus[],
  items[] = { name, prescription, desc, query, sets, rest?, optional? }
}
```
O `id` de cada exercício é derivado de `${workout.id}-${índice}`. O descanso padrão é 30s (`DEFAULT_REST`). Não há grade de dias: o usuário escolhe o ambiente (academia/casa) e depois o treino.

## 4. Persistência
Chave única `madson.training.state.v4`:

```js
{
  sets:       { "gym-a-1": [0,1,2] },   // séries concluídas
  celebrated: { "gym-a": true },        // celebração já exibida
  started:    { "gym-a": 1730000000 },  // primeiro check (para duração)
  rest:       { "gym-a-1": 60 },        // descanso por exercício
  open:       "gym-a",                  // rotina aberta
  prefs:      { autoRest, sound, duck, rest }
}
```
Chave de tema: `madson.training.theme.v1` (`dark` | `light`).

A chave legada `madson.training.progress.v3` **não é migrada**: os IDs do programa antigo foram descontinuados. Ela permanece intacta no navegador, sem risco de perda.

## 5. Componentes

### 5.1 Render (`renderWorkouts`)
Gera ambientes (academia/casa), rotinas, accordions e botões de série. Uma rotina aberta por vez (`state.open`), persistida entre recarregamentos.

### 5.2 Progresso (`updateProgress`)
- Denominador = soma de `sets` dos exercícios **não opcionais**.
- Atualiza três camadas: cartão da rotina, resumo do header e barra fixa.
- `#reset-all` fica `hidden` enquanto não houver nenhuma série marcada.

### 5.3 Barra fixa (`syncStickyVisibility`)
Ouve `scroll` e compara `getBoundingClientRect().bottom` do resumo com 0; quando o resumo sai da tela, a barra compacta desliza para o topo (com `safe-area-inset-top`).

### 5.4 Celebração
Disparada no `toggleSet` quando `done >= total` e a rotina ainda não foi celebrada. Canvas com partículas (5 explosões em ~2s), chime, vibração; ignora animação com `prefers-reduced-motion`.

## 6. Motor do cronômetro
```
timer = { duration, remaining, endsAt, startedAt, running, free, mode, exId, tickId }
```
- **Contagem regressiva:** `endsAt = Date.now() + remaining*1000`; o `setInterval` de 250ms apenas atualiza a UI (evita drift).
- **Modo livre:** conta crescente a partir de `startedAt`.
- **Auto-start:** disparado após marcar série, exceto quando a rotina atinge 100%. O tempo vem de `restFor(exId)` (padrão 30s) e o modo (`serie` ou `transicao`) define o rótulo.
- **Tema do descanso:** na última série de um exercício o rótulo mostra "TRANSIÇÃO" e o nome do próximo exercício.

### 6.1 Áudio
- `AudioContext` criado/retomado no primeiro gesto (`pointerdown`/`keydown`).
- Alarme **agendado** em `ctx.currentTime + remaining`: 9 hits staccato (sawtooth 1250→1650 Hz) + reforço grave, ~3s. Como está agendado no grafo de áudio, dispara no instante exato mesmo com a aba em segundo plano.
- Oscilador de ganho zero durante o descanso mantém o contexto ativo (não produz som).
- Pausar/reiniciar chamam `cancelAlarm()`.
- `navigator.audioSession.type = "transient"` quando suportado (Safari/iOS).
- Modo *"Tentar assumir o áudio"*: WAV sintetizado em memória (`Blob` + `<audio>`), que pode fazer o sistema conceder foco de mídia.

## 7. PWA
- `manifest.json`: `short_name "Treino"`, `name "Treino do Aluno"`, `display standalone`, ícones `any` + `maskable`.
- `sw.js` versão `treino-v2.0.0`:
  - **install:** pré-cache dos arquivos base + `skipWaiting()`.
  - **activate:** remove caches de versões antigas + `clients.claim()`.
  - **fetch:** navegação em *network-first* (com fallback `index.html`), assets em *stale-while-revalidate* (`ignoreSearch` para ignorar `?v=`).
- Registro apenas em `http(s)`; em `file://` o app segue funcionando sem cache.

## 8. Acessibilidade
`aria-expanded` nos accordions, `aria-pressed` nas séries, `role="timer"`, `aria-live` no toast, foco visível dourado, alvos de toque ≥ 38px e desativação global de animações com `prefers-reduced-motion`.
