import { NextResponse } from 'next/server';

// On place la fonction logique ici (côté serveur)
const callGeminiAPI = async (payload, expectJson = false) => {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) throw new Error("Clé API manquante sur le serveur.");

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;
    
    if (expectJson) payload.generationConfig = { responseMimeType: "application/json" };

    // ... (le reste de ta logique de retry et fetch que nous avons vu précédemment)
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    // Simplification pour l'exemple, garde ta logique de retry complète ici
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text;
};

// Le "Handler" qui reçoit la requête du navigateur
export async function POST(req) {
    try {
        const body = await req.json(); // On récupère le payload envoyé par le client
        const result = await callGeminiAPI(body.payload, body.expectJson);
        
        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
