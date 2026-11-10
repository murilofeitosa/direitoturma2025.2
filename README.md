# # ⚖️ Contagem regressiva — Direito 2025.2

Contagem em tempo real até a formatura da turma 2025.2 (10 semestres, até 2030.1), com progresso do curso, semestre atual, linha do tempo e marcos da jornada.

Site estático (HTML + CSS + JS puro): sem build, sem dependências. Atualiza sozinho a cada segundo, inclusive ao voltar para a aba.

## Ajustar as datas

As datas em `config.js` são **estimativas**. Edite os semestres e os marcos conforme o calendário oficial da faculdade e faça commit — o site é republicado automaticamente.

## Publicar no GitHub

```bash
git init
git add .
git commit -m "Contagem regressiva Direito 2025.2"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/contagem-direito.git
git push -u origin main
```

Depois, no repositório: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
O workflow em `.github/workflows/pages.yml` publica a cada push na `main`; o endereço será `https://SEU-USUARIO.github.io/contagem-direito/`.

## Testar localmente

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```
