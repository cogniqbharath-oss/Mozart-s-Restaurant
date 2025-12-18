
const apiKey = "AIzaSyAVVDMr6_-jsFx7m6XrkJit27Lq7JxsH6A";

async function testGemini() {
    const prompt = "Hello, can you hear me?";

    // Call Gemini API via REST
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`;

    console.log("Testing Gemini API...");
    console.log("URL:", geminiUrl.replace(apiKey, "HIDDEN_KEY"));

    try {
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
            console.error("Gemini API Error:", JSON.stringify(geminiData, null, 2));
        } else {
            console.log("Success!");
            console.log("Response:", geminiData.candidates[0].content.parts[0].text);
        }
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

testGemini();
