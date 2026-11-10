/* ============================================================
   CONFIGURAÇÃO — é o único arquivo que você precisa editar.
   As datas abaixo são ESTIMATIVAS baseadas num calendário
   típico (fev–jun / ago–dez). Ajuste para o calendário
   acadêmico oficial da sua instituição.
   Formato das datas: AAAA-MM-DD (horário de Fortaleza, UTC-3)
   ============================================================ */
window.CONFIG = {
  curso: "Direito",
  turma: "2025.2",
  titulo: "Faltam",
  subtituloFim: "para a formatura",

  // Dias da semana com aula (0 = domingo ... 6 = sábado)
  diasDeAula: [1, 2, 3, 4, 5],

  // 10 semestres: 2025.2 até 2030.1
  semestres: [
    { codigo: "2025.2", inicio: "2025-08-04", fim: "2025-12-19" },
    { codigo: "2026.1", inicio: "2026-02-02", fim: "2026-06-26" },
    { codigo: "2026.2", inicio: "2026-08-03", fim: "2026-12-18" },
    { codigo: "2027.1", inicio: "2027-02-01", fim: "2027-06-25" },
    { codigo: "2027.2", inicio: "2027-08-02", fim: "2027-12-17" },
    { codigo: "2028.1", inicio: "2028-02-07", fim: "2028-06-30" },
    { codigo: "2028.2", inicio: "2028-08-07", fim: "2028-12-15" },
    { codigo: "2029.1", inicio: "2029-02-05", fim: "2029-06-29" },
    { codigo: "2029.2", inicio: "2029-08-06", fim: "2029-12-14" },
    { codigo: "2030.1", inicio: "2030-02-04", fim: "2030-06-28" }
  ],

  // Marcos da jornada (ponto: "inicio" ou "fim" do semestre indicado)
  marcos: [
    { titulo: "Primeiro ano concluído", semestre: 2, ponto: "fim" },
    { titulo: "Metade do curso", semestre: 5, ponto: "fim" },
    { titulo: "Começa o último ano", semestre: 9, ponto: "inicio" },
    { titulo: "Formatura", semestre: 10, ponto: "fim" }
  ]
};
