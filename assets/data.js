/* ============================================================
   Madson Training v2 — Programa de treino
   ------------------------------------------------------------
   Cada exercício:
     name          nome exibido
     prescription  texto da prescrição (séries × repetições)
     desc          orientação técnica
     query         termo de busca usado nas referências
     sets          quantidade de séries (entra no progresso)
     rest          descanso padrão em segundos (editável pelo usuário)
     optional      true = não entra no cálculo de progresso
   ============================================================ */
(function () {
  "use strict";

  const DEFAULT_REST = 30;

  const WORKOUTS = [
    {
      id: "gym-a",
      group: "gym",
      symbol: "A",
      title: "Full Body A",
      subtitle: "Glúteo máximo + quadríceps",
      focus: ["glúteo", "quadríceps"],
      items: [
        {
          name: "Leg press 45°",
          prescription: "3 × 10–12",
          sets: 3,
          desc: "Comece com uma série bilateral de aquecimento e faça as séries de trabalho com controle. Trabalho unilateral apenas se a execução estiver boa e o joelho tolerar.",
          query: "leg press 45 graus execução correta",
        },
        {
          name: "Hip Thrust",
          prescription: "4 × 8–12",
          sets: 4,
          desc: "Segure 1–2 segundos no topo, sem hiperestender a lombar.",
          query: "hip thrust execução correta",
        },
        {
          name: "Mesa flexora",
          prescription: "3 × 10–12",
          sets: 3,
          desc: "Priorize amplitude confortável e controle na volta.",
          query: "mesa flexora execução correta",
        },
        {
          name: "Abdutora",
          prescription: "3 × 15–20",
          sets: 3,
          desc: "Movimento controlado, sem impulso. Pausa curta na abertura máxima.",
          query: "cadeira abdutora execução correta",
        },
        {
          name: "Chest Press",
          prescription: "3 × 10–12",
          sets: 3,
          desc: "Costas apoiadas e ombros estáveis. Empurre com controle, sem travar os cotovelos.",
          query: "chest press máquina execução correta",
        },
        {
          name: "Barra pronada no Graviton",
          prescription: "3 × 8–12",
          sets: 3,
          desc: "Reduza a assistência gradualmente conforme ganhar força e evite elevar os ombros.",
          query: "barra fixa pronada graviton execução",
        },
        {
          name: "Panturrilha em pé",
          prescription: "3 × 15–20",
          sets: 3,
          desc: "Alongue e contraia em toda a amplitude, sem impulsos.",
          query: "panturrilha em pé execução",
        },
      ],
    },

    {
      id: "gym-b",
      group: "gym",
      symbol: "B",
      title: "Full Body B",
      subtitle: "Posteriores + glúteos",
      focus: ["posteriores", "glúteo"],
      items: [
        {
          name: "Stiff / RDL",
          prescription: "3 × 8–12",
          sets: 3,
          desc: "Movimento partindo do quadril, coluna neutra e joelhos levemente flexionados.",
          query: "stiff levantamento terra romeno RDL execução",
        },
        {
          name: "Agachamento búlgaro",
          prescription: "3 × 8–10 por perna",
          sets: 3,
          desc: "Comece com amplitude moderada. Não force profundidade.",
          query: "agachamento búlgaro execução correta",
        },
        {
          name: "Flexora unilateral",
          prescription: "3 × 10–12",
          sets: 3,
          desc: "Controle a volta e mantenha o quadril estável.",
          query: "mesa flexora unilateral execução",
        },
        {
          name: "Abdutora",
          prescription: "2 × 15–20",
          sets: 2,
          desc: "Movimento controlado, sem impulso.",
          query: "cadeira abdutora execução correta",
        },
        {
          name: "Remada baixa",
          prescription: "3 × 10–12",
          sets: 3,
          desc: "Priorize a retração escapular antes de puxar.",
          query: "remada baixa execução correta",
        },
        {
          name: "Fly na máquina",
          prescription: "3 × 10–15",
          sets: 3,
          desc: "Movimento controlado, sem alongamento excessivo do ombro.",
          query: "voador peitoral máquina execução",
        },
        {
          name: "Elevação lateral",
          prescription: "2 × 12–15",
          sets: 2,
          desc: "Execute sem balanço, elevando de forma controlada.",
          query: "elevação lateral com halteres execução",
        },
        {
          name: "Panturrilha sentado",
          prescription: "3 × 15–20",
          sets: 3,
          desc: "Amplitude completa e pausa curta no alongamento.",
          query: "panturrilha sentado execução",
        },
      ],
    },

    {
      id: "gym-c",
      group: "gym",
      symbol: "C",
      title: "Full Body C",
      subtitle: "Pernas completas + glúteo",
      focus: ["pernas", "glúteo"],
      items: [
        {
          name: "Agachamento no Smith ou hack",
          prescription: "3 × 10–12",
          sets: 3,
          desc: "Amplitude definida pela qualidade do movimento e pela tolerância patelofemoral.",
          query: "agachamento smith máquina hack execução",
        },
        {
          name: "Hip Thrust",
          prescription: "3 × 10–12",
          sets: 3,
          desc: "Costas apoiadas no banco, queixo levemente recolhido e contração no topo.",
          query: "hip thrust execução correta",
        },
        {
          name: "Step-up",
          prescription: "2 × 10 por perna",
          sets: 2,
          desc: "Degrau baixo ou moderado, sem impulsionar excessivamente com a perna de baixo.",
          query: "step up banco com halteres execução",
        },
        {
          name: "Mesa flexora",
          prescription: "3 × 12",
          sets: 3,
          desc: "Ritmo controlado na fase de volta.",
          query: "mesa flexora execução correta",
        },
        {
          name: "Abdutora",
          prescription: "2 × 15–20",
          sets: 2,
          desc: "Movimento controlado, sem impulso.",
          query: "cadeira abdutora execução correta",
        },
        {
          name: "Barra pronada no Graviton",
          prescription: "3 × 8–12",
          sets: 3,
          desc: "Pegada na largura dos ombros; reduza a assistência com o tempo.",
          query: "barra fixa pronada graviton execução",
        },
        {
          name: "Chest Press ou supino máquina",
          prescription: "3 × 10–12",
          sets: 3,
          desc: "Escolha uma opção e mantenha o padrão de execução entre as semanas.",
          query: "supino máquina execução correta",
        },
        {
          name: "Paralelas assistidas",
          prescription: "2 × 8–12",
          sets: 2,
          desc: "Cotovelos próximos ao corpo enfatizam tríceps. Não force amplitude se houver desconforto no ombro.",
          query: "paralelas assistidas graviton execução",
          optional: true,
        },
      ],
    },

    {
      id: "home-qua",
      group: "home",
      symbol: "Q",
      title: "Casa · Estabilidade",
      subtitle: "Glúteo médio + controle motor",
      focus: ["estabilidade", "glúteo médio"],
      items: [
        {
          name: "Caminhada lateral com miniband",
          prescription: "2 × 12 passos cada lado",
          sets: 2,
          desc: "Base semiagachada, joelhos alinhados aos pés e passos curtos.",
          query: "lateral band walk miniband execução",
        },
        {
          name: "Monster Walk",
          prescription: "2 × 12 passos",
          sets: 2,
          desc: "Deslocamento diagonal com a faixa acima dos joelhos, sem arrastar os pés.",
          query: "monster walk miniband execução",
        },
        {
          name: "Abdução de quadril com elástico",
          prescription: "2 × 15 por perna",
          sets: 2,
          desc: "Tronco estável, sem inclinar para compensar.",
          query: "abdução de quadril com elástico em pé",
        },
        {
          name: "TKE com elástico",
          prescription: "2 × 15 por perna",
          sets: 2,
          desc: "Extensão terminal do joelho lenta e controlada, sem dor.",
          query: "terminal knee extension TKE elástico execução",
        },
        {
          name: "Equilíbrio unilateral",
          prescription: "3 × 30 segundos",
          sets: 3,
          desc: "Apoio em uma perna, quadril nivelado. Evolua fechando os olhos só se estiver muito estável.",
          query: "equilíbrio unilateral joelho reabilitação",
        },
        {
          name: "Prancha lateral",
          prescription: "2 × 30–40 segundos",
          sets: 2,
          desc: "Quadril elevado e alinhado; reduza o tempo se perder a posição.",
          query: "prancha lateral execução correta",
        },
      ],
    },

    {
      id: "home-sex",
      group: "home",
      symbol: "S",
      title: "Casa · Condicionamento",
      subtitle: "Cardio leve + mobilidade",
      focus: ["condicionamento", "mobilidade"],
      items: [
        {
          name: "Esteira: caminhada ou trote leve",
          prescription: "1 × conforme tolerância",
          sets: 1,
          desc: "A corrida segue a progressão liberada pelo fisioterapeuta. Não corra se as pernas ainda estiverem cansadas da quinta.",
          query: "trote leve esteira progressão reabilitação LCA",
        },
        {
          name: "Ponte de glúteo com miniband",
          prescription: "2 × 15",
          sets: 2,
          desc: "Empurre pelos calcanhares e contraia os glúteos no topo.",
          query: "ponte de glúteo com miniband execução",
        },
        {
          name: "Ostra com miniband",
          prescription: "2 × 15",
          sets: 2,
          desc: "Deitado de lado, abra o joelho de cima sem girar o quadril.",
          query: "clam shell ostra miniband execução",
        },
        {
          name: "Mobilidade de quadril",
          prescription: "1 × 5 min",
          sets: 1,
          desc: "Movimentos lentos e sem dor. Respire durante o alongamento.",
          query: "mobilidade de quadril rotina 5 minutos",
        },
        {
          name: "Mobilidade de tornozelo",
          prescription: "1 × 3 min",
          sets: 1,
          desc: "Joelho em direção à parede mantendo o calcanhar no chão.",
          query: "mobilidade de tornozelo na parede execução",
        },
      ],
    },
  ];

  const SAFETY = {
    volume: [
      "Glúteo máximo: 15–18 séries equivalentes",
      "Glúteo médio: 7 séries diretas",
      "Quadríceps: 8–11 séries",
      "Posteriores: 9 séries",
      "Panturrilhas: 6 séries",
      "Peito e costas: 6–9 séries cada",
    ],
    care: [
      "Treine as duas pernas, sem negligenciar o lado esquerdo.",
      "Não coloque mais peso na perna direita para compensar a perda muscular.",
      "Compare força e controle entre os lados, de preferência com avaliação objetiva.",
      "Ausência de dor não significa recuperação completa da força.",
      "Observe a resposta dos joelhos até o dia seguinte ao treino.",
      "Inchaço, dor persistente, falseio ou travamento: interrompa a progressão e procure avaliação.",
    ],
    progression: [
      "Escolha uma carga que permita executar o exercício corretamente.",
      "Termine a maioria das séries sentindo que conseguiria fazer mais 2 ou 3 repetições.",
      "Ao atingir o topo da faixa em todas as séries, aumente a carga em ~2,5–5%.",
      "Volte à parte inferior da faixa e repita o processo.",
      "Evite falha muscular nos exercícios que exigem equilíbrio ou controle dos joelhos.",
    ],
  };

  window.DEFAULT_REST = DEFAULT_REST;
  window.WORKOUTS = WORKOUTS;
  window.SAFETY = SAFETY;
})();
