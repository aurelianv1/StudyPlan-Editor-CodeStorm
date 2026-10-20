# StudyPlan Editor

Aplicație web care ajută cadrele didactice să țină **Fișele de Disciplină (FD)** în acord cu **Planul de Învățământ** al facultății.

- **Generare schelet FD:** încarci Planul de Învățământ și primești un `.docx` precompletat cu creditele, forma de evaluare și competențele.
- **AI Copilot:** editezi fișa printr-un chat cu un asistent AI (Llama 3.3 70B prin Groq), care respectă regulile din plan.
- **Comparare și migrare:** compari o fișă veche cu un template nou (secțiuni noi, lipsă, modificate) sau muți automat conținutul pe noul template.
- **Validare FD față de plan:** detectează conflicte de credite, de formă de evaluare și competențe lipsă (disponibilă momentan doar prin API, `POST /validate`).

## Stack

| Componentă | Tehnologii |
| --- | --- |
| Frontend | Next.js 16 (App Router, React Compiler), React 19, TypeScript, Tailwind CSS 3 |
| Backend | Python, FastAPI, python-docx, Groq API (compatibil OpenAI) |

## Structura proiectului

```
Backend/
├── main.py                    # rutele FastAPI (doar orchestrare)
├── config.py                  # variabile de mediu și constante
├── demo_files/                # fișiere returnate în modul demo
└── services/
    ├── parser.py              # .docx → listă de secțiuni
    ├── plan_parser.py         # extrage credite / evaluare / competențe din plan
    ├── plan_validator.py      # compară FD cu planul
    ├── diff.py                # compară fișa veche cu template-ul nou
    ├── migration.py           # mută conținutul pe template-ul nou
    ├── exporter.py            # secțiuni → .docx
    ├── skeleton_generator.py  # plan → schelet de FD
    ├── llm.py                 # streaming de la Groq
    ├── prompt.py              # promptul de sistem al asistentului
    ├── docx_utils.py          # utilitare comune pentru .docx
    └── demo_data.py           # răspunsuri predefinite pentru demo

Frontend/src/
├── app/                       # paginile: /, /ai-editing, /updating-docs, /help
├── components/
│   ├── home/                  # secțiunile paginii principale
│   ├── ai-editing/            # panourile de chat și document
│   ├── updating-docs/         # upload și vizualizarea diferențelor
│   ├── layout.tsx             # fundal, footer, spinner, link-uri principale
│   └── icons.tsx              # iconițe SVG
└── lib/
    ├── api.ts                 # client pentru backend (inclusiv streaming SSE)
    ├── applyAiResponse.ts     # aplică răspunsul AI pe secțiunile fișei
    ├── demoDocument.ts        # fișa și datele de plan folosite în AI Copilot
    └── types.ts
```

## Rulare locală

### Cerințe

- Python 3.10+
- Node.js 20.9+
- O cheie API Groq (gratuită, de la [console.groq.com/keys](https://console.groq.com/keys)), necesară doar pentru AI Copilot

### 1. Backend (port 8000)

```bash
cd Backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # apoi completează GROQ_API_KEY
uvicorn main:app --reload
```

Documentația interactivă a API-ului e disponibilă la <http://localhost:8000/docs>.

### 2. Frontend (port 3000)

```bash
cd Frontend
npm install
cp .env.example .env.local        # opțional, dacă backend-ul nu e pe localhost:8000
npm run dev
```

Aplicația pornește la <http://localhost:3000>.

### Variabile de mediu

| Variabilă | Unde | Implicit | Descriere |
| --- | --- | --- | --- |
| `GROQ_API_KEY` | `Backend/.env` | — | Cheia pentru Groq, folosită de `/chat` |
| `GROQ_MODEL` | `Backend/.env` | `llama-3.3-70b-versatile` | Modelul folosit de asistent |
| `CORS_ORIGINS` | `Backend/.env` | `*` | Originile permise, separate prin virgulă |
| `NEXT_PUBLIC_API_URL` | `Frontend/.env.local` | `http://localhost:8000` | Adresa backend-ului |

## API

| Metodă | Rută | Input | Output |
| --- | --- | --- | --- |
| `POST` | `/generate` | `plan_doc` (.docx) | schelet FD (.docx) |
| `POST` | `/upload` | `old_doc`, `new_template` (.docx) | `{ sections: [...] }` cu `status` ∈ `new` / `missing` / `modified` / `unchanged` |
| `POST` | `/migrate` | `old_doc`, `new_template` (.docx) | FD migrată (.docx) |
| `POST` | `/validate` | `fd_doc`, `plan_doc` (.docx) | `{ plan_data, conflicts, has_errors }` |
| `POST` | `/chat` | JSON `{ messages, document, plan_data }` | stream SSE `data: {"text": "..."}` … `data: [DONE]` |
| `POST` | `/export` | JSON `{ sections: [{ title, content }] }` | FD (.docx) |

## Cum sunt citite documentele

- **Secțiunile unei fișe:** orice paragraf cu stil `Heading` sau cu text îngroșat (bold) începe o secțiune nouă. Textul de dinaintea primului titlu intră într-o secțiune „Introducere”.
- **Datele din plan:**
  - creditele sunt căutate după tiparul `credite: N`;
  - forma de evaluare e primul dintre `examen` / `colocviu` / `verificare` găsit în text;
  - competențele sunt liniile care încep cu `C…` de sub titlurile „Competențe profesionale” și „Competențe transversale”.

## Modul demo

Pentru prezentări, backend-ul returnează răspunsuri predefinite (din `services/demo_data.py`) dacă numele unui fișier încărcat conține:

| Cuvânt-cheie în numele fișierului | Scenariu |
| --- | --- |
| `structuri` | Structuri de Date (conflict examen/colocviu, migrare din `demo_files/`) |
| `analiza` sau `matematica` | Analiză Matematică (competențe lipsă) |
| `sisteme` sau `operare` | Sisteme de Operare (fără conflicte) |

Modul demo afectează `/upload`, `/validate` și `/migrate`. Pentru a testa parsarea reală, folosește fișiere cu alte nume.

## Limitări cunoscute

- **AI Copilot pornește de la o fișă demo** (Structuri de Date) cu date de plan fixe (`src/lib/demoDocument.ts`). Nu e încă legat de planul încărcat pe pagina principală.
- **Chat-ul nu are memorie:** fiecare mesaj e trimis fără istoricul conversației. Secțiunea modificată e aleasă după cuvinte-cheie din cerere (ex. „bibliografie”, „obiective”, „evaluare”).
- **Doar .docx e parsat:** zona de upload de pe pagina principală acceptă și PDF/XLSX, dar backend-ul parsează doar `.docx`.
- **Adresa de suport e un placeholder:** formularul de contact folosește `support@yourapp.com` (`src/app/help/page.tsx`).
