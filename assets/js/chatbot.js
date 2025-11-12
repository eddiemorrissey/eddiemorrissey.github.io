// Chatbot functionality using Hugging Face Inference API
(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    // Using a reliable, fast model for free tier
    model: 'microsoft/DialoGPT-medium',
    apiUrl: 'https://api-inference.huggingface.co/models/',
    maxTokens: 150,
    temperature: 0.7,
    systemPrompt: `You are a helpful AI assistant on Eddie Morrissey's personal website. Be friendly, concise, and informative. If asked about Eddie, mention that this is his personal website and you can help visitors navigate or answer general questions.`,
    retryDelay: 5000, // Wait 5 seconds before retry if model is loading
    maxRetries: 2
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

  async function queryHuggingFace(message, retryCount = 0) {
    // Build conversation context
    conversationHistory.push({ role: 'user', content: message });
    
    // Keep only last 4 messages to avoid token limits
    if (conversationHistory.length > 4) {
      conversationHistory = conversationHistory.slice(-4);
    }
    
    // Format prompt for DialoGPT (conversational model)
    let prompt = conversationHistory
      .map(msg => msg.content)
      .join(' ');
    
    const apiUrl = CONFIG.apiUrl + CONFIG.model;
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: CONFIG.maxTokens,
            temperature: CONFIG.temperature,
            top_p: 0.9,
          },
          options: {
            wait_for_model: true,
            use_cache: false
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // If model is loading and we haven't exceeded retries
        if (response.status === 503 && retryCount < CONFIG.maxRetries) {
          const estimatedTime = errorData.estimated_time || CONFIG.retryDelay / 1000;
          addMessage('bot', `Model is loading... Please wait ${Math.ceil(estimatedTime)} seconds.`);
          await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay));
          
          // Remove the loading message
          const messages = document.getElementById('chatbot-messages');
          const lastMessage = messages.lastElementChild;
          if (lastMessage) messages.removeChild(lastMessage);
          
          return queryHuggingFace(message, retryCount + 1);
        }
        
        throw new Error(errorData.error || `API error (${response.status})`);
      }

      const data = await response.json();
      
      let botResponse = '';
      if (Array.isArray(data) && data[0]?.generated_text) {
        botResponse = data[0].generated_text.trim();
      } else if (data.generated_text) {
        botResponse = data.generated_text.trim();
      } else {
        throw new Error('Unexpected response format');
      }
      
      // Extract only the new response (remove the input prompt)
      botResponse = botResponse.replace(prompt, '').trim();
      
      // Store bot response in history
      conversationHistory.push({ role: 'assistant', content: botResponse });
      
      return botResponse || 'I\'m here to help! What would you like to know?';
    } catch (error) {
      // Remove user message from history on error
      conversationHistory.pop();
      throw error;
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
  } else {
    initChatbot();
  }
})();
