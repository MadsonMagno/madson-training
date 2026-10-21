# Arquitetura Técnica — Madson Training

## 1. Visão Geral
Aplicação web client-side autônoma (Single Page Application estática) desenvolvida em HTML5 semântico, CSS3 e JavaScript ES6+ puro (Vanilla JS), sem bundlers, transpilers ou frameworks.

## 2. Estrutura de Arquivos
- `index.html`: Contém a estrutura da aplicação, estilos CSS embutidos (otimizados para mobile-first), marcação semântica e rotinas lógicas em JavaScript.
- `assets/logo.png`: Ativo de identidade visual do projeto.
- `docs/`: Documentação de requisitos, arquitetura, testes e roadmap.

## 3. Componentes e Fluxo de Dados
- **Renderização Dinâmica (`renderWorkouts`)**: Gera iterativamente os blocos de treinos (Gym A/B, Home 1/2), accordions, controles de séries e botões de referências a partir da constante estruturada `WORKOUTS`.
- **Persistência (`localStorage`)**:
  - Chave `madson.training.progress.v3`: Armazena mapa `{ [exerciseId]: [indicesDeSeriesConcluidas] }`.
  - Chave `madson.training.theme.v1`: Armazena a preferência de tema (`dark` ou `light`).
- **Cálculo de Progresso (`updateProgress`)**:
  - Progresso individual por rotina: Calcula a porcentagem baseada estritamente nas séries concluídas versus o total de séries daquela rotina específica.
  - Painel superior: Reflete o progresso do treino atualmente expandido/ativo.
- **Cronômetro de Descanso**:
  - Baseado em `setInterval` e diferencial de tempo com `Date.now() + remaining * 1000` para evitar drift temporal em segundo plano.
  - Alerta sonoro via Web Audio API (`AudioContext`, gerador de oscilador senoidal) e vibração via `navigator.vibrate` quando suportado pelo navegador.
- **Temas**: Alternância dinâmica de atributos `data-theme` no elemento raiz `<html>` com transições de paleta preta (#101010) e dourada (#d4af37).
