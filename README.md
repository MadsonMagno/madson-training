# Treino do Aluno — Madson Training

> Painel mobile de treino, séries e descanso. HTML, CSS e JavaScript puros — sem build, sem backend.

Aplicação web estática (PWA) voltada ao acompanhamento de rotinas de musculação e reabilitação de joelho: controle de séries por exercício, progresso por rotina, cronômetro de descanso inteligente e persistência local.

**Versão atual: v2.0** — novo programa Full Body + cronômetro reformulado.

---

## 🎯 Objetivo

Interface limpa, rápida e 100% responsiva para uso durante o treino pelo celular (testada em Brave/Chrome Mobile no Android), sem cadastro, sem servidor e sem instalação pesada.

---

## ✨ Funcionalidades (v2)

### Programa
- **Fluxo em dois níveis, sem dias fixos**: você escolhe **Academia** ou **Casa** e, dentro do ambiente, o treino que vai fazer.
  - **Academia:** Full Body A (glúteo máximo + quadríceps, 22 séries) · Full Body B (posteriores + glúteos, 22) · Full Body C (pernas completas + glúteo, 19)
  - **Casa:** Estabilidade (glúteo médio + controle motor, 13) · Condicionamento (cardio leve + mobilidade, 7)
- Treine na ordem e na frequência que a semana permitir — o app não trava a rotina por dia da semana.
- Exercícios marcados como **opcionais** (ex.: paralelas assistidas) não entram no cálculo de progresso.
- Notas de segurança, progressão de carga, volume semanal e cuidados com os dois joelhos direto na tela.

### Controle de treino
- **Séries individuais** com marcação/desmarcação.
- **Progresso por rotina** (nunca do plano inteiro), com barra sempre visível.
- **Barra fixa no topo** ao rolar a página, com nome do treino, % e séries concluídas.
- **Reiniciar condicional**: o botão global só aparece quando existe pelo menos uma série marcada. Cada rotina tem o próprio "Recomeçar esta rotina".
- **Celebração aos 100%**: mensagem, estatísticas e fogos em `<canvas>` — uma vez por rotina, respeitando `prefers-reduced-motion`.
- Persistência total em `localStorage` (progresso, rotina aberta, descanso por exercício e preferências).

### Cronômetro
- **Anel circular discreto** no rodapé — a barra horizontal fica reservada ao progresso do treino.
- **Presets de um toque**: 30s · 1 min · 1m30 · 2 min · 3 min · Livre.
- **30 segundos por padrão**, ajustável por exercício (o ajuste é memorizado).
- **Auto-start** ao marcar uma série, com descanso **de transição** na última série de cada exercício — e **nunca** na última série do treino.
- **Sinal de início**: anel pulsando, texto "Descanso iniciado" e bipe curto.
- **Alarme de fim** em 3 rajadas (~3s) agendadas no `AudioContext`, com vibração longa. Por ser agendado no tempo exato, funciona mesmo com a tela bloqueada.
- **Cronômetro livre** (contagem crescente) para tempos sem duração definida.

### Técnico
- Temas claro e escuro.
- Modal de referências (vídeos, imagens, GIFs) sob demanda.
- **PWA instalável** com Service Worker: network-first para o app, cache para offline.
- Acessibilidade: ARIA, foco visível, navegação por teclado, respeito a movimento reduzido.

**v2.1:** removida a grade fixa de dias da semana — o treino é escolhido livremente a cada sessão.

---

## 🛠️ Tecnologias

- **HTML5** semântico
- **CSS3** (variáveis, grid, flexbox, animações, temas)
- **JavaScript ES6+** (módulo IIFE, sem dependências)
- **Web Audio API**, **Vibration API**, **Canvas 2D**, **Service Worker**, **localStorage**

---

## 📁 Estrutura

```text
madson-training/
├── index.html              # Estrutura da aplicação
├── sw.js                   # Service Worker (na raiz para escopo total)
├── manifest.json           # Manifesto PWA
├── assets/
│   ├── styles.css          # Estilos e temas
│   ├── app.js              # Render, progresso, timer, celebração
│   ├── data.js             # Programa de treino (WORKOUTS + notas)
│   ├── logo.png            # Identidade visual (fonte)
│   └── icons/              # Ícones 192, 512 e maskable
├── docs/
│   ├── ARQUITETURA.md
│   ├── REQUISITOS.md
│   ├── ROADMAP.md
│   └── TESTES.md
└── README.md
```

---

## 🚀 Uso

### Online (uso normal)
Abra no celular e, no menu do navegador, escolha **Adicionar à tela inicial** / **Instalar aplicativo**.

👉 **https://MadsonMagno.github.io/madson-training/**

### Local
Basta abrir `index.html` no navegador. Tudo funciona, **exceto** o cache offline — navegadores não registram Service Worker em `file://`.

Para testar o Service Worker localmente, sirva a pasta com qualquer servidor estático:

```bash
python -m http.server 8080
# abra http://localhost:8080
```

---

## 🔄 Atualizar o site

```bash
git add .
git commit -m "feat: descrição da mudança"
git push origin main
```

O GitHub Pages publica em instantes. Depois de alterações grandes, incremente a constante `VERSION` em `sw.js` para descartar o cache antigo.

---

## ⚠️ Limitações conhecidas

- **Ducking de áudio:** não é possível baixar o volume de Spotify/YouTube a partir de uma página web (não existe API para isso; apps nativos usam *audio focus* do sistema). O alarme toca **por cima** da música. A opção *"Tentar assumir o áudio"* usa um elemento `<audio>` real, que em alguns aparelhos faz o sistema abaixar ou pausar a mídia — comportamento do Android/Chrome, não controlável.
- **Tela bloqueada:** o alarme é pré-agendado no `AudioContext` para tocar no instante exato. Ainda assim, economizadores de bateria agressivos podem suspender o áudio da aba.
- **Sem sincronização:** os dados ficam no navegador do aparelho. Limpar os dados do site apaga o progresso.
- **Nome do atalho:** o Android só atualiza o nome de um PWA já instalado após desinstalar e instalar novamente.
- **Orientação médica:** o app é um guia de registro. A progressão de carga e a liberação para impacto seguem o profissional responsável.

---

## 📄 Licença

Ainda não definida formalmente pelo autor.
