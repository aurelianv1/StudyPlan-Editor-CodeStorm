import type { ChatMessage, DocumentSection, PlanData } from "./types";

/** Fișa de pornire afișată în AI Copilot. */
export const DEMO_SECTIONS: DocumentSection[] = [
  { id: "1", title: "Date despre disciplină", content: "Structuri de Date, Conf. dr. Ion Popescu, Anul I, Semestrul 2, Examen, 5 credite" },
  { id: "2", title: "Obiectivele disciplinei", content: "Însușirea noțiunilor fundamentale privind structurile de date utilizate în informatică și a algoritmilor asociați acestora." },
  { id: "3", title: "Competențe profesionale", content: "CP2. Utilizează șabloane de proiectare de software, creează diagrama de proces.\nCP3. Analizează specificații software, definește arhitectura software." },
  { id: "4", title: "Conținutul disciplinei", content: "Liste liniare, Stive și cozi, Arbori binari și arbori de căutare, Grafuri și algoritmi de parcurgere, Algoritmi de sortare." },
  { id: "5", title: "Evaluare", content: "Examen final 60%, Activitate laborator 30%, Activitate de autoinstruire 10%" },
  { id: "6", title: "Bibliografie", content: "Knuth, D. E. (2011). The Art of Computer Programming.\nCormen, T. H. et al. (2009). Introduction to Algorithms.\nSedgewick, R. (2001). Algorithms in C." },
];

/** Datele din Planul de Învățământ trimise ca „sursă de adevăr” către AI. */
export const DEMO_PLAN_DATA: PlanData = {
  credite: 5,
  tip_evaluare: "examen",
  competente_profesionale: [
    "CP1. Creează softuri, dezvoltă prototipul pentru software.",
    "CP2. Utilizează șabloane de proiectare de software.",
    "CP3. Analizează specificații software.",
  ],
};

export const ASSISTANT_GREETING: ChatMessage = {
  role: "assistant",
  content: "Bună! Sunt asistentul tău academic. Îți pot modifica orice secțiune din fișa de disciplină. Spune-mi ce vrei să schimbi!",
};
