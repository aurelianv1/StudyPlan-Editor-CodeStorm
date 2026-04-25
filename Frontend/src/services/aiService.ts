export async function sendChatMessage(message: string, planId: string | null) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    try {
        const response = await fetch(`${baseUrl}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: message,
                plan_id: planId
            }),
        });

        if (!response.ok) throw new Error("Backend offline");
        return await response.json();
    } catch (error) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    role: "assistant",
                    content: "Simulare: Conexiunea cu Python a eșuat (verifică dacă serverul de backend este pornit), dar arhitectura de frontend funcționează corect."
                });
            }, 1000);
        });
    }
}