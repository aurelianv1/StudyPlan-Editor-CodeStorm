# Mock data pentru a demonstra funcționalitatea aplicației fără a aștepta AI-ul

MOCK_DIFF_RESPONSE = {
    "sections": [
        {
            "titlu": "Obiectivele Disciplinei",
            "old_content": "Studiul algoritmilor de bază.",
            "new_content": "Studiul algoritmilor de bază și aplicarea lor în inteligența artificială.",
            "status": "modified" # adaugat, sters, modificat, neschimbat
        },
        {
            "titlu": "Bibliografie",
            "old_content": "Cărți din 2005.",
            "new_content": "Cărți din 2005 + Documentație online actualizată 2024.",
            "status": "modified"
        }
    ]
}

MOCK_CHAT_REPLY = "Sigur, am adăugat conceptele de Machine Learning în secțiunea de Obiective. Mai dorești să modificăm și Bibliografia?"