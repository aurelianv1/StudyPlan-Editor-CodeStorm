# StudyPlan Editor

A web app that helps university staff keep **discipline sheets** (*fișe de
disciplină*) consistent with the **study plan** (*plan de învățământ*) and move
them to a new template without retyping them.

Built at the CodeStorm hackathon.

## What it does

| Feature | How it works |
| --- | --- |
| **Compare** an old sheet with a new template | Both `.docx` files are split into sections; each template section is marked *unchanged*, *modified*, *new* or *missing*. |
| **Migrate** a sheet to a new template | The old content is carried into the matching sections of the template and downloaded as a `.docx`; sections that only exist in the template are flagged for completion. |
| **Validate** a sheet against the study plan | Credits, evaluation type and competencies of the sheet are checked against the plan. Mismatches are errors, missing competencies are warnings. |
| **Generate** a sheet skeleton | A new `.docx` pre-filled with the credits, evaluation type and competencies found in the plan. |
| **Edit with an AI assistant** | Chat with an LLM that sees the sheet and the plan data. It returns rewritten sections, which are applied to the document and can be exported as `.docx`. |

## Architecture

```
Frontend (Next.js, React, TypeScript, Tailwind)        Backend (FastAPI, python-docx)
┌──────────────────────────────────────────┐          ┌────────────────────────────────────┐
│ app/            pages                    │   HTTP   │ app/api/       routers             │
│ components/     UI, grouped by page      │ ───────► │ app/services/  parsing, diff,      │
│ hooks/          plan store, chat state   │   JSON   │                validation, export  │
│ lib/api.ts      typed API client         │ ◄─────── │ app/schemas.py request/response    │
└──────────────────────────────────────────┘   SSE    └──────────────┬─────────────────────┘
                                                                     │ streaming
                                                                     ▼
                                                              Groq chat completions
```

The backend is stateless: every request carries the documents it needs. The
study plan data extracted on upload is kept in the browser (`localStorage`).

### How a sheet is parsed

Discipline sheets keep almost all their data in tables, so the parser walks
paragraphs **and** tables in document order:

- a heading is a paragraph with a Word heading style, a fully bold paragraph,
  or the next number in sequence (`3. …` after `2. …`), including headings
  stored as a merged table row;
- every table row under a heading becomes a `cell | cell` line of that section;
- titles are compared ignoring diacritic variants (`ș`/`ş`), numbering and small
  rewordings, so `7. Bibliografie` matches `8. Bibliografie`.

## Getting started

Requirements: Python 3.10+ and Node.js 20+.

### Backend

```bash
cd Backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then set GROQ_API_KEY for the AI assistant
uvicorn main:app --reload
```

The API runs on <http://localhost:8000>, with interactive docs at
<http://localhost:8000/docs>.

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

Open <http://localhost:3000>.

### Configuration

| Variable | Where | Default | Purpose |
| --- | --- | --- | --- |
| `GROQ_API_KEY` | `Backend/.env` | *(empty)* | Key for the AI assistant. `/chat` answers 503 without it; everything else works. |
| `GROQ_MODEL` | `Backend/.env` | `llama-3.3-70b-versatile` | Model used by the assistant. |
| `CORS_ORIGINS` | `Backend/.env` | `http://localhost:3000` | Comma-separated origins allowed to call the API. |
| `MAX_UPLOAD_MB` | `Backend/.env` | `5` | Largest accepted upload. |
| `DEMO_MODE` | `Backend/.env` | `false` | Serve the canned presentation scenarios (see below). |
| `NEXT_PUBLIC_API_URL` | `Frontend/.env.local` | `http://localhost:8000` | Where the browser reaches the backend. |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | `Frontend/.env.local` | `support@yourapp.com` | Address used by the contact form. |

## API

| Method | Path | Input | Output |
| --- | --- | --- | --- |
| `POST` | `/parse` | `fd_doc` (.docx) | Sections of the sheet |
| `POST` | `/plan` | `plan_doc` (.docx) | Credits, evaluation type, competencies, disciplines |
| `POST` | `/upload` | `old_doc`, `new_template` (.docx) | Section-by-section comparison |
| `POST` | `/migrate` | `old_doc`, `new_template` (.docx) | Migrated sheet (.docx) |
| `POST` | `/validate` | `fd_doc`, `plan_doc` (.docx) | Plan data and conflicts |
| `POST` | `/validate/sections` | JSON: sections + plan data | Conflicts |
| `POST` | `/generate` | `plan_doc` (.docx) | Sheet skeleton (.docx) |
| `POST` | `/export` | JSON: sections | Sheet (.docx) |
| `POST` | `/chat` | JSON: messages, document, plan data | Server-sent events with the answer |
| `GET` | `/health` | – | Service status |

Uploads must be `.docx` files no larger than `MAX_UPLOAD_MB`. Errors are
returned as `{"detail": "..."}` with a message meant for the user.

## Tests

```bash
cd Backend
pip install -r requirements-dev.txt
pytest                # API and service tests
ruff check . && ruff format --check .

cd ../Frontend
npm test              # unit tests (vitest)
npm run lint
npm run typecheck
npm run build
```

Backend tests build their `.docx` fixtures in memory (`tests/builders.py`),
following the layout of real discipline sheets.

## Demo mode

For the hackathon presentation the backend can return prepared answers for
three sample disciplines, chosen by a keyword in the uploaded file name
(`structuri`, `analiza`, `sisteme`). This is **off by default**; enable it with
`DEMO_MODE=true`. Keep it off when working with real documents.

## Known limitations

- Only `.docx` is supported (no `.doc`, `.pdf` or `.xlsx`).
- A study plan that lists a whole programme is read from tables whose header
  names a *discipline* column plus a *credits* or *evaluation* column; plans
  with multi-level headers may need the column detection in
  `Backend/app/services/plan_parser.py` extended.
- Migrated and exported sheets are rebuilt with default Word styling; the
  original template's formatting is not preserved.
- The assistant's edits depend on the model following the requested
  `[[SECTIUNE: …]]` format.

## Project structure

```
Backend/
  main.py                 entry point (uvicorn main:app)
  app/
    main.py               application factory, error handling
    config.py             settings from the environment
    schemas.py            pydantic models
    api/                  routers: documents, chat
    services/             sheet_parser, plan_parser, diff, validator,
                          exporter, skeleton_generator, chat
    demo/                 canned scenarios for DEMO_MODE
  tests/
Frontend/
  src/
    app/                  pages: home, ai-editing, updating-docs, help
    components/           home, ai-editing, doc-editing, layout
    hooks/                usePlan, useAssistantChat
    lib/                  api client, types, SSE parser, section edits
```
