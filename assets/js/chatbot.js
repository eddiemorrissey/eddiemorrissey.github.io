// Chatbot functionality using Hugging Face Inference API
(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    // Using a smaller, faster model for free tier - you can change this
    model: 'microsoft/Phi-3-mini-4k-instruct',
    apiUrl: 'https://api-inference.huggingface.co/models/',
    maxTokens: 512,
    temperature: 0.7,
    systemPrompt: `You are a helpful AI assistant on Eddie Morrissey's personal website. Be friendly, concise, and informative. If asked about Eddie, mention that this is his personal website and you can help visitors navigate or answer general questions.`
  };

  let conversationHistory = [];
  let isOpen = false;

  // Initialize chatbot
  function initChatbot() {
    const button = document.getElementById('chatbot-button');
    const closeBtn = document.getElementById('chatbot-close');
    const sendBtn = document.getElementById('chatbot-send');
    const input = document.getElementById('chatbot-input');

    if (!button) return;

    button.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);
    sendBtn.addEventListener('click', sendMessage);
    
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Add welcome message
    addMessage('bot', 'Hello! I\'m an AI assistant. How can I help you today?');
  }

  function toggleChat() {
    isOpen = !isOpen;
    const window = document.getElementById('chatbot-window');
    if (isOpen) {
      window.classList.add('open');
      document.getElementById('chatbot-input').focus();
    } else {
      window.classList.remove('open');
    }
  }

  function addMessage(type, text) {
    const messagesDiv = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;
    
    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.appendChild(bubble);
    messageDiv.appendChild(time);
    messagesDiv.appendChild(messageDiv);
    
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function showTyping(show) {
    const typing = document.getElementById('typing-indicator');
    if (show) {
      typing.classList.add('active');
    } else {
      typing.classList.remove('active');
    }
    const messagesDiv = document.getElementById('chatbot-messages');
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  async function sendMessage() {
    const input = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addMessage('user', message);
    input.value = '';
    
    // Disable input while processing
    input.disabled = true;
    sendBtn.disabled = true;
    showTyping(true);
    
    try {
      // Call Hugging Face API
      const response = await queryHuggingFace(message);
      showTyping(false);
      addMessage('bot', response);
    } catch (error) {
      showTyping(false);
      console.error('Chatbot error:', error);
      addMessage('bot', 'Sorry, I encountered an error. Please try again later. Note: The free API may have rate limits.');
    } finally {
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  async function queryHuggingFace(message) {
    // Build conversation context
    conversationHistory.push({ role: 'user', content: message });
    
    // Keep only last 6 messages to avoid token limits
    if (conversationHistory.length > 6) {
      conversationHistory = conversationHistory.slice(-6);
    }
    
    // Format prompt for the model
    let prompt = CONFIG.systemPrompt + '\n\n';
    conversationHistory.forEach(msg => {
      prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });
    prompt += 'Assistant:';
    
    const apiUrl = CONFIG.apiUrl + CONFIG.model;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: CONFIG.maxTokens,
          temperature: CONFIG.temperature,
          return_full_text: false,
          do_sample: true,
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 503) {
        throw new Error('Model is loading, please wait a moment and try again.');
      }
      throw new Error(error.error || 'API request failed');
    }

    const data = await response.json();
    
    let botResponse = '';
    if (Array.isArray(data) && data[0]?.generated_text) {
      botResponse = data[0].generated_text.trim();
    } else if (data.generated_text) {
      botResponse = data.generated_text.trim();
    } else {
      throw new Error('Unexpected API response format');
    }
    
    // Clean up response
    botResponse = botResponse.replace(/^Assistant:\s*/i, '');
    
    // Store bot response in history
    conversationHistory.push({ role: 'assistant', content: botResponse });
    
    return botResponse || 'I\'m not sure how to respond to that.';
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
  } else {
    initChatbot();
  }
})();
