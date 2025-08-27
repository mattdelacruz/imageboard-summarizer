class Chatbot {
	constructor(systemInstruction = '') {
		this.initializeUI();
		this.modelFactories = {
			'gemini': () => new GeminiModel(systemInstruction),
			'gpt-4.0-turbo': () => new ChatGPT4Model()
		};
		this.models = {};
	}

	initializeUI() {
		this.avatar = document.createElement('div');
		this.avatar.id = 'floating-avatar';
		document.body.appendChild(this.avatar);

		this.avatarChat = document.createElement('div');
		this.avatarChat.id = 'avatar-chat';
		this.avatarChat.innerHTML = `
            <div id="chat-box">
            <div class="chat-messages" id="chat-messages"></div>
            </div>
        `;
		document.body.appendChild(this.avatarChat);

		this.avatarChat.style.display = 'none';

		this.avatar.addEventListener('click', () => {
			this.avatarChat.style.display = this.avatarChat.style.display === 'none' ? 'block' : 'none';
		});
	}

	addMessage(message) {
		const messages = document.querySelector('#chat-messages');
		messages.innerHTML = '';
		const messageBubble = document.createElement('div');
		messageBubble.textContent = `${message}`;
		messages.appendChild(messageBubble);
		messages.scrollTop = messages.scrollHeight;
		if (this.avatarChat.style.display === 'none') {
			this.avatarChat.style.display = 'block';
		}
	}

	async addToContext(message, type, model) {
		let selectedModel = await this.loadModel(model);
		selectedModel.addToContext(message, type);
	}

	async loadModel(model) {
		console.log(model)
		if (!this.models[model]) {
			if (this.modelFactories.hasOwnProperty(model)) {
				this.models[model] = this.modelFactories[model]();
			} else {
				throw new Error(`Model ${model} is not supported or configured.`);
			}
		}
		return this.models[model];
	}

	async getChatbotResponse(model) {
		let loadingTimeout;
		try {
			loadingTimeout = setTimeout(() => {
				this.addMessage('Chotto matte kudasai...');
			}, 5000);

			const selectedModel = await this.loadModel(model);
			const response = await selectedModel.generateResponse();
			clearTimeout(loadingTimeout);
			selectedModel.clearContext();
			this.addMessage(response);
			return response;
		} catch (error) {
			clearTimeout(loadingTimeout);

			const errorMessage = `Error: ${error.message}`;
			this.addMessage(errorMessage);
			return errorMessage;
		}
	}


}
