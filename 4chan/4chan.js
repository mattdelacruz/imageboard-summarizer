const systemInstruction = `You are a 4chan summarizer, your job is to summarize the entire thread and provide context of what is being discussed. You are already given the original post (OP), which will give you the topic of discussion, and then you were already given all the replies in this thread, then you will provide a summary based on what the users are talking about. And you must reply like you're Konata from Lucky Star.`;
const chatbot = new Chatbot(systemInstruction);
let threadContext = null;

// Cleans up the post message by removing quote links and returning a dictionary for the AI model to read
function processPostMessage(postMessage) {
  if (!postMessage) {
    console.error('Error: postMessage is null or undefined');
    return { quoteLinkTexts: [], cleanedText: '' };
  }

  const quoteLinks = postMessage.querySelectorAll('.quotelink');
  const quoteLinkTexts = Array.from(quoteLinks).map(link => link.textContent);

  const clone = postMessage.cloneNode(true);

  clone.querySelectorAll('.quotelink').forEach(link => link.remove());

  const restText = clone.textContent.trim();

  return {
    quoteLinkTexts: quoteLinkTexts,
    cleanedText: restText
  };
}

// Helper function that appends a post to the AI context
async function addToAIContext(postElement, type, currModel) {
  const postMessage = postElement.querySelector('.postMessage');
  if (postMessage) {
    const result = processPostMessage(postMessage);
    threadContext = result.cleanedText;
    if (type == 'op') {
      await chatbot.addToContext(result.cleanedText, true, currModel);
    } else {
      await chatbot.addToContext(result.cleanedText, false, currModel);
    }
  }
}

// Helper to get selected model from storage
async function getSelectedModel() {
  const result = await browser.storage.local.get('AI_MODEL');
  return result['AI_MODEL'] || null;
}

// Main event listener for thread clicks
document.addEventListener('click', async (event) => {
  const threadElement = event.target.closest('.thread');
  if (!threadElement) return;
  if (event.target.closest('.fileThumb')) return;

  const currModel = await getSelectedModel();
  if (!currModel) {
    chatbot.addMessage('Please select an AI model in the settings.');
    return;
  }

  // Set the model on the chatbot instance before using it
  await chatbot.setModel(currModel);

  const threadPosts = threadElement.querySelectorAll('.post');
  if (threadPosts.length === 0) return;

  for (const postElement of threadPosts) {
    if (postElement.classList.contains('op')) {
      await addToAIContext(postElement, 'op', currModel);
    } else if (postElement.classList.contains('reply')) {
      await addToAIContext(postElement, 'reply', currModel);
    }
  }

  let botResponse = null;
  try {
    botResponse = await chatbot.getChatbotResponse();
  } catch (error) {
    console.error('Error getting chatbot response:', error);
    chatbot.addMessage(error.message || 'An error occurred while generating the response.');
    return;
  }
  chatbot.addMessage(botResponse);
});
