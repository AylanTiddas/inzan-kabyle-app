// netlify/functions/gemini.js

exports.handler = async function(event, context) {
    // 1. Sécurité : Vérifier que c'est une requête POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        // 2. Récupérer la clé API depuis les variables d'environnement (GitHub Secrets via Netlify)
        const API_KEY = process.env.GEMINI_API_KEY;
        if (!API_KEY) {
            return { statusCode: 500, body: JSON.stringify({ error: "Clé API non configurée côté serveur." }) };
        }

        // 3. Lire les données envoyées par le HTML
        const requestBody = JSON.parse(event.body);
        
        // 4. Appeler Google Gemini depuis le SERVEUR (invisible pour l'utilisateur)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        // 5. Gérer les erreurs de Google
        if (!response.ok) {
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: data.error?.message || "Erreur API Google" })
            };
        }

        // 6. Renvoyer uniquement le texte généré au HTML
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: generatedText })
        };

    } catch (error) {
        console.error("Erreur serveur:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Erreur interne du serveur proxy." })
        };
    }
};
