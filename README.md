# Madson Training

> Mobile-first workout tracker built with vanilla HTML, CSS and JavaScript.

Aplicação web estática, leve e intuitiva voltada para o acompanhamento prático de rotinas de treino (Academia e Casa), controle de séries por exercício, cronômetro de descanso integrado e persistência local no navegador.

---

## 🎯 Objetivo do MVP

Oferecer uma interface limpa, rápida e 100% responsiva para uso durante os treinos pelo smartphone (especialmente testada para Brave Mobile no Android), dispensando cadastros, dependência de conexões de backend ou instalação de aplicativos pesados.

---

## ✨ Funcionalidades

- **Interface Mobile-First:** Design otimizado para operação com apenas uma mão em telas de smartphones.
- **Identidade Visual Premium:** Estilo escuro com detalhes em dourado inspirado na Academia Espaço Fitness DF.
- **Alternância de Temas:** Suporte dinâmico a tema escuro (*dark*) e claro (*light*).
- **Rotinas em Accordions:**
  - **Academia:** Treino A (Quadríceps, Peito, Costas) e Treino B (Glúteos, Posteriores, Costas, Lombar).
  - **Casa:** Rotina 1 (Resistência e Tronco) e Rotina 2 (Joelho e Elásticos).
- **Controle Individual de Séries:** Botões interativos para marcar cada série realizada.
- **Progresso Segmentado:** Percentual e barra de progresso calculados exclusivamente com base na rotina em execução.
- **Persistência Local (`localStorage`):** O progresso é gravado automaticamente e mantido mesmo após fechar ou recarregar o navegador.
  > ⚠️ **Atenção:** Os dados ficam armazenados localmente no navegador do dispositivo atual e não sincronizam automaticamente entre aparelhos ou navegadores distintos.
- **Cronômetro de Descanso Configurável:**
  - Padrão inicial de 30 segundos, editável para qualquer intervalo desejado.
  - Funções de Iniciar, Pausar e Reiniciar.
  - Alerta sonoro via Web Audio API e vibração em navegadores compatíveis.
- **Consulta de Referências:** Modal integrado com buscas diretas por demonstrações em vídeo, imagens e GIFs de execução.
- **Reinicialização Segura:** Botão para zerar treinos com diálogo de confirmação prévia para evitar perda acidental.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5:** Estrutura semântica e acessível.
- **CSS3:** Variáveis customizadas (CSS tokens), flexbox, grid, animações fluidas e suporte a temas.
- **JavaScript (ES6+):** Manipulação de DOM, gerenciamento de estado, temporizadores precisos e Web Audio API.

---

## 📁 Estrutura do Repositório

```text
madson-training/
├── index.html              # Aplicação completa (HTML, CSS e JS embutidos)
├── README.md               # Apresentação do projeto e manual de uso
├── .gitignore              # Arquivos ignorados pelo controle de versão
├── assets/
│   └── logo.png            # Ativo de imagem da aplicação
└── docs/
    ├── ARQUITETURA.md      # Detalhamento técnico da arquitetura
    ├── REQUISITOS.md       # Matriz de requisitos funcionais e não funcionais
    ├── TESTES.md           # Registro de validações e testes executados
    └── ROADMAP.md          # Próximas melhorias e evolução planejada
```

---

## 🚀 Como Executar Localmente

Como se trata de uma aplicação puramente estática, basta abrir o arquivo `index.html` em qualquer navegador:

1. Clone o repositório:
   ```bash
   git clone https://github.com/MadsonMagno/madson-training.git
   ```
2. Abra o diretório:
   ```bash
   cd madson-training
   ```
3. Abra o arquivo `index.html` no seu navegador de preferência ou utilize uma extensão como o *Live Server*.

---

## 🌐 Acesso Público Online

A aplicação está publicada e hospedada no **GitHub Pages**:

👉 **[https://MadsonMagno.github.io/madson-training/](https://MadsonMagno.github.io/madson-training/)**

Abra o link acima no navegador do celular (como Brave Mobile no Android) para utilizar o painel de treino na academia ou em casa.

---

## 🔄 Como Atualizar o Site Futuramente

Para aplicar novas alterações ao site publicado:

1. Edite o código localmente.
2. Faça commit e envie para a branch `main`:
   ```bash
   git add .
   git commit -m "feat: descrição da melhoria realizada"
   git push origin main
   ```
3. O GitHub Pages atualizará o site automaticamente em poucos instantes.

---

## ⚠️ Limitações Conhecidas

- **Áudio em Segundo Plano:** O sinal sonoro ao término do descanso pode ser pausado pelo sistema operacional caso o navegador entre em suspensão profunda ou a tela seja desligada (restrição padrão de economia de bateria de dispositivos móveis).
- **Sem Sincronização em Nuvem:** Por operar via `localStorage`, o histórico de séries não é compartilhado entre computadores e celulares.

---

## 📄 Licença

A licença deste projeto ainda não foi definida formalmente pelo autor.
