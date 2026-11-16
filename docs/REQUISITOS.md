# Especificação de Requisitos — Madson Training v2

## 1. Requisitos Funcionais (RF)

| ID | Descrição | Status |
|---|---|---|
| RF01 | Visualização de 5 sessões (Academia A/B/C e Casa Qua/Sex) em accordions por ambiente. | Implementado |
| RF02 | Faixa semanal Seg→Dom com destaque do dia atual e atalho para a rotina do dia. | Implementado |
| RF03 | Controle individual de séries com alternância pendente/concluída. | Implementado |
| RF04 | Progresso calculado por rotina, exibido no cartão, no header e na barra fixa. | Implementado |
| RF05 | Persistência local de progresso, rotina aberta, descansos e preferências. | Implementado |
| RF06 | Cronômetro de descanso com presets (30s, 1min, 1m30, 2min, 3min) e modo livre. | Implementado |
| RF07 | Descanso padrão de 30s, ajustável por exercício e memorizado. | Implementado |
| RF08 | Início automático do descanso ao marcar série, com descanso de transição entre exercícios. | Implementado |
| RF09 | Nenhum descanso automático após a última série do treino. | Implementado |
| RF10 | Sinal visual e sonoro no início do descanso (pulso no anel + bipe). | Implementado |
| RF11 | Alarme de fim de descanso em 3 rajadas, agendado no AudioContext, com vibração. | Implementado |
| RF12 | Opção "Tentar assumir o áudio" (elemento `<audio>`, pode pausar/abaixar mídia externa). | Implementado |
| RF13 | Botão global de reinício oculto enquanto não houver série marcada. | Implementado |
| RF14 | Reinício individual por rotina, com confirmação. | Implementado |
| RF15 | Tela de celebração ao atingir 100% da rotina, com animação de fogos (uma vez por rotina). | Implementado |
| RF16 | Barra de progresso fixa no topo ao rolar a página. | Implementado |
| RF17 | Modal de referências (vídeos, imagens, GIFs) por exercício. | Implementado |
| RF18 | Alternância entre tema escuro e claro. | Implementado |
| RF19 | Marcação de exercícios opcionais fora do denominador do progresso. | Implementado |
| RF20 | Instalação como PWA com nome "Treino do Aluno" / atalho "Treino". | Implementado |
| RF21 | Funcionamento offline após o primeiro carregamento. | Implementado |
| RF22 | Exportação/importação de progresso entre dispositivos. | Planejado |

## 2. Requisitos Não Funcionais (RNF)

| ID | Descrição | Status |
|---|---|---|
| RNF01 | Interface mobile-first, operável com uma mão, alvos de toque ≥ 38px. | Implementado |
| RNF02 | Arquitetura estática autônoma, sem backend e sem dependências externas. | Implementado |
| RNF03 | Carregamento rápido: nenhuma biblioteca, nenhuma fonte remota. | Implementado |
| RNF04 | Identidade visual preta e dourada (`#f4c430` no tema escuro). | Implementado |
| RNF05 | Acessibilidade: ARIA, foco visível, teclado e `prefers-reduced-motion`. | Implementado |
| RNF06 | Cronômetro preciso mesmo com throttling de timers (base em `Date.now()`). | Implementado |
| RNF07 | Atualização imediata após deploy (network-first para navegação). | Implementado |
| RNF08 | Dados do usuário nunca saem do dispositivo. | Implementado |

## 3. Fora de escopo (v2)
- Ducking de áudio de terceiros (impossível via web).
- Sincronização em nuvem e múltiplos usuários.
- Log de histórico com gráficos de evolução (previsto na Fase 3 do roadmap).
