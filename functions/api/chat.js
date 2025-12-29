/* ---------------------------
   MOZART'S RESTAURANT AI CHATBOT BACKEND
   Cloudflare Pages Function for /api/chat
---------------------------- */

export async function onRequest(context) {
    const { request, env } = context;

    // CORS Headers
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle Preflight OPTIONS
    if (request.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    // Only allow POST requests
    if (request.method !== "POST") {
        return new Response(JSON.stringify({
            success: false,
            error: "Method not allowed"
        }), {
            status: 405,
            headers: corsHeaders
        });
    }

    try {
        // Parse request body
        const body = await request.json();
        const userMessage = body.message;
        const history = body.conversationHistory || [];

        // API Key from Environment Variables
        const apiKey = env.GEMINI_API_KEY || "AIzaSyAKZvre8qWjNrKnXraAyznjcMw-y-cl2Y8";

        if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
            throw new Error("Gemini API key is not configured.");
        }

        if (!userMessage) {
            return new Response(JSON.stringify({
                success: false,
                error: "No message provided"
            }), {
                status: 400,
                headers: corsHeaders
            });
        }

        // Restaurant context defining the personality and facts
        const RESTAURANT_CONTEXT = `
You are the "Mozart's AI Concierge," a professional, warm, and sophisticated host for Mozart's Restaurant in Leavenworth, WA. 

Identity:
- Woman-owned legacy since 1980.
- Modern European/Austrian and Pacific Northwest fusion.
- Location: 829 Front St, Upstairs, Leavenworth, WA (Lovely valley view!).

Key Information:
- Signature Dishes: Authentic Wiener Schnitzel ($38), PNW Salmon ($42).
- Wine: 200+ selections from 15+ countries in a temperature-controlled cellar.
- Events: Live music every Friday (7:00 PM - 10:00 PM) - very romantic.
- Dietary: Excellent Gluten-Free and Vegetarian options available.
- Price Range: $50-$100 per person.

Response Guidelines:
1. BE HUMAN: Answer naturally. Don't include tone markers like "(Warm tone)". Just speak warmly.
2. BE RELEVANT: If the user asks a specific question (e.g., about the menu), answer it directly first. 
3. DON'T REPEAT: Avoid giving the full welcome speech every time. If it's a follow-up question, be more concise.
4. RESERVATIONS: We take reservations via phone at +1 (509) 548-0600 or email at host@mozartsrestaurant.com. 
5. LEAD CAPTURE: ONLY if the user is clearly asking to book or reserve, ask for their name and party size to "note it down for the host," then provide the contact info.
6. FALLBACK: If you don't know something, offer to have a human host help them.

Conversation Style:
- Use phrases like "Certainly," "It would be my pleasure," "I'd highly recommend."
- Reflect the premium, romantic, and historic atmosphere of Mozart's.
- Keep responses relatively brief but helpful (under 150 words).
`;

        // Format conversation history for prompt
        let historyParts = [];
        if (history.length > 0) {
            history.forEach(h => {
                historyParts.push({ role: "user", parts: [{ text: h.user }] });
                historyParts.push({ role: "model", parts: [{ text: h.bot }] });
            });
        }

        // Add the new message
        historyParts.push({ role: "user", parts: [{ text: userMessage }] });

        // Update the model list to include 2.0 Flash (Experimental but very fast/reliable)
        const models = [
            'gemini-2.0-flash-exp',
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemma-3-1b-it'
        ];

        let lastError = null;
        let lastErrorModel = null;

        for (const model of models) {
            try {
                const modelName = model.startsWith('models/') ? model : `models/${model}`;
                const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;

                const response = await fetch(geminiUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: historyParts,
                        systemInstruction: {
                            parts: [{ text: RESTAURANT_CONTEXT }]
                        },
                        generationConfig: {
                            temperature: 0.75,
                            maxOutputTokens: 800,
                            topP: 0.95,
                        }
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    console.error(`Model ${model} failed:`, data);
                    lastError = data;
                    lastErrorModel = model;
                    continue;
                }

                if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
                    const aiResponse = data.candidates[0].content.parts[0].text;

                    return new Response(JSON.stringify({
                        success: true,
                        response: aiResponse,
                        model: model,
                        timestamp: new Date().toISOString()
                    }), { headers: corsHeaders });
                }

                lastError = { message: "Invalid response structure" };
                lastErrorModel = model;
            } catch (err) {
                console.error(`Fetch error for ${model}:`, err);
                lastError = err;
                lastErrorModel = model;
            }
        }

        // Final fallback if all models fail
        return new Response(JSON.stringify({
            success: false,
            error: 'AI connection issue',
            message: lastError?.error?.message || lastError?.message || "Our AI concierge is currently attending to other guests. Please call us at (509) 548-0600.",
            last_tried: lastErrorModel
        }), {
            status: 200,
            headers: corsHeaders
        });

    } catch (error) {
        console.error("General Error:", error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Server error',
            message: error.message
        }), {
            status: 500,
            headers: corsHeaders
        });
    }
}

