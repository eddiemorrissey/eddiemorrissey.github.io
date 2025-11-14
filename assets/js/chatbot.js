// Chatbot functionality with simple rule-based responses
(function() {
  'use strict';

  let conversationHistory = [];

  // Simple response patterns
  const responses = {
    greetings: [
      "Hello! How can I help you today?",
      "Hi there! What can I do for you?",
      "Hey! How may I assist you?"
    ],
    about: [
      "This is Eddie Morrissey's personal website. You can explore his portfolio, experience, and CV using the navigation menu above.",
      "Eddie Morrissey is a professional in the Medical Device field based in Boston, MA. Feel free to explore the site to learn more!"
    ],
    portfolio: [
      "You can view Eddie's portfolio by clicking the 'Portfolio' link in the navigation menu.",
      "Check out the Portfolio section to see Eddie's work and projects."
    ],
    contact: [
      "You can reach Eddie at eddiejjmorrissey@gmail.com",
      "Eddie's email is eddiejjmorrissey@gmail.com. Feel free to get in touch!"
    ],
    cv: [
      "You can view Eddie's CV by clicking the 'CV' link in the navigation menu.",
      "Check out the CV section to see Eddie's full professional background."
    ],
    experience: [
      "You can learn about Eddie's experience by clicking 'Experience' in the menu above.",
      "Visit the Experience section to see Eddie's professional background."
    ],
    default: [
      "I'm a simple chatbot here to help you navigate Eddie's website. You can ask me about his portfolio, experience, or how to contact him.",
      "I can help you find information on this website. Try asking about Eddie's portfolio, experience, or contact information.",
      "Feel free to explore the navigation menu above to learn more about Eddie's work and background!"
    ],
    thanks: [
      "You're welcome! Let me know if you need anything else.",
      "Happy to help! Feel free to ask if you have more questions.",
      "My pleasure! Is there anything else I can help with?"
    ]
  };

  // Initialize chatbot
  function initChatbot() {
    const sendBtn = document.getElementById('chatbot-send');
    const input = document.getElementById('chatbot-input');

    if (!sendBtn) return;

    sendBtn.addEventListener('click', sendMessage);
    
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Add welcome message
    addMessage('bot', 'Hello! I\'m here to help you navigate this website. Feel free to ask me about Eddie\'s portfolio, experience, or how to contact him.');
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

  function getResponse(message) {
    const msg = message.toLowerCase();
    
    // Check for greetings
    if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/.test(msg)) {
      return responses.greetings[Math.floor(Math.random() * responses.greetings.length)];
    }
    
    // Check for thanks
    if (/(thank|thanks|thx)/.test(msg)) {
      return responses.thanks[Math.floor(Math.random() * responses.thanks.length)];
    }
    
    // Check for about/who
    if (/(who|about|tell me about|what|eddie|owner)/.test(msg)) {
      return responses.about[Math.floor(Math.random() * responses.about.length)];
    }
    
    // Check for portfolio
    if (/(portfolio|work|project|sample)/.test(msg)) {
      return responses.portfolio[Math.floor(Math.random() * responses.portfolio.length)];
    }
    
    // Check for contact
    if (/(contact|email|reach|touch|message)/.test(msg)) {
      return responses.contact[Math.floor(Math.random() * responses.contact.length)];
    }
    
    // Check for CV/resume
    if (/(cv|resume|curriculum|qualification|education)/.test(msg)) {
      return responses.cv[Math.floor(Math.random() * responses.cv.length)];
    }
    
    // Check for experience
    if (/(experience|background|career|job|work history)/.test(msg)) {
      return responses.experience[Math.floor(Math.random() * responses.experience.length)];
    }
    
    // Default response
    return responses.default[Math.floor(Math.random() * responses.default.length)];
  }

  function sendMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addMessage('user', message);
    input.value = '';
    
    // Get and add bot response with slight delay for natural feel
    setTimeout(() => {
      const response = getResponse(message);
      addMessage('bot', response);
    }, 500);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
  } else {
    initChatbot();
  }
})();
