# StudyPlan Editor — Frontend

Interfața Next.js a aplicației. Instrucțiunile complete (inclusiv backend-ul) sunt în [README-ul principal](../README.md).

```bash
npm install
cp .env.example .env.local   # opțional: NEXT_PUBLIC_API_URL (implicit http://localhost:8000)
npm run dev                  # http://localhost:3000
```

| Comandă | Descriere |
| --- | --- |
| `npm run dev` | server de dezvoltare |
| `npm run build` | build de producție |
| `npm run start` | pornește build-ul de producție |
| `npm run lint` | ESLint |

Toate apelurile către backend trec prin `src/lib/api.ts`.
