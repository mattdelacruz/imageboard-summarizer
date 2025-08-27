const modelEndpoints = {
    'gemini': 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    'gpt-4.0-turbo': 'https://api.openai.com/v1/chat/completions'
};

const modelHeaders = {
    'gemini': () => ({
        'Content-Type': 'application/json',
    }),
    'gpt-4.0-turbo': (apiKey) => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    })
};

browser.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    // Handles API call requests to the AI model
    if (request.action === "makeAPICall") {
        //console.log("Received API call request:", request);
        const { model, apiKey, body } = request;
        //console.log(`Model: ${model}`);
        if (!modelEndpoints[model] || !modelHeaders[model]) {
            sendResponse({ error: `Unsupported model: ${model}` });
            return false;
        }

        const apiUrl = modelEndpoints[model];
        const fetchOptions = {
            method: 'POST',
            headers: modelHeaders[model](apiKey),
            body: JSON.stringify(body)
        };

        fetch(`${apiUrl}${model === 'gemini' ? `?key=${apiKey}` : ''}`, fetchOptions)
            .then(async response => {
                //console.log(`${model} API response status:`, response.status);
                //console.log(`${model} API response headers:`, Object.fromEntries(response.headers.entries()));

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`${model} API Error Response:`, errorText);
                    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
                }
                const data = await response.json();
                //console.log(`${model} API success response:`, data);

                // Extract and log actual AI output and input
                let inputText = "[Missing input]";
                let textOutput = "[No response text found]";
                let system_instruction = "[None]";
                let thread_context = null;

                if (model === 'gemini') {
                    // Handle Gemini response structure
                    inputText = body.contents?.[body.contents.length - 1]?.parts?.[0]?.text || "[Missing input]";
                    textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[No response text found]";

                    // Extract system instruction from contents
                    const systemMessage = body.contents?.find(content =>
                        content.role === "user" && content.parts?.[0]?.text?.includes("4chan user")
                    );
                    system_instruction = systemMessage?.parts?.[0]?.text || "[None]";

                    // Extract thread context
                    const contextMessage = body.contents?.find(content =>
                        content.role === "user" && content.parts?.[0]?.text?.startsWith("Context:")
                    );
                    thread_context = contextMessage?.parts?.[0]?.text?.replace("Context: ", "") || null;
                } else {
                    // Handle OpenAI response structure
                    inputText = body.messages?.[body.messages.length - 1]?.content || "[Missing input]";
                    textOutput = data?.choices?.[0]?.message?.content || "[No response text found]";
                }

                sendResponse({ data });
            })
            .catch(error => {
                console.error(`${model} Fetch error:`, error);
                sendResponse({ error: error.message });
            });
        return true; // Keep the message channel open for async response
    }

    // Gets the selected AI model
    if (request.action === "getModel") {
        browser.storage.local.get("AI_MODEL").then((result) => {
            sendResponse({ model: result.AI_MODEL || null });
        });
        return true;
    }

    // Saves the selected AI model to the local browser storage
    if (request.action === "saveModel") {
        browser.storage.local.set({ AI_MODEL: request.model }).then(() => {
            sendResponse({ success: true });
        });
        return true;
    }
});