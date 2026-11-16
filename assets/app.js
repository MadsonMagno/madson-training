/* ============================================================
   Madson Training v2 — aplicação
   ============================================================ */
(function () {
  "use strict";

  const WORKOUTS = window.WORKOUTS || [];
  const SAFETY = window.SAFETY || { volume: [], care: [], progression: [] };
  const DEFAULT_REST = window.DEFAULT_REST || 30;

  const STATE_KEY = "madson.training.state.v4";
  const THEME_KEY = "madson.training.theme.v1";
  const RING_CIRC = 2 * Math.PI * 26;

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));

  const DEFAULT_STATE = () => ({
    sets: {},
    celebrated: {},
    started: {},
    rest: {},
    open: null,
    prefs: { autoRest: true, sound: true, duck: false, rest: DEFAULT_REST },
  });

  /* ------------------------ estado ------------------------ */
  function read(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, value); return true; }
    catch { toast("Não foi possível salvar neste navegador."); return false; }
  }
  function loadState() {
    const base = DEFAULT_STATE();
    try {
      const parsed = JSON.parse(read(STATE_KEY) || "{}");
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return base;
      return {
        ...base,
        ...parsed,
        prefs: { ...base.prefs, ...(parsed.prefs || {}) },
        sets: parsed.sets && typeof parsed.sets === "object" ? parsed.sets : {},
        celebrated: parsed.celebrated && typeof parsed.celebrated === "object" ? parsed.celebrated : {},
        started: parsed.started && typeof parsed.started === "object" ? parsed.started : {},
        rest: parsed.rest && typeof parsed.rest === "object" ? parsed.rest : {},
      };
    } catch { return base; }
  }
  let state = loadState();
  const saveState = () => write(STATE_KEY, JSON.stringify(state));

  /* ------------------------ utilidades ------------------------ */
  let toastTimer = null;
  function toast(message) {
    clearTimeout(toastTimer);
    const el = $("#toast");
    el.textContent = message;
    el.classList.add("visible");
    toastTimer = setTimeout(() => el.classList.remove("visible"), 2400);
  }
  function fmt(seconds) {
    const s = Math.max(0, Math.round(seconds));
    const m = Math.floor(s / 60);
    return String(m).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  }
  function fmtLong(ms) {
    const totalMin = Math.max(1, Math.round(ms / 60000));
    if (totalMin < 60) return totalMin + " min";
    return Math.floor(totalMin / 60) + "h " + String(totalMin % 60).padStart(2, "0");
  }
  function vibrate(pattern) {
    if ("vibrate" in navigator) { try { navigator.vibrate(pattern); } catch { /* ignore */ } }
  }
  const reducedMotion = () =>
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------ tema ------------------------ */
  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    $("#theme-toggle").textContent = theme === "dark" ? "☼" : "☾";
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = theme === "dark" ? "#101010" : "#f1f1f1";
  }
  setTheme(read(THEME_KEY) === "light" ? "light" : "dark");
  $("#theme-toggle").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    setTheme(next);
    write(THEME_KEY, next);
  });

  /* ------------------------ helpers de dados ------------------------ */
  const META = new Map();       // exId -> { workout, exercise, index }
  const ROUTINES = new Map();   // id -> { element, ... }

  function countSets(workout) {
    return workout.items.reduce((acc, item) => acc + (item.optional ? 0 : item.sets), 0);
  }
  function doneSets(workout) {
    return workout.items.reduce((acc, item, i) => {
      if (item.optional) return acc;
      return acc + (state.sets[workout.id + "-" + (i + 1)] || []).length;
    }, 0);
  }
  function workoutProgress(workout) {
    const total = countSets(workout);
    const done = doneSets(workout);
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  }
  function restFor(exId) {
    const saved = Number(state.rest[exId]);
    if (Number.isFinite(saved) && saved > 0) return saved;
    const global = Number(state.prefs.rest);
    return Number.isFinite(global) && global > 0 ? global : DEFAULT_REST;
  }
  /* ------------------------ render ------------------------ */
  function renderWorkouts() {
    WORKOUTS.forEach((workout) => {
      const routine = document.createElement("section");
      routine.className = "routine";
      routine.dataset.routine = workout.id;
      routine.id = "routine-" + workout.id;

      const trigger = document.createElement("button");
      trigger.className = "routine-trigger";
      trigger.type = "button";
      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute("aria-controls", workout.id + "-content");
      trigger.innerHTML =
        '<span class="routine-symbol">' + workout.symbol + "</span>" +
        '<span class="copy"><strong>' + workout.title +
        "</strong><small>" + workout.subtitle + "</small></span>" +
        '<span class="chevron">▶</span>';

      const progress = document.createElement("div");
      progress.className = "routine-progress";
      progress.innerHTML =
        '<div class="routine-progress-row"><span data-routine-label="' + workout.id + '">0 de 0 séries</span>' +
        '<strong data-routine-pct="' + workout.id + '">0%</strong></div>' +
        '<div class="progress-track"><div class="progress-fill" data-routine-fill="' + workout.id + '"></div></div>' +
        '<div class="routine-progress-row" style="margin-top:6px">' +
        '<button class="routine-restart" type="button" data-routine-restart="' + workout.id + '" hidden>Recomeçar esta rotina</button>' +
        "<span></span></div>";

      const content = document.createElement("div");
      content.className = "accordion-content routine-content";
      content.id = workout.id + "-content";
      const inner = document.createElement("div");
      inner.className = "accordion-inner";
      const list = document.createElement("div");
      list.className = "exercise-list";

      workout.items.forEach((item, index) => {
        const exId = workout.id + "-" + (index + 1);
        META.set(exId, { workout, exercise: item, index });

        const ex = document.createElement("article");
        ex.className = "exercise";
        ex.dataset.exId = exId;
        ex.dataset.sets = String(item.sets);

        const top = document.createElement("div");
        top.className = "exercise-top";
        const number = document.createElement("span");
        number.className = "exercise-index";
        number.textContent = String(index + 1).padStart(2, "0");
        const heading = document.createElement("div");
        heading.className = "exercise-heading";
        const h3 = document.createElement("h3");
        h3.className = "exercise-name";
        h3.textContent = item.name;
        const rx = document.createElement("span");
        rx.className = "prescription";
        rx.textContent = item.prescription;
        heading.append(h3, rx);
        if (item.optional) {
          const badge = document.createElement("span");
          badge.className = "optional-badge";
          badge.textContent = "opcional";
          heading.append(badge);
        }
        top.append(number, heading);

        const desc = document.createElement("p");
        desc.className = "description" + (/(não force|interrompa|dor|desconforto|inchaço)/i.test(item.desc) ? " warning" : "");
        desc.textContent = item.desc;

        const refRow = document.createElement("div");
        refRow.className = "reference-row";
        const ref = document.createElement("button");
        ref.className = "reference-btn";
        ref.type = "button";
        ref.textContent = "Ver referência";
        ref.addEventListener("click", () => openReference(item));
        refRow.append(ref);

        const tracker = document.createElement("div");
        tracker.className = "tracker";
        const head = document.createElement("div");
        head.className = "tracker-head";
        const label = document.createElement("span");
        label.className = "tracker-label";
        label.textContent = "Controle de séries";
        const count = document.createElement("span");
        count.className = "tracker-count";
        count.dataset.count = exId;
        head.append(label, count);

        const setList = document.createElement("div");
        setList.className = "set-list";
        for (let n = 0; n < item.sets; n++) {
          const btn = document.createElement("button");
          btn.className = "set-btn";
          btn.type = "button";
          btn.dataset.set = String(n);
          const mark = document.createElement("span");
          mark.className = "set-mark";
          mark.setAttribute("aria-hidden", "true");
          const text = document.createElement("span");
          text.textContent = "Série " + (n + 1);
          btn.append(mark, text);
          btn.addEventListener("click", () => toggleSet(workout, item, ex, n));
          setList.append(btn);
        }
        tracker.append(head, setList);
        ex.append(top, desc, refRow, tracker);
        list.append(ex);
      });

      inner.append(list);
      content.append(inner);
      routine.append(trigger, progress, content);

      trigger.addEventListener("click", () => {
        if (state.open === workout.id) closeRoutine();
        else openRoutine(workout.id, false);
      });

      const restart = $("[data-routine-restart]", progress);
      restart.addEventListener("click", () => resetRoutine(workout));

      ROUTINES.set(workout.id, { workout, element: routine, content, trigger, restart });
      $("#" + workout.group + "-routines").append(routine);
    });

    $$(".environment-trigger").forEach((button) => {
      button.addEventListener("click", () => {
        const content = document.getElementById(button.getAttribute("aria-controls"));
        const open = button.getAttribute("aria-expanded") !== "true";
        button.setAttribute("aria-expanded", String(open));
        content.classList.toggle("open", open);
      });
    });
  }

  function openRoutine(id, scroll) {
    const entry = ROUTINES.get(id);
    if (!entry) return;
    ROUTINES.forEach(({ content, trigger }, routineId) => {
      const isOpen = routineId === id;
      content.classList.toggle("open", isOpen);
      trigger.setAttribute("aria-expanded", String(isOpen));
    });
    const environment = entry.element.closest(".environment");
    const envTrigger = environment && $(".environment-trigger", environment);
    if (envTrigger) {
      envTrigger.setAttribute("aria-expanded", "true");
      const envContent = document.getElementById(envTrigger.getAttribute("aria-controls"));
      if (envContent) envContent.classList.add("open");
    }
    state.open = id;
    saveState();
    updateProgress();
    if (scroll) {
      setTimeout(() => {
        entry.element.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
      }, 240);
    }
  }

  function closeRoutine() {
    ROUTINES.forEach(({ content, trigger }) => {
      content.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");
    });
    state.open = null;
    saveState();
    updateProgress();
  }

  /* ------------------------ séries ------------------------ */
  let lastExerciseId = null;

  function toggleSet(workout, item, ex, index) {
    const exId = ex.dataset.exId;
    const values = (state.sets[exId] || []).slice();
    const wasChecked = values.includes(index);
    state.sets[exId] = wasChecked
      ? values.filter((v) => v !== index)
      : values.concat(index).sort((a, b) => a - b);
    if (!wasChecked) {
      lastExerciseId = exId;
      if (!state.started[workout.id]) state.started[workout.id] = Date.now();
    }
    saveState();
    updateExercise(ex);
    updateProgress();

    if (!wasChecked) {
      const { total, done } = workoutProgress(workout);
      if (total > 0 && done >= total) {
        // Última série do treino: sem descanso, direto para a celebração.
        if (!state.celebrated[workout.id]) celebrate(workout);
        return;
      }

      const isLastOfExercise = state.sets[exId].length >= item.sets;
      const next = nextExercise(workout, item);
      if (state.prefs.autoRest) {
        startRest(restFor(exId), {
          exId,
          mode: isLastOfExercise ? "transicao" : "serie",
          label: isLastOfExercise
            ? next ? "Próximo: " + next.name : "Última série do exercício"
            : "Série " + (index + 1) + " de " + item.sets,
        });
      } else {
        toast(state.sets[exId].length === item.sets ? "Exercício concluído." : "Série registrada.");
      }
    }
  }

  function nextExercise(workout, item) {
    const index = workout.items.indexOf(item);
    for (let i = index + 1; i < workout.items.length; i++) {
      if (!workout.items[i].optional) return workout.items[i];
    }
    return null;
  }

  function updateExercise(ex) {
    const exId = ex.dataset.exId;
    const total = Number(ex.dataset.sets) || 1;
    const values = state.sets[exId] || [];
    ex.classList.toggle("all-done", values.length >= total);
    const counter = $('[data-count="' + exId + '"]', ex);
    if (counter) {
      counter.textContent = values.length >= total ? "Concluído" : values.length + "/" + total + " concluídas";
    }
    $$(".set-btn", ex).forEach((btn) => {
      const checked = values.includes(Number(btn.dataset.set));
      btn.classList.toggle("checked", checked);
      btn.setAttribute("aria-pressed", String(checked));
      btn.setAttribute("aria-label", "Série " + (Number(btn.dataset.set) + 1) + ": " + (checked ? "concluída" : "pendente"));
      $(".set-mark", btn).textContent = checked ? "✓" : "";
    });
  }

  /* ------------------------ progresso ------------------------ */
  function updateProgress() {
    let anyProgress = false;

    WORKOUTS.forEach((workout) => {
      const { total, done, pct } = workoutProgress(workout);
      if (done > 0) anyProgress = true;
      const pctEl = $('[data-routine-pct="' + workout.id + '"]');
      const fill = $('[data-routine-fill="' + workout.id + '"]');
      const label = $('[data-routine-label="' + workout.id + '"]');
      const entry = ROUTINES.get(workout.id);
      if (pctEl) pctEl.textContent = pct + "%";
      if (fill) fill.style.width = pct + "%";
      if (label) label.textContent = done + " de " + total + " séries";
      if (entry && entry.restart) entry.restart.hidden = done === 0;
    });

    $("#reset-all").hidden = !anyProgress;

    const current = WORKOUTS.find((w) => w.id === state.open);
    if (!current) {
      $("#percentage").textContent = "—";
      $("#percentage").classList.remove("done");
      $("#progress-fill").style.width = "0%";
      $("#completed").textContent = "0";
      $("#total").textContent = "0";
      $("#progress-name").textContent = "Abra um treino para acompanhar o progresso.";
      $("#progress-name").style.color = "";
      setSticky(null);
      return;
    }

    const { total, done, pct } = workoutProgress(current);
    $("#percentage").textContent = pct + "%";
    $("#percentage").classList.toggle("done", pct === 100);
    $("#progress-fill").style.width = pct + "%";
    $("#completed").textContent = String(done);
    $("#total").textContent = String(total);
    $("#progress-name").textContent = current.title + " · " + current.subtitle;
    setSticky(current, total, done, pct);
  }

  function setSticky(workout, total, done, pct) {
    const bar = $("#sticky-progress");
    if (!workout) { bar.classList.remove("visible", "complete"); return; }
    $("#sticky-name").textContent = workout.title;
    $("#sticky-pct").textContent = pct + "%";
    $("#sticky-fill").style.width = pct + "%";
    $("#sticky-day").textContent = workout.subtitle;
    $("#sticky-count").textContent = done + "/" + total + " séries" + (pct === 100 ? " · concluído" : "");
    $("#sticky-count").classList.toggle("done", pct === 100);
    bar.classList.toggle("complete", pct === 100);
  }

  function syncStickyVisibility() {
    const bar = $("#sticky-progress");
    if (!state.open) { bar.classList.remove("visible"); return; }
    const summary = $("#summary");
    const visible = summary.getBoundingClientRect().bottom < 0;
    bar.classList.toggle("visible", visible);
    bar.setAttribute("aria-hidden", String(!visible));
  }

  function resetRoutine(workout) {
    if (!confirm("Recomeçar " + workout.title + "? As séries registradas nesta rotina serão apagadas.")) return;
    workout.items.forEach((_, index) => {
      delete state.sets[workout.id + "-" + (index + 1)];
    });
    delete state.celebrated[workout.id];
    delete state.started[workout.id];
    saveState();
    refreshAll();
    toast("Rotina reiniciada.");
  }

  function resetAll() {
    if (!confirm("Apagar todas as séries registradas de todos os treinos?")) return;
    state.sets = {};
    state.celebrated = {};
    state.started = {};
    state.open = null;
    saveState();
    ROUTINES.forEach(({ content, trigger }) => {
      content.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");
    });
    refreshAll();
    resetTimer();
    window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
    toast("Progresso reiniciado.");
  }

  function refreshAll() {
    $$(".exercise").forEach(updateExercise);
    updateProgress();
  }

  /* ------------------------ áudio ------------------------ */
  let audioCtx = null;
  let keepAlive = null;
  let duckElement = null;
  let toneUrl = null;

  function audioSessionHint() {
    try {
      if (navigator.audioSession) navigator.audioSession.type = "transient";
    } catch { /* ignorado */ }
  }

  function ensureCtx() {
    if (!state.prefs.sound) return null;
    try {
      if (!audioCtx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;
        audioCtx = new Ctx();
        audioSessionHint();
      }
      if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
      return audioCtx;
    } catch { return null; }
  }

  /* Mantém o contexto de áudio ativo durante o descanso para o alarme agendado
     disparar com a tela bloqueada. Ganho zero: não produz som. */
  function startKeepAlive() {
    const ctx = ensureCtx();
    if (!ctx || keepAlive) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0;
      osc.frequency.value = 40;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      keepAlive = osc;
    } catch { keepAlive = null; }
  }

  function stopKeepAlive() {
    if (!keepAlive) return;
    try { keepAlive.stop(0); } catch { /* ignore */ }
    try { keepAlive.disconnect(); } catch { /* ignore */ }
    keepAlive = null;
  }

  function unlockAudio() {
    ensureCtx();
    audioSessionHint();
  }
  document.addEventListener("pointerdown", unlockAudio, { passive: true });
  document.addEventListener("keydown", unlockAudio);

  function beepStart() {
    if (!state.prefs.sound) return;
    const ctx = ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [660, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = now + i * 0.11;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.22, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    });
  }

  function playWinChime() {
    if (!state.prefs.sound) return;
    const ctx = ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const t = now + i * 0.13;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.42);
    });
  }

  /* ---------- alarme agendado (toca mesmo com tela bloqueada) ---------- */
  let alarmNodes = [];

  function cancelAlarm() {
    alarmNodes.forEach((node) => { try { node.stop(0); } catch { /* ignore */ } });
    alarmNodes = [];
  }

  function scheduleAlarm(seconds) {
    cancelAlarm();
    if (!state.prefs.sound) return;
    const ctx = ensureCtx();
    if (!ctx) return;
    const start = ctx.currentTime + Math.max(0.05, seconds);
    // Padrão staccato em 3 rajadas — bem mais alarmante que 3 bipes suaves.
    const offsets = [0, 0.2, 0.4, 1.15, 1.35, 1.55, 2.3, 2.5, 2.7];
    offsets.forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      const t = start + offset;
      osc.frequency.setValueAtTime(1250, t);
      osc.frequency.linearRampToValueAtTime(1650, t + 0.16);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.55, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.17);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.19);
      alarmNodes.push(osc);
    });
    // Reforço grave, para soar através da música.
    const low = ctx.createOscillator();
    const lowGain = ctx.createGain();
    low.type = "square";
    low.frequency.setValueAtTime(700, start);
    low.frequency.linearRampToValueAtTime(900, start + 2.8);
    lowGain.gain.setValueAtTime(0.0001, start);
    lowGain.gain.exponentialRampToValueAtTime(0.16, start + 0.05);
    lowGain.gain.exponentialRampToValueAtTime(0.0001, start + 2.85);
    low.connect(lowGain).connect(ctx.destination);
    low.start(start);
    low.stop(start + 2.9);
    alarmNodes.push(low);
  }

  /* ---------- modo "assumir o áudio" (pode pausar/abaixar a música) ---------- */
  function buildToneUrl() {
    if (toneUrl) return toneUrl;
    try {
      const sr = 22050;
      const dur = 1.6;
      const n = Math.floor(sr * dur);
      const buffer = new ArrayBuffer(44 + n * 2);
      const view = new DataView(buffer);
      const str = (offset, text) => {
        for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
      };
      str(0, "RIFF"); view.setUint32(4, 36 + n * 2, true); str(8, "WAVE");
      str(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
      view.setUint16(22, 1, true); view.setUint32(24, sr, true); view.setUint32(28, sr * 2, true);
      view.setUint16(32, 2, true); view.setUint16(34, 16, true);
      str(36, "data"); view.setUint32(40, n * 2, true);
      for (let i = 0; i < n; i++) {
        const t = i / sr;
        const env = Math.min(1, t / 0.01) * Math.max(0, 1 - Math.pow(t / dur, 3));
        const wave = Math.sin(2 * Math.PI * 1320 * t) * 0.55 + Math.sin(2 * Math.PI * 880 * t) * 0.35;
        view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, wave * env)) * 32767, true);
      }
      toneUrl = URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
    } catch { toneUrl = null; }
    return toneUrl;
  }

  function playDuckAudio() {
    if (!state.prefs.duck || !state.prefs.sound) return;
    try {
      const url = buildToneUrl();
      if (!url) return;
      if (!duckElement) {
        duckElement = new Audio(url);
        duckElement.preload = "auto";
      }
      duckElement.currentTime = 0;
      duckElement.volume = 1;
      const played = duckElement.play();
      if (played && played.catch) played.catch(() => {});
      setTimeout(() => { try { duckElement.pause(); } catch { /* ignore */ } }, 2000);
    } catch { /* ignore */ }
  }

  /* ------------------------ cronômetro ------------------------ */
  const timer = {
    duration: DEFAULT_REST,
    remaining: DEFAULT_REST,
    endsAt: 0,
    startedAt: 0,
    running: false,
    free: false,
    mode: "serie",
    exId: null,
    tickId: null,
  };

  function renderTimer() {
    const value = $("#timer-value");
    value.textContent = fmt(timer.remaining);
    value.classList.toggle("finished", !timer.free && timer.remaining <= 0);

    const fill = $("#ring-fill");
    fill.setAttribute("stroke-dasharray", String(RING_CIRC));
    if (timer.free) {
      fill.setAttribute("stroke-dashoffset", String(RING_CIRC * 0.72));
    } else {
      const ratio = timer.duration ? Math.max(0, Math.min(1, timer.remaining / timer.duration)) : 0;
      fill.setAttribute("stroke-dashoffset", String(RING_CIRC * (1 - ratio)));
    }

    const wrap = $("#ring-wrap");
    wrap.classList.toggle("free", timer.free);
    wrap.classList.toggle("finished", !timer.free && timer.remaining <= 0 && !timer.running);
    $("#timer-info").classList.toggle("running", timer.running);

    const startBtn = $("#timer-start");
    startBtn.textContent = timer.running ? "Pausar" : !timer.free && timer.remaining <= 0 ? "Reiniciar" : "Iniciar";
    $("#timer-mode").textContent = timer.free ? "LIVRE" : timer.mode === "transicao" ? "TRANSIÇÃO" : "DESCANSO";

    syncChips();
  }

  function syncChips() {
    $$(".chip").forEach((chip) => {
      const preset = chip.dataset.preset;
      const active = preset === "free" ? timer.free : !timer.free && Number(preset) === timer.duration;
      chip.classList.toggle("active", active);
      chip.setAttribute("aria-pressed", String(active));
    });
  }

  function setStatus(text) {
    $("#timer-status").textContent = text;
  }

  function clearTick() {
    if (timer.tickId !== null) clearInterval(timer.tickId);
    timer.tickId = null;
  }

  function startRest(seconds, options = {}) {
    timer.free = false;
    timer.duration = seconds;
    timer.remaining = seconds;
    timer.mode = options.mode || "serie";
    timer.exId = options.exId || null;
    if (options.exId) lastExerciseId = options.exId;
    $("#timer-seconds").value = String(seconds);
    timer.running = false;
    clearTick();
    renderTimer();
    setStatus(options.label || "Descanso de " + fmt(seconds));
    startTimer();
  }

  function startTimer() {
    if (timer.running) { pauseTimer(); return; }
    if (!timer.free && timer.remaining <= 0) timer.remaining = timer.duration;

    timer.running = true;
    timer.endsAt = Date.now() + timer.remaining * 1000;
    timer.startedAt = Date.now() - timer.remaining * 1000;
    clearTick();
    timer.tickId = setInterval(tick, 250);

    if (!timer.free) scheduleAlarm(timer.remaining);
    startKeepAlive();

    // Sinal de início: pista visual + sonora, para não restar dúvida se começou.
    const wrap = $("#ring-wrap");
    wrap.classList.remove("starting", "finished");
    void wrap.offsetWidth;
    wrap.classList.add("starting");
    setTimeout(() => wrap.classList.remove("starting"), 950);
    beepStart();
    if (!timer.free) setStatus("Descanso iniciado · " + fmt(timer.remaining));
    else setStatus("Cronômetro livre em andamento");
    vibrate(35);
    renderTimer();
  }

  function pauseTimer() {
    if (!timer.running) return;
    timer.remaining = Math.max(0, Math.ceil((timer.endsAt - Date.now()) / 1000));
    if (timer.free) timer.remaining = Math.max(0, (Date.now() - timer.startedAt) / 1000);
    timer.running = false;
    clearTick();
    cancelAlarm();
    stopKeepAlive();
    setStatus("Pausado em " + fmt(timer.remaining) + ".");
    renderTimer();
  }

  function resetTimer() {
    timer.running = false;
    timer.free = false;
    clearTick();
    cancelAlarm();
    stopKeepAlive();
    timer.remaining = timer.duration;
    $("#ring-wrap").classList.remove("starting", "finished", "free");
    setStatus("Pronto para iniciar.");
    renderTimer();
  }

  function tick() {
    if (!timer.running) return;
    if (timer.free) {
      timer.remaining = (Date.now() - timer.startedAt) / 1000;
      renderTimer();
      return;
    }
    timer.remaining = Math.max(0, Math.ceil((timer.endsAt - Date.now()) / 1000));
    renderTimer();
    if (timer.remaining <= 0) finishTimer();
  }

  function finishTimer() {
    timer.running = false;
    timer.remaining = 0;
    clearTick();
    // Não cancela o alarme agendado: ele deve tocar até o fim.
    stopKeepAlive();
    renderTimer();
    $("#ring-wrap").classList.add("finished");
    const finishedMode = timer.mode;
    setStatus(finishedMode === "transicao" ? "Descanso concluído. Troque de exercício." : "Descanso concluído. Próxima série!");
    // Alarme agendado já tocou; isto cobre o caso de áudio bloqueado no início.
    playDuckAudio();
    vibrate([320, 140, 320, 140, 320, 140, 600]);
    toast(finishedMode === "transicao" ? "Descanso concluído. Próximo exercício!" : "Descanso concluído. Bora para a próxima série!");
  }

  function applyPreset(value) {
    if (value === "free") {
      clearTick();
      cancelAlarm();
      timer.free = true;
      timer.running = false;
      timer.remaining = 0;
      renderTimer();
      startTimer();
      return;
    }
    const seconds = Number(value);
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    clearTick();
    cancelAlarm();
    stopKeepAlive();
    timer.free = false;
    timer.duration = seconds;
    timer.remaining = seconds;
    $("#timer-seconds").value = String(seconds);
    if (lastExerciseId) state.rest[lastExerciseId] = seconds;
    else state.prefs.rest = seconds;
    saveState();
    timer.running = false;
    renderTimer();
    setStatus("Descanso de " + fmt(seconds) + " definido.");
    startTimer();
  }

  function applyCustomDuration() {
    const input = $("#timer-seconds");
    const value = Number(input.value);
    if (!Number.isInteger(value) || value < 5 || value > 3600) {
      toast("Informe entre 5 e 3600 segundos.");
      input.focus();
      return;
    }
    applyPreset(value);
    toast("Descanso de " + value + "s salvo.");
  }

  /* ------------------------ celebração ------------------------ */
  let fireworks = { raf: null, particles: [], start: 0 };

  function celebrate(workout) {
    state.celebrated[workout.id] = true;
    saveState();

    const { total } = workoutProgress(workout);
    const exercises = workout.items.filter((item) => !item.optional).length;
    const startedAt = state.started[workout.id];
    $("#celebration-text").textContent = workout.title + " · " + workout.subtitle;
    $("#celebration-sets").textContent = String(total);
    $("#celebration-time").textContent = startedAt ? fmtLong(Date.now() - startedAt) : "—";
    $("#celebration-load").textContent = String(exercises);

    const overlay = $("#celebration");
    overlay.hidden = false;
    stopTimerOnWorkoutEnd();
    playWinChime();
    vibrate([120, 80, 120, 80, 300]);
    startFireworks();
  }

  /* Ao fechar o treino não faz sentido continuar um descanso em andamento. */
  function stopTimerOnWorkoutEnd() {
    timer.running = false;
    timer.free = false;
    clearTick();
    cancelAlarm();
    stopKeepAlive();
    timer.remaining = timer.duration;
    $("#ring-wrap").classList.remove("starting", "finished", "free");
    setStatus("Treino concluído. Sem descanso pendente.");
    renderTimer();
  }

  function closeCelebration() {
    $("#celebration").hidden = true;
    stopFireworks();
  }

  function startFireworks() {
    const canvas = $("#fireworks");
    if (!canvas) return;
    if (reducedMotion()) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const colors = ["#f4c430", "#ffd97a", "#ffffff", "#ff9d3c", "#9ad9a2", "#e45b5b"];
    fireworks.particles = [];
    fireworks.start = performance.now();
    const bursts = [0, 520, 1040, 1560, 2100];

    function spawn(x, y) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const count = 42 + Math.floor(Math.random() * 22);
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.25;
        const speed = 1.6 + Math.random() * 3.6;
        fireworks.particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.008 + Math.random() * 0.012,
          color,
          size: 1.6 + Math.random() * 1.8,
        });
      }
    }

    function frame(now) {
      const elapsed = now - fireworks.start;

      bursts.forEach((time) => {
        if (elapsed >= time && !canvas.dataset["b" + time]) {
          canvas.dataset["b" + time] = "1";
          spawn(
            window.innerWidth * (0.18 + Math.random() * 0.64),
            window.innerHeight * (0.16 + Math.random() * 0.36)
          );
        }
      });

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      fireworks.particles = fireworks.particles.filter((p) => {
        p.vy += 0.045;
        p.vx *= 0.992;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) return false;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });
      ctx.globalAlpha = 1;

      if (elapsed < 6000 || fireworks.particles.length) {
        fireworks.raf = requestAnimationFrame(frame);
      } else {
        stopFireworks();
      }
    }

    ["b0", "b520", "b1040", "b1560", "b2100"].forEach((key) => delete canvas.dataset[key]);
    fireworks.raf = requestAnimationFrame(frame);
  }

  function stopFireworks() {
    if (fireworks.raf) cancelAnimationFrame(fireworks.raf);
    fireworks.raf = null;
    fireworks.particles = [];
    const canvas = $("#fireworks");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  /* ------------------------ referências ------------------------ */
  function openReference(item) {
    $("#reference-title").textContent = item.name;
    const box = $("#reference-options");
    box.replaceChildren();
    const query = item.query || item.name;
    const links = [
      ["Pesquisar vídeos", "Demonstrações e técnica", "https://www.youtube.com/results?search_query=" + encodeURIComponent(query)],
      ["Pesquisar imagens", "Posicionamento e referência visual", "https://www.google.com/search?tbm=isch&q=" + encodeURIComponent(query)],
      ["Pesquisar GIFs", "Demonstração visual do movimento", "https://www.google.com/search?tbm=isch&q=" + encodeURIComponent(query + " gif")],
    ];
    links.forEach(([title, subtitle, url]) => {
      const a = document.createElement("a");
      a.className = "reference-link";
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      const strong = document.createElement("strong");
      strong.textContent = title;
      const small = document.createElement("small");
      small.textContent = subtitle;
      a.append(strong, small);
      box.append(a);
    });
    $("#reference-dialog").showModal();
  }

  /* ------------------------ notas ------------------------ */
  function renderNotes() {
    const fill = (selector, items) => {
      const list = $(selector);
      if (!list) return;
      items.forEach((text) => {
        const li = document.createElement("li");
        li.textContent = text;
        list.append(li);
      });
    };
    fill("#note-progression", SAFETY.progression || []);
    fill("#note-volume", SAFETY.volume || []);
    fill("#note-care", SAFETY.care || []);
  }

  /* ------------------------ eventos gerais ------------------------ */
  $("#reference-close").addEventListener("click", () => $("#reference-dialog").close());
  $("#reference-dialog").addEventListener("click", (event) => {
    if (event.target === $("#reference-dialog")) $("#reference-dialog").close();
  });
  $("#reset-all").addEventListener("click", resetAll);

  $("#timer-start").addEventListener("click", startTimer);
  $("#timer-reset").addEventListener("click", () => {
    resetTimer();
    toast("Cronômetro reiniciado.");
  });
  $$(".chip").forEach((chip) => {
    chip.addEventListener("click", () => applyPreset(chip.dataset.preset));
  });

  const settingsBtn = $("#timer-settings-btn");
  settingsBtn.addEventListener("click", () => {
    const panel = $("#timer-settings");
    const open = panel.hidden;
    panel.hidden = !open;
    settingsBtn.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("settings-open", open);
  });

  $("#timer-seconds").addEventListener("change", applyCustomDuration);
  $("#timer-seconds").addEventListener("keydown", (event) => {
    if (event.key === "Enter") { event.preventDefault(); event.target.blur(); }
  });

  const autoRest = $("#auto-rest");
  autoRest.checked = state.prefs.autoRest;
  autoRest.addEventListener("change", () => {
    state.prefs.autoRest = autoRest.checked;
    saveState();
    toast(autoRest.checked ? "Descanso automático ligado." : "Descanso automático desligado.");
  });

  const duckAudio = $("#duck-audio");
  duckAudio.checked = state.prefs.duck;
  duckAudio.addEventListener("change", () => {
    state.prefs.duck = duckAudio.checked;
    saveState();
    if (duckAudio.checked) {
      unlockAudio();
      toast("Modo de áudio ativado. Teste com sua música: pode abaixar ou pausar.");
    }
  });

  const soundOn = $("#sound-on");
  soundOn.checked = state.prefs.sound;
  soundOn.addEventListener("change", () => {
    state.prefs.sound = soundOn.checked;
    saveState();
    if (!state.prefs.sound) { cancelAlarm(); toast("Sons desligados."); }
    else toast("Sons ligados.");
  });

  $("#celebration-close").addEventListener("click", closeCelebration);
  $("#celebration").addEventListener("click", (event) => {
    if (event.target === $("#celebration")) closeCelebration();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden || !timer.running) return;
    if (timer.free) { tick(); return; }
    timer.remaining = Math.max(0, Math.ceil((timer.endsAt - Date.now()) / 1000));
    renderTimer();
    if (timer.remaining <= 0) finishTimer();
  });

  window.addEventListener("scroll", syncStickyVisibility, { passive: true });
  window.addEventListener("resize", () => {
    syncStickyVisibility();
    if (!$("#celebration").hidden) startFireworks();
  });

  /* ------------------------ PWA ------------------------ */
  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    if (!/^https?:$/.test(location.protocol)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => { /* offline indisponível */ });
    });
  }

  /* ------------------------ início ------------------------ */
  function boot() {
    renderWorkouts();
    renderNotes();

    timer.duration = Number(state.prefs.rest) || DEFAULT_REST;
    timer.remaining = timer.duration;
    $("#timer-seconds").value = String(timer.duration);

    refreshAll();
    renderTimer();
    setStatus("Descanso de " + fmt(timer.duration) + " pronto.");

    if (state.open && ROUTINES.has(state.open)) openRoutine(state.open, false);

    // Recupera abertura dos ambientes
    $$(".environment-trigger").forEach((button) => {
      if (button.getAttribute("aria-expanded") === "true") {
        const content = document.getElementById(button.getAttribute("aria-controls"));
        if (content) content.classList.add("open");
      }
    });
    syncStickyVisibility();
    registerServiceWorker();
  }

  /* Expõe o gancho de celebração para o fluxo de séries */
  boot();
})();
