(() => {
  "use strict";

  const C = window.CONFIG;
  const TZ = "-03:00"; // Fortaleza
  const DAY = 864e5;

  const $ = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(2, "0");
  const plural = (n, s, p) => (n === 1 ? s : p);
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const mkDate = (d, fim) => new Date(`${d}T${fim ? "23:59:59" : "00:00:00"}${TZ}`);

  const fmtLong = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Fortaleza" });
  const fmtShort = new Intl.DateTimeFormat("pt-BR", { month: "short", year: "2-digit", timeZone: "America/Fortaleza" });
  const fmtNum = new Intl.NumberFormat("pt-BR");

  const sems = C.semestres.map((s, i) => ({ ...s, n: i + 1, ini: mkDate(s.inicio), fim: mkDate(s.fim, true) }));
  const total = sems.length;
  const CURSO_FIM = sems[total - 1].fim;
  const LETIVO_TOTAL = sems.reduce((a, s) => a + (s.fim - s.ini), 0);

  /* ---------- cálculo ---------- */

  function addMonths(d, n) {
    const r = new Date(d);
    const dia = r.getDate();
    r.setDate(1);
    r.setMonth(r.getMonth() + n);
    const max = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate();
    r.setDate(Math.min(dia, max));
    return r;
  }

  function breakdown(from, to) {
    let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
    let probe = addMonths(from, months);
    if (probe > to) { months--; probe = addMonths(from, months); }
    const rest = Math.max(0, to - probe);
    return {
      anos: Math.floor(months / 12),
      meses: months % 12,
      dias: Math.floor(rest / DAY),
      horas: Math.floor((rest % DAY) / 36e5),
      min: Math.floor((rest % 36e5) / 6e4),
      seg: Math.floor((rest % 6e4) / 1e3)
    };
  }

  function letivoDecorrido(now) {
    return sems.reduce((a, s) => a + clamp(now - s.ini, 0, s.fim - s.ini), 0);
  }

  function diasDeAulaRestantes(now) {
    let count = 0;
    for (const s of sems) {
      if (s.fim < now) continue;
      const start = new Date(Math.max(s.ini, now));
      for (let d = new Date(start); d <= s.fim; d = new Date(d.getTime() + DAY)) {
        const dow = new Date(d.getTime() - 3 * 36e5).getUTCDay(); // dia da semana em Fortaleza
        if (C.diasDeAula.includes(dow)) count++;
      }
    }
    return count;
  }

  function situacao(now) {
    const atual = sems.find((s) => now >= s.ini && now <= s.fim);
    if (atual) return { tipo: "aula", sem: atual };
    if (now < sems[0].ini) return { tipo: "antes", prox: sems[0] };
    if (now > CURSO_FIM) return { tipo: "fim" };
    const prox = sems.find((s) => s.ini > now);
    return { tipo: "recesso", prox, ant: sems[prox.n - 2] };
  }

  /* ---------- render ---------- */

  function setBar(barId, fillId, pct) {
    $(fillId).style.width = pct.toFixed(2) + "%";
    $(barId).setAttribute("aria-valuenow", Math.round(pct));
  }

  function renderCountdown(now) {
    const b = breakdown(now, CURSO_FIM > now ? CURSO_FIM : now);
    $("c-anos").textContent = b.anos;
    $("c-meses").textContent = b.meses;
    $("c-dias").textContent = b.dias;
    $("c-horas").textContent = pad(b.horas);
    $("c-min").textContent = pad(b.min);
    $("c-seg").textContent = pad(b.seg);
    $("l-anos").textContent = plural(b.anos, "ano", "anos");
    $("l-meses").textContent = plural(b.meses, "mês", "meses");
    $("l-dias").textContent = plural(b.dias, "dia", "dias");
    $("l-horas").textContent = plural(b.horas, "hora", "horas");
    return b;
  }

  function renderSlow(now) {
    const done = now > CURSO_FIM;
    const pct = (letivoDecorrido(now) / LETIVO_TOTAL) * 100;
    const diasRest = done ? 0 : Math.ceil((CURSO_FIM - now) / DAY);
    const concluidos = sems.filter((s) => s.fim < now).length;
    const sit = situacao(now);

    $("pct").textContent = pct.toFixed(1).replace(".", ",") + "%";
    setBar("bar", "fill", pct);
    $("prog-txt").textContent = done
      ? "Curso concluído. Parabéns, bacharel(a)! 🎓"
      : `${pct.toFixed(1).replace(".", ",")}% do tempo letivo já ficou para trás.`;

    $("s-dias").textContent = fmtNum.format(diasRest);
    $("s-sem").textContent = fmtNum.format(Math.ceil(diasRest / 7));
    $("s-aula").textContent = fmtNum.format(diasDeAulaRestantes(now));
    $("s-semestres").textContent = `${concluidos}/${total}`;

    const chip = $("atual-chip"), t = $("atual-t"), txt = $("atual-txt");
    if (sit.tipo === "aula") {
      const s = sit.sem;
      const p = ((now - s.ini) / (s.fim - s.ini)) * 100;
      const rest = Math.ceil((s.fim - now) / DAY);
      chip.textContent = "Em aula";
      chip.className = "chip chip-on";
      t.textContent = `${s.n}º semestre · ${s.codigo}`;
      setBar("bar-sem", "fill-sem", p);
      txt.textContent = `${Math.round(p)}% concluído · faltam ${rest} ${plural(rest, "dia", "dias")} para encerrar o semestre.`;
    } else if (sit.tipo === "recesso") {
      const rest = Math.ceil((sit.prox.ini - now) / DAY);
      chip.textContent = "Recesso";
      chip.className = "chip chip-rest";
      t.textContent = `${sit.ant.codigo} concluído — descanse!`;
      setBar("bar-sem", "fill-sem", 100);
      txt.textContent = `O ${sit.prox.n}º semestre (${sit.prox.codigo}) começa em ${rest} ${plural(rest, "dia", "dias")}.`;
    } else if (sit.tipo === "antes") {
      const rest = Math.ceil((sit.prox.ini - now) / DAY);
      chip.textContent = "Em breve";
      chip.className = "chip chip-rest";
      t.textContent = `As aulas começam em ${rest} ${plural(rest, "dia", "dias")}`;
      setBar("bar-sem", "fill-sem", 0);
      txt.textContent = "";
    } else {
      chip.textContent = "Formado(a)";
      chip.className = "chip chip-on";
      t.textContent = "Missão cumprida 🎓";
      setBar("bar-sem", "fill-sem", 100);
      txt.textContent = "";
    }

    // linha do tempo
    document.querySelectorAll("#timeline li").forEach((li, i) => {
      const s = sems[i];
      const state = now > s.fim ? "done" : now >= s.ini ? "current" : "future";
      li.className = state;
      if (state === "current") li.setAttribute("aria-current", "step");
      else li.removeAttribute("aria-current");
    });

    // marcos
    document.querySelectorAll("#marcos li").forEach((li) => {
      const when = new Date(+li.dataset.ts);
      const passou = when < now;
      li.classList.toggle("done", passou);
      const dias = Math.ceil((when - now) / DAY);
      li.querySelector(".m-status").textContent = passou
        ? "concluído"
        : dias === 1 ? "amanhã" : `em ${fmtNum.format(dias)} dias`;
    });

    const b = breakdown(now, done ? now : CURSO_FIM);
    $("resumo-sr").textContent = done
      ? "Curso concluído."
      : `Faltam ${b.anos} anos, ${b.meses} meses e ${b.dias} dias para a formatura.`;
  }

  function buildStatic() {
    $("eyebrow").textContent = `Turma ${C.turma} · ${C.curso} · ${total} semestres`;
    $("titulo").textContent = C.titulo;
    $("subtitulo").textContent = C.subtituloFim;
    $("data-fim").textContent = fmtLong.format(CURSO_FIM);
    document.title = `Contagem regressiva · ${C.curso} ${C.turma}`;

    $("timeline").innerHTML = sems.map((s) => `
      <li>
        <span class="dot">${s.n}</span>
        <span class="t-cod">${s.codigo}</span>
        <span class="t-dt">${fmtShort.format(s.ini)} – ${fmtShort.format(s.fim)}</span>
      </li>`).join("");

    $("marcos").innerHTML = C.marcos.map((m) => {
      const s = sems[m.semestre - 1];
      const d = m.ponto === "inicio" ? s.ini : s.fim;
      return `
      <li data-ts="${d.getTime()}">
        <span class="m-check" aria-hidden="true"></span>
        <span class="m-body"><strong>${m.titulo}</strong><small>${fmtLong.format(d)}</small></span>
        <span class="m-status"></span>
      </li>`;
    }).join("");
  }

  /* ---------- tema ---------- */

  $("tema").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("tema", next); } catch (e) {}
  });

  /* ---------- loop de atualização automática ---------- */

  let lastMinute = -1;
  function tick() {
    const now = new Date();
    renderCountdown(now);
    const minute = Math.floor(now.getTime() / 6e4);
    if (minute !== lastMinute) { lastMinute = minute; renderSlow(now); }
  }

  buildStatic();
  tick();
  // alinha o intervalo ao início de cada segundo
  setTimeout(() => { tick(); setInterval(tick, 1000); }, 1000 - (Date.now() % 1000));
  // ao voltar para a aba (ou desbloquear o celular), atualiza na hora
  document.addEventListener("visibilitychange", () => { if (!document.hidden) { lastMinute = -1; tick(); } });
})();
