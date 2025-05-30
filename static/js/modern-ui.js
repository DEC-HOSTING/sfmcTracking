/**
 * Modern UI JavaScript - Google-Inspired Interactions
 * Smooth animations, toast notifications, and enhanced UX
 */

// ========================================
// GLOBAL STATE MANAGEMENT
// ========================================
const UIState = {
  isTyping: false,
  messagesContainer: null,
  chatInput: null,
  sendButton: null,
  toastContainer: null
};

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', function() {
  initializeUI();
  setupEventListeners();
  setupIntersectionObserver();
  preloadIcons();
});

function initializeUI() {
  UIState.messagesContainer = document.getElementById('chat-messages');
  UIState.chatInput = document.getElementById('chat-input');
  UIState.sendButton = document.getElementById('send-button');
  
  // Create toast container
  createToastContainer();
  
  // Initialize reveal animations
  setupRevealAnimations();
  
  // Auto-resize textarea
  setupAutoResize();
  
  console.log('🎨 Modern UI initialized successfully');
}

// ========================================
// TOAST NOTIFICATION SYSTEM
// ========================================
function createToastContainer() {
  UIState.toastContainer = document.createElement('div');
  UIState.toastContainer.className = 'toast-container';
  UIState.toastContainer.setAttribute('aria-live', 'polite');
  UIState.toastContainer.setAttribute('aria-atomic', 'true');
  document.body.appendChild(UIState.toastContainer);
}

function showToast(message, type = 'info', duration = 4000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  
  toast.innerHTML = `
    <div class="toast-icon" aria-hidden="true">${icons[type] || icons.info}</div>
    <div class="toast-content">
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" aria-label="Close notification" type="button">×</button>
  `;
  
  // Add to container
  UIState.toastContainer.appendChild(toast);
  
  // Setup close button
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => dismissToast(toast));
  
  // Auto dismiss
  if (duration > 0) {
    setTimeout(() => dismissToast(toast), duration);
  }
  
  // Animate in
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
  });
  
  return toast;
}

function dismissToast(toast) {
  toast.style.transform = 'translateX(100%)';
  toast.style.opacity = '0';
  
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
}

// ========================================
// TYPING INDICATOR
// ========================================
function showTypingIndicator() {
  if (UIState.isTyping) return;
  
  UIState.isTyping = true;
  
  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator';
  indicator.id = 'typing-indicator';
  indicator.setAttribute('aria-label', 'AI is typing');
  
  indicator.innerHTML = `
    <div class="typing-avatar" aria-hidden="true">AI</div>
    <div class="typing-dots" aria-hidden="true">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  
  UIState.messagesContainer.appendChild(indicator);
  scrollToBottom();
}

function hideTypingIndicator() {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) {
    indicator.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
    }, 300);
  }
  UIState.isTyping = false;
}

// ========================================
// MESSAGE RENDERING
// ========================================
function addMessage(content, isUser = false, animate = true) {
  const message = document.createElement('div');
  message.className = `message ${isUser ? 'user' : 'assistant'}`;
  
  if (animate) {
    message.style.opacity = '0';
    message.style.transform = 'translateY(20px)';
  }
  
  const timestamp = new Date().toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  message.innerHTML = `
    <div class="message-avatar" aria-hidden="true">${isUser ? 'U' : 'AI'}</div>
    <div class="message-content">
      ${formatMessageContent(content)}
      <div class="message-time">${timestamp}</div>
    </div>
  `;
  
  UIState.messagesContainer.appendChild(message);
  
  if (animate) {
    requestAnimationFrame(() => {
      message.style.transition = 'all 0.4s ease-out';
      message.style.opacity = '1';
      message.style.transform = 'translateY(0)';
    });
  }
  
  scrollToBottom();
  return message;
}

function formatMessageContent(content) {
  // Basic markdown-like formatting
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}

// ========================================
// SMOOTH SCROLLING
// ========================================
function scrollToBottom(smooth = true) {
  if (!UIState.messagesContainer) return;
  
  const scrollOptions = {
    top: UIState.messagesContainer.scrollHeight,
    behavior: smooth ? 'smooth' : 'auto'
  };
  
  UIState.messagesContainer.scrollTo(scrollOptions);
}

// ========================================
// AUTO-RESIZE TEXTAREA
// ========================================
function setupAutoResize() {
  if (!UIState.chatInput) return;
  
  UIState.chatInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    
    // Update send button state
    updateSendButtonState();
  });
  
  UIState.chatInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
}

function updateSendButtonState() {
  if (!UIState.sendButton || !UIState.chatInput) return;
  
  const hasContent = UIState.chatInput.value.trim().length > 0;
  UIState.sendButton.disabled = !hasContent || UIState.isTyping;
  
  if (hasContent && !UIState.isTyping) {
    UIState.sendButton.classList.add('active');
  } else {
    UIState.sendButton.classList.remove('active');
  }
}

// ========================================
// REVEAL ANIMATIONS
// ========================================
function setupRevealAnimations() {
  const revealElements = document.querySelectorAll('.reveal');
  
  revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
  });
}

function setupIntersectionObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
  });
}

// ========================================
// LOADING STATES
// ========================================
function setLoadingState(element, isLoading, loadingText = '') {
  if (!element) return;
  
  if (isLoading) {
    element.classList.add('loading');
    element.disabled = true;
    if (loadingText) {
      element.setAttribute('data-original-text', element.textContent);
      element.textContent = loadingText;
    }
  } else {
    element.classList.remove('loading');
    element.disabled = false;
    const originalText = element.getAttribute('data-original-text');
    if (originalText) {
      element.textContent = originalText;
      element.removeAttribute('data-original-text');
    }
  }
}

// ========================================
// RIPPLE EFFECT
// ========================================
function createRipple(event) {
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: scale(0);
    animation: ripple 0.6s linear;
    pointer-events: none;
  `;
  
  button.appendChild(ripple);
  
  setTimeout(() => {
    if (ripple.parentNode) {
      ripple.parentNode.removeChild(ripple);
    }
  }, 600);
}

