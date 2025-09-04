class Chatbot {
	constructor(systemInstruction = '') {
		this.initializeUI();
		this.modelFactories = {
			'gemini': () => new GeminiModel(systemInstruction),
			'gpt-4.0-turbo': () => new ChatGPT4Model()
		};
		this.models = {};
		this.currentModelName = null;
		this.currentModelInstance = null;
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

	async setModel(modelName) {
		if (!this.modelFactories.hasOwnProperty(modelName)) {
			throw new Error(`Model ${modelName} is not supported or configured.`);
		}
		if (!this.models[modelName]) {
			this.models[modelName] = this.modelFactories[modelName]();
		}
		this.currentModelName = modelName;
		this.currentModelInstance = this.models[modelName];
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

	async addToContext(message, type) {
		if (!this.currentModelInstance) {
			throw new Error('No model selected. Please select a model first.');
		}
		this.currentModelInstance.addToContext(message, type);
	}

	async getContext() {
		if (!this.currentModelInstance) {
			throw new Error('No model selected. Please select a model first.');
		}
		return this.currentModelInstance.getContext();
	}

	async getChatbotResponse() {
		let loadingTimeout;
		try {
			loadingTimeout = setTimeout(() => {
				this.addMessage('Chotto matte kudasai...');
			}, 5000);

			if (!this.currentModelInstance) {
				throw new Error('No model selected. Please select a model first.');
			}
			const response = await this.currentModelInstance.generateResponse();
			clearTimeout(loadingTimeout);
			this.currentModelInstance.clearContext();
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
