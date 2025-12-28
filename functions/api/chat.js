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
        const customerContext = body.context || {};
        const history = body.conversationHistory || [];

        // API Key from Environment Variables (preferred) or fallback
        const apiKey = env.GEMINI_API_KEY || "AIzaSyAVVDMr6_-jsFx7m6XrkJit27Lq7JxsH6A";

        if (!userMessage) {
            return new Response(JSON.stringify({
                success: false,
                error: "No message provided"
            }), {
                status: 400,
                headers: corsHeaders
            });
        }

        const RESTAURANT_CONTEXT = `
You are the "Mozart's AI Concierge," a sophisticated, warm, and highly professional assistant for Mozart's Restaurant in Leavenworth, WA. 

Your goal is to provide a seamless, premium experience that feels like talking to a knowledgeable host at a world-class restaurant.

### RESTAURANT PERSONALITY:
- **Tone**: Elegant, inviting, helpful, and charming.
- **Style**: Use warm greetings (e.g., "Good evening," "It's a pleasure to assist you"). Avoid robotic or overly concise answers. Speak with the grace of a fine dining establishment.
- **Identity**: Mozart's is a woman-owned legacy (since 1980) combining European/Austrian traditions with Pacific Northwest innovation.

### CORE KNOWLEDGE:
- **Location**: 829 Front St, Upstairs, Leavenworth, WA 98826. (Note: We are upstairs, offering a lovely view!)
- **Cuisine**: Modern European/Austrian and Pacific Northwest fusion. We are known for our authentic Wiener Schnitzel ($38) and PNW Salmon ($42).
- **Wine**: We have an extensive, temperature-controlled cellar with 200+ selections from over 15 countries.
- **Live Music**: Every Friday night from 7:00 PM to 10:00 PM—it's very romantic!
- **Dietary**: We take pride in offering excellent Gluten-Free and Vegetarian options.

### POLICIES (HOW TO HANDLE REQUESTS):
1. **Reservations**: Our online system is currently being optimized. The best way to secure a table is to call us at +1 (509) 548-0600 or email host@mozartsrestaurant.com.
2. **Dining Style**: We offer a high-value dining experience ($50-$100 per person). We recommend booking in advance, especially for Friday music nights.
3. **Groups**: For groups larger than 6, please have them contact us directly to ensure we can accommodate them perfectly.
4. **Human Touch**: If you cannot answer a specific question, say something like: "That's a wonderful question. I want to ensure I give you the most accurate details, so I'll have our host team look into that for you. Would you like our number to call them directly?"

### GUIDELINES FOR RESPONDING:
- **Be Conversational**: Don't just list facts. Weave them into a friendly response. (e.g., instead of "We have music on Fridays," say "You'll be delighted to know we have live music every Friday evening to perfectly complement your dining experience.")
- **Stay On Brand**: You ONLY discuss Mozart's Restaurant.
- **Lead Capture**: If a user is interested in a reservation, ask for their name and party size before directing them to the phone/email, so they feel looked after.
`;

        // Format conversation history for prompt
        let historyText = "";
        if (history.length > 0) {
            historyText = "\n\n### RECENT CONVERSATION CONTEXT:\n" + history.map(h => `Customer: ${h.user}\nConcierge: ${h.bot}`).join("\n");
        }

        const prompt = `${RESTAURANT_CONTEXT}${historyText}

### NEW CUSTOMER MESSAGE:
"${userMessage}"

### INSTRUCTION:
Provide a response that is helpful, professional, and reflects the premium atmosphere of Mozart's. Use a warm, human-like tone. If the user is asking a question, answer it thoroughly based on the context above.`;


        // Try multiple models in order of preference
        const models = [
            'gemini-2.0-flash-lite',
            'gemini-flash-lite-latest',
            'gemini-2.0-flash',
            'gemini-flash-latest'
        ];

        let lastError = null;

        for (const model of models) {
            try {
                const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

                const geminiResponse = await fetch(geminiUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: prompt }]
                        }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 1024,
                        }
                    })
                });

                const geminiData = await geminiResponse.json();

                if (!geminiResponse.ok) {
                    console.error(`Model ${model} failed:`, geminiData);
                    lastError = geminiData;
                    continue; // Try next model
                }

                // Check if response has the expected structure
                if (!geminiData.candidates || !geminiData.candidates[0] ||
                    !geminiData.candidates[0].content || !geminiData.candidates[0].content.parts) {
                    console.error(`Model ${model} returned unexpected structure:`, geminiData);
                    lastError = { error: { message: "Unexpected response structure" } };
                    continue;
                }

                const aiResponse = geminiData.candidates[0].content.parts[0].text;

                return new Response(JSON.stringify({
                    success: true,
                    response: aiResponse,
                    model: model,
                    timestamp: new Date().toISOString()
                }), {
                    headers: corsHeaders
                });

            } catch (modelError) {
                console.error(`Error with model ${model}:`, modelError);
                lastError = modelError;
                continue; // Try next model
            }
        }

        // If all models failed, throw the last error
        throw new Error(lastError?.error?.message || lastError?.message || "All models failed to respond correctly.");

    } catch (error) {
        console.error("Function Error:", error);

        return new Response(JSON.stringify({
            success: false,
            error: 'Internal server error',
            message: error.message || 'Unknown error occurred',
            timestamp: new Date().toISOString()
        }), {
            status: 500,
            headers: corsHeaders
        });
    }
}