// ========================================
// EVENT LISTENERS
// ========================================
function setupEventListeners() {
  // Send button click
  if (UIState.sendButton) {
    UIState.sendButton.addEventListener('click', sendMessage);
    UIState.sendButton.addEventListener('click', createRipple);
  }
  
  // Input focus effects
  if (UIState.chatInput) {
    UIState.chatInput.addEventListener('focus', () => {
      UIState.chatInput.parentElement.classList.add('focused');
    });
    
    UIState.chatInput.addEventListener('blur', () => {
      UIState.chatInput.parentElement.classList.remove('focused');
    });
  }
  
  // Scroll to bottom on new messages
  if (UIState.messagesContainer) {
    const observer = new MutationObserver(() => {
      scrollToBottom();
    });
    
    observer.observe(UIState.messagesContainer, {
      childList: true,
      subtree: true
    });
  }
  
  // Suggestion chips
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('suggestion-chip')) {
      const suggestion = e.target.textContent.trim();
      if (UIState.chatInput) {
        UIState.chatInput.value = suggestion;
        UIState.chatInput.focus();
        updateSendButtonState();
      }
    }
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to send
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
    
    // Escape to clear input
    if (e.key === 'Escape' && UIState.chatInput) {
      UIState.chatInput.value = '';
      UIState.chatInput.focus();
      updateSendButtonState();
    }
  });
}

// ========================================
// ENHANCED SEND MESSAGE FUNCTION
// ========================================
async function sendMessage() {
  if (!UIState.chatInput || UIState.isTyping) return;
  
  const message = UIState.chatInput.value.trim();
  if (!message) return;
  
  // Clear input and update state
  UIState.chatInput.value = '';
  UIState.chatInput.style.height = 'auto';
  updateSendButtonState();
  
  // Add user message
  addMessage(message, true);
  
  // Show typing indicator
  showTypingIndicator();
  setLoadingState(UIState.sendButton, true);
  
  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: message }]
      })
    });
    
    const data = await response.json();
    
    // Hide typing indicator
    hideTypingIndicator();
    
    if (data.success) {
      // Add AI response
      addMessage(data.response, false);
      
      // Show success toast
      showToast('Message sent successfully!', 'success', 2000);
    } else {
      // Show error
      addMessage(data.fallback_message || 'Sorry, I encountered an error.', false);
      showToast(data.error || 'Failed to send message', 'error');
    }
    
  } catch (error) {
    console.error('Chat error:', error);
    hideTypingIndicator();
    addMessage('Sorry, I\'m having trouble connecting. Please try again.', false);
    showToast('Connection error. Please check your internet.', 'error');
  } finally {
    setLoadingState(UIState.sendButton, false);
    updateSendButtonState();
    UIState.chatInput.focus();
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================
function preloadIcons() {
  // Preload any SVG icons or images used in the interface
  const iconPaths = [
    '/static/icons/send.svg',
    '/static/icons/user.svg',
    '/static/icons/ai.svg'
  ];
  
  iconPaths.forEach(path => {
    const img = new Image();
    img.src = path;
  });
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// ========================================
// PERFORMANCE MONITORING
// ========================================
function measurePerformance(name, fn) {
  return function(...args) {
    const start = performance.now();
    const result = fn.apply(this, args);
    const end = performance.now();
    console.log(`🚀 ${name} executed in ${(end - start).toFixed(2)}ms`);
    return result;
  };
}

// ========================================
// CSS ANIMATIONS
// ========================================
const styles = document.createElement('style');
styles.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  @keyframes fadeOut {
    to {
      opacity: 0;
      transform: translateY(-10px);
    }
  }
  
  .focused .chat-input {
    transform: scale(1.01);
  }
  
  .btn.active {
    animation: pulse 2s infinite;
  }
`;
document.head.appendChild(styles);

// ========================================
// EXPORT FOR GLOBAL ACCESS
// ========================================
window.ModernUI = {
  showToast,
  addMessage,
  setLoadingState,
  scrollToBottom,
  updateSendButtonState
};

console.log('🎨 Modern UI JavaScript loaded successfully');
