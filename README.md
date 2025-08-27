# Imageboard Summarizer

A browser extension that summarizes 4chan threads using AI models (Google Gemini or OpenAI GPT-4). The extension extracts the original post (OP) and all replies, then generates a concise summary in the style of Konata from Lucky Star.

## Features

- Summarizes entire 4chan threads with context.
- Supports multiple AI models (Gemini, GPT-4).
- Custom system instructions for personality and style.
- Floating chat avatar UI for easy interaction.
- API keys stored locally for privacy.

## Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/yourusername/imageboard-summarizer.git
   cd imageboard-summarizer
   ```

2. **Install dependencies (if using Node.js tooling):**

   ```sh
   npm install
   ```

3. **Add your API keys:**

   - Create a `.env` file or edit `content/apiKey.js` (see `.gitignore` for details).
   - **Do not commit your API keys!**

4. **Load the extension in your browser:**
   - For Firefox: Go to `about:debugging`, click "Load Temporary Add-on", and select `manifest.json`.
   - For Chrome: Go to `chrome://extensions`, enable "Developer mode", click "Load unpacked", and select the project folder.

## Usage

1. Browse to a 4chan thread.
2. Click the floating avatar in the bottom-right corner.
3. The extension will summarize the thread using your selected AI model.
4. Change models or settings as needed.

## Project Structure

```
ai_models/
  base-model.js
  chatGPT4-model.js
  gemini-model.js
4chan/
  4chan.js
  4chan-style.js
content/
  chatbot.js
  content.css
background/
  background-script.js
```

## Configuration

- **API Keys:**  
  Store your Gemini or OpenAI API keys in a local file as described above.
- **Model Selection:**  
  Choose your preferred AI model in the extension settings.

## Development

- **.gitignore** is set up to ignore sensitive files, build artifacts, and editor settings.
- Contributions are welcome! Please open issues or pull requests.

---

**Note:** This project is not affiliated with 4chan.
