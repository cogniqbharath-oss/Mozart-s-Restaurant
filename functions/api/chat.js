export async function onRequest(context) {
    const { request, env } = context;

    if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const data = await request.json();
        const userMessage = data.message || "";

        // Ping check for debugging
        if (userMessage.toLowerCase() === 'ping') {
            return new Response(JSON.stringify({
                success: true,
                response: "Pong! API is working. 🏓",
                timestamp: new Date().toISOString()
            }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // Default API key or from environment variable
        const apiKey = env.GEMINI_API_KEY || "AIzaSyAiZobQ9Ra1cZkFdKeG5aXeDcOZGDq6i60";

        if (!apiKey) {
            throw new Error("API Key not found");
        }

        // Context generation
        const now = new Date();
        const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
        const currentHour = now.getHours();
        const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

        let currentInfo = `Current day: ${dayName}, Current time: ${timeString}\n`;

        // Add live music notification if Friday evening
        if (dayName === "Friday" && currentHour >= 19 && currentHour < 22) {
            currentInfo += "SPECIAL: Live music is currently playing! 🎵\n";
        } else if (dayName === "Friday") {
            currentInfo += "REMINDER: Live music tonight from 7:00 PM - 10:00 PM!\n";
        }

        // Peak hours warning
        if (currentHour >= 18 && currentHour <= 21) {
            currentInfo += "NOTE: Currently peak dining hours - service may be slower. Reservations recommended.\n";
        }

        const RESTAURANT_CONTEXT = `
You are an AI Concierge for Mozart's Restaurant, a fine dining establishment in Leavenworth, WA.

 RESTAURANT INFORMATION:
- Name: Mozart's Restaurant
- Location: 829 Front St, Upstairs, Leavenworth, WA 98826, United States
- Phone: +1 (509) 548-0600
- Email: host@mozartsrestaurant.com, info@mozartsrestaurant.com
- Website: mozartsrestaurant.com
- Type: Woman-owned fine European/Austrian and Pacific Northwest cuisine
- Price Range: $50-$100 per person
- Atmosphere: Romantic, upscale fine dining

MENU HIGHLIGHTS:
- Oktoberfest Sampler (seasonal specialty)
- Pacific Northwest Salmon ($42)
- Wiener Schnitzel ($38)
- Wild Mushroom Risotto ($32)
- Extensive wine cellar with 200+ selections from 15+ countries
- Gluten-free and vegetarian options available

SPECIAL FEATURES:
- Live music every Friday night (7:00 PM - 10:00 PM)
- Extensive temperature-controlled wine cellar
- Seasonal specialties and chef-driven menu
- Special dietary accommodations (gluten-free, vegetarian)

IMPORTANT POLICIES & PAIN POINTS:
1. RESERVATION SYSTEM: Currently being updated. Customers should call (509) 548-0600 or email for reservations.
2. HIGH-VALUE DINING: $50-$100 per person - advanced reservations strongly recommended
3. NO-SHOW PREVENTION: Due to high-value dining, we encourage confirmation calls 24 hours before
4. SERVICE TIMING: Peak hours (6pm-9pm) may have slower service. Off-peak dining recommended for faster service.
5. LARGE GROUPS: Require advance notice and coordination

YOUR ROLE:
- Help customers make reservations (collect: name, date, time, party size, special requests)
- Answer questions about menu, dietary options, pricing
- Provide information about live music schedule and special events
- Recommend dishes and wine pairings
- Address the restaurant's pain points proactively
- Be warm, professional, and reflect the upscale European dining experience
- If unable to complete a reservation online, direct them to call or email

IMPORTANT: Always be helpful, professional, and convey the premium nature of Mozart's dining experience.
When helping with reservations, collect all necessary details and inform them you'll have the restaurant confirm via phone or email.
`;

        const prompt = `${RESTAURANT_CONTEXT}

${currentInfo}

CUSTOMER QUESTION/REQUEST:
${userMessage}

Provide a helpful, professional response that addresses their needs while maintaining the upscale, European fine dining atmosphere of Mozart's Restaurant. Be warm and engaging.
`;

        // Call Gemini API via REST
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const geminiResponse = await fetch(geminiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const geminiData = await geminiResponse.json();

        if (!geminiResponse.ok) {
            console.error("Gemini API Error:", geminiData);
            throw new Error(geminiData.error?.message || "Failed to fetch from Gemini");
        }

        const aiResponse = geminiData.candidates[0].content.parts[0].text;

        return new Response(JSON.stringify({
            success: true,
            response: aiResponse,
            timestamp: new Date().toISOString()
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Function Error:", error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Internal server error',
            message: error.message,
            stack: error.stack,
            details: 'Please share this error with the developer.'
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
