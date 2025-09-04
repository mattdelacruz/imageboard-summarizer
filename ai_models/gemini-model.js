class GeminiModel extends BaseAIModel {
    constructor(systemInstruction = '') {
        super('GEMINI_API_KEY');
        this.systemInstruction = systemInstruction;
        this.contents = [];
    }

    addToContext(message, isOp = false) {
        if (isOp) {
            this.contents.push({
                "role": "user",
                "parts": [{ "text": `This is the OP.` }]
            });
            this.contents.push({
                "role": "model",
                "parts": [{ "text": "Got it." }]
            });
        }

        // Add the current user message
        console.log(`Adding to context: ${message}`);
        this.contents.push({
            "role": "user",
            "parts": [{ "text": message }]
        });
    }

    async generateResponse() {
        const geminiApiKey = await this.getApiKey();
        if (!geminiApiKey) {
            return 'Please configure your Google Gemini API key in the settings.';
        }

        // Add system instruction if provided
        if (this.systemInstruction) {
            this.contents.push({
                "role": "user",
                "parts": [{ "text": this.systemInstruction }]
            });
            this.contents.push({
                "role": "model",
                "parts": [{ "text": "I understand. I will respond as a 4chan summarizer and will reply like Konata from Lucky Star." }]
            });
        }
        const body = {
            "contents": this.contents,
            "generationConfig": {
                //"maxOutputTokens": 75,
                "temperature": 0.1
            }
        };

        try {
            // console.log('Sending Gemini API request:', JSON.stringify(body, null, 2));

            const response = await browser.runtime.sendMessage({
                action: "makeAPICall",
                model: "gemini",
                apiKey: geminiApiKey,
                body: body
            });

            // console.log('Received Gemini API response:', response);

            if (response.error) {
                throw new Error(response.error);
            }

            // Check if the response has the expected structure
            if (!response.data || !response.data.candidates || !response.data.candidates[0]) {
                console.error('Unexpected API response structure:', response);
                throw new Error('Invalid response structure from Gemini API');
            }

            const candidate = response.data.candidates[0];
            if (!candidate.content || !candidate.content.parts || !candidate.content.parts[0]) {
                console.error('Invalid candidate structure:', candidate);
                throw new Error('Invalid candidate structure in Gemini response');
            }

            const result = candidate.content.parts[0].text;
            // console.log('Gemini API success, result:', result);
            return result;
        } catch (error) {
            console.error('Gemini API error:', error);
            return `Error communicating with Google Gemini: ${error.message}`;
        }
    }

    clearContext() {
        this.contents = [];
    }

    getContext() {
        return this.contents;
    }
}