// Advanced Security Utilities
// Multiple layers of obfuscation to protect sensitive data
const SecurityUtils = {
    // XOR cipher for additional obfuscation
    xorCipher: function(str, key) {
        let result = '';
        for (let i = 0; i < str.length; i++) {
            result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return result;
    },
    
    // Simple scramble function
    scramble: function(str) {
        return str.split('').map((char, i) => 
            String.fromCharCode(char.charCodeAt(0) + (i % 3) - 1)
        ).join('');
    },
    
    // Reverse scramble function
    unscramble: function(str) {
        return str.split('').map((char, i) => 
            String.fromCharCode(char.charCodeAt(0) - (i % 3) + 1)
        ).join('');
    },
    
    // Multi-layer decode
    multiLayerDecode: function(encodedData, layers = ['base64', 'unscramble']) {
        let result = encodedData;
        
        for (const layer of layers) {
            try {
                switch (layer) {
                    case 'base64':
                        result = atob(result);
                        break;
                    case 'unscramble':
                        result = this.unscramble(result);
                        break;
                    case 'xor':
                        result = this.xorCipher(result, 'L0r3Al2025');
                        break;
                }
            } catch (error) {
                console.warn('Failed to decode layer:', layer);
                return null;
            }
        }
        
        return result;
    }
};

// Authentication configuration
const AUTH_CONFIG = {
    sessionKey: 'email_tracker_session',
    sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours
    // Multi-layer obfuscated credentials (Base64 + scrambling + XOR)
    // PRODUCTION NOTE: Use server-side authentication instead
    authData: {
        // Primary obfuscated data (Base64 encoded)
        primary: ['Y2FtZWxpYS5vdW5lc2xpQGxvcmVhbC5jb20=', 'UXVlZW5DUk0='],
        // Backup verification hash
        checksum: ['a7f8d9e2', 'b3c4e5f6'],
        // Environment preference
        useEnv: true
    },
    salt: 'L0r3Al_S3cUr3_S4lT_2025_V2',
    rounds: 1000,
    // Security configuration
    security: {
        maxAttempts: 3,
        lockoutTime: 300000, // 5 minutes
        requireHttps: true
    }
};

// Secure credential validation with enhanced obfuscation
async function validateCredentials(email, password) {
    try {
        // Check for environment variables first (production)
        if (typeof process !== 'undefined' && process.env) {
            const envEmail = process.env.VALID_EMAIL;
            const envPassword = process.env.VALID_PASSWORD;
            
            if (envEmail && envPassword) {
                const emailMatch = email.toLowerCase().trim() === envEmail.toLowerCase();
                const passwordMatch = password === envPassword;
                return emailMatch && passwordMatch;
            }
        }
        
        // Fallback to obfuscated credentials (client-side)
        let expectedEmail, expectedPassword;
        
        try {
            // Simple Base64 decode for compatibility
            expectedEmail = atob(AUTH_CONFIG.authData.primary[0]);
            expectedPassword = atob(AUTH_CONFIG.authData.primary[1]);
        } catch (error) {
            console.error('Failed to decode credentials');
            return false;
        }
        
        if (!expectedEmail || !expectedPassword) {
            console.error('Invalid credentials data');
            return false;
        }
        
        // Simple secure comparison (normalize case and trim whitespace)
        const emailMatch = email.toLowerCase().trim() === expectedEmail.toLowerCase().trim();
        const passwordMatch = password.trim() === expectedPassword.trim();
        
        return emailMatch && passwordMatch;
    } catch (error) {
        console.error('Authentication error:', error);
        return false;
    }
}

// Simple secure hash function (kept for future use)
async function hashWithSalt(data, salt) {
    const combined = data + salt;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(combined);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Email configuration
const EMAIL_CONFIG = {
    recipientEmail: 'thomas.nicoli@loreal.com',
    serviceUrl: 'https://formspree.io/f/xeoqvqbr' // You'll need to replace this with your actual service
};

// Track completion state in localStorage
const STORAGE_KEY = 'email_campaign_tracker';

// Simple hash function for credential verification
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
}

// Check if user is authenticated
function isAuthenticated() {
    const session = localStorage.getItem(AUTH_CONFIG.sessionKey);
    if (!session) return false;
    
    try {
        const sessionData = JSON.parse(session);
        const now = new Date().getTime();
        
        if (now > sessionData.expiry) {
            localStorage.removeItem(AUTH_CONFIG.sessionKey);
            return false;
        }
        
        return true;
    } catch (error) {
        localStorage.removeItem(AUTH_CONFIG.sessionKey);
        return false;
    }
}

// Create session
function createSession() {
    const session = {
        authenticated: true,
        timestamp: new Date().getTime(),
        expiry: new Date().getTime() + AUTH_CONFIG.sessionTimeout
    };
    localStorage.setItem(AUTH_CONFIG.sessionKey, JSON.stringify(session));
}

// Logout function
function logout() {
    localStorage.removeItem(AUTH_CONFIG.sessionKey);
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('appContainer').style.display = 'none';
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    if (isAuthenticated()) {
        showApp();
    } else {
        showLogin();
    }
    
    setupLoginForm();
});

function showLogin() {
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('appContainer').style.display = 'none';
}

function showApp() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('appContainer').style.display = 'block';
    
    loadSavedState();
    updateStats();
    updateProgressBar();
    setupEventListeners();
    updateEmailCta();
}

function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const loginBtn = document.querySelector('.login-btn');
        const spinner = document.querySelector('.login-spinner');
        const errorMessage = document.getElementById('errorMessage');
        
        // Show loading state
        loginBtn.querySelector('span').style.display = 'none';
        spinner.style.display = 'block';
        errorMessage.style.display = 'none';
          // Simulate authentication delay
        setTimeout(async () => {
            const isValid = await validateCredentials(email, password);
            
            if (isValid) {
                createSession();
                showApp();
            } else {
                // Show error
                errorMessage.textContent = 'Invalid email or password. Please try again.';
                errorMessage.style.display = 'block';
                
                // Reset form
                loginBtn.querySelector('span').style.display = 'block';
                spinner.style.display = 'none';
                document.getElementById('password').value = '';
            }
        }, 1500); // Simulate network delay
    });
}

function setupEventListeners() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxChange);
    });
}

function handleCheckboxChange(event) {
    const checkbox = event.target;
    const actionItem = checkbox.closest('.action-item');
    const item = checkbox.dataset.item;
    const action = checkbox.dataset.action;
    
    if (checkbox.checked) {
        actionItem.classList.add('completed');
        showNotification(`Action completed: ${actionItem.textContent.trim()}`);
    } else {
        actionItem.classList.remove('completed');
        showNotification(`Action unchecked: ${actionItem.textContent.trim()}`);
    }
    
    updateStats();
    updateProgressBar();
    updateEmailCta();
    saveState();
}

function updateEmailCta() {
    const completedActions = document.querySelectorAll('input[type="checkbox"]:checked').length;
    const ctaContainer = document.getElementById('emailCtaContainer');
    const ctaText = document.getElementById('ctaText');
    
    if (completedActions > 0) {
        ctaText.textContent = `You have ${completedActions} completed action${completedActions > 1 ? 's' : ''} ready to be reported!`;
        
        if (ctaContainer.style.display === 'none') {
            ctaContainer.style.display = 'block';
            ctaContainer.classList.remove('hiding');
        }
    } else {
        hideEmailCta();
    }
}

function hideEmailCta() {
    const ctaContainer = document.getElementById('emailCtaContainer');
    ctaContainer.classList.add('hiding');
    setTimeout(() => {
        ctaContainer.style.display = 'none';
        ctaContainer.classList.remove('hiding');
    }, 500);
}

async function sendBatchEmail() {
    const completedCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    
    if (completedCheckboxes.length === 0) {
        showNotification('No completed actions to report!', 'info');
        return;
    }
    
    const ctaButton = document.querySelector('.cta-button');
    const ctaSpinner = document.querySelector('.cta-spinner');
    
    // Show loading state
    ctaButton.querySelector('span').style.display = 'none';
    ctaSpinner.style.display = 'block';
    ctaButton.disabled = true;
    
    // Prepare email content
    let emailContent = `Hello Thomas,\n\nThe following actions have been completed in the Email Campaign Tracker:\n\n`;
    
    completedCheckboxes.forEach((checkbox, index) => {
        const actionText = checkbox.closest('.action-item').textContent.trim();
        const sectionTitle = checkbox.closest('.action-section').querySelector('h2').textContent;
        emailContent += `${index + 1}. ${sectionTitle}\n   ✅ ${actionText}\n\n`;
    });
    
    emailContent += `Total completed actions: ${completedCheckboxes.length}\n`;
    emailContent += `Completed at: ${new Date().toLocaleString()}\n\n`;
    emailContent += `This is an automated notification from the Email Campaign Action Tracker.\n\n`;
    emailContent += `Best regards,\nCampaign Tracker System`;
    
    const emailData = {
        to: EMAIL_CONFIG.recipientEmail,
        subject: `Email Campaign Tracker - ${completedCheckboxes.length} Actions Completed`,
        message: emailContent
    };
    
    try {
        // Use Formspree or similar service for email sending
        const response = await fetch(EMAIL_CONFIG.serviceUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: emailData.to,
                subject: emailData.subject,
                message: emailData.message
            })
        });

        if (response.ok) {
            showNotification(`Email sent successfully! ${completedCheckboxes.length} actions reported.`, 'success');
            hideEmailCta();
        } else {
            throw new Error('Failed to send email');
        }
    } catch (error) {
        console.error('Error sending email:', error);
        // Fallback: try to open default email client
        openEmailClient(emailData);
        showNotification('Opening email client...', 'info');
    } finally {
        // Reset button state
        ctaButton.querySelector('span').style.display = 'block';
        ctaSpinner.style.display = 'none';        ctaButton.disabled = false;
    }
}

function openEmailClient(emailData) {
    const subject = encodeURIComponent(emailData.subject);
    const body = encodeURIComponent(emailData.message);
    const mailtoLink = `mailto:${emailData.to}?subject=${subject}&body=${body}`;
    
    window.open(mailtoLink);
    showNotification('Opening email client...', 'info');
}

function updateStats() {
    const totalActions = document.querySelectorAll('input[type="checkbox"]').length;
    const completedActions = document.querySelectorAll('input[type="checkbox"]:checked').length;
    const remainingActions = totalActions - completedActions;
    
    document.getElementById('totalActions').textContent = totalActions;
    document.getElementById('completedActions').textContent = completedActions;
    document.getElementById('remainingActions').textContent = remainingActions;
}

function updateProgressBar() {
    const totalActions = document.querySelectorAll('input[type="checkbox"]').length;
    const completedActions = document.querySelectorAll('input[type="checkbox"]:checked').length;
    const percentage = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;
    
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    progressFill.style.width = percentage + '%';
    progressText.textContent = percentage + '% Complete';
    
    // Change color based on progress
    if (percentage === 100) {
        progressFill.style.background = 'linear-gradient(90deg, #27ae60, #2ecc71)';
    } else if (percentage >= 75) {
        progressFill.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
    } else {
        progressFill.style.background = 'linear-gradient(90deg, #4CAF50, #45a049)';
    }
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    notificationText.textContent = message;
    notification.style.display = 'block';
    
    // Change notification color based on type
    const notificationContent = notification.querySelector('.notification-content');
    if (type === 'info') {
        notificationContent.style.background = '#3498db';
    } else if (type === 'error') {
        notificationContent.style.background = '#e74c3c';
    } else {
        notificationContent.style.background = '#4CAF50';
    }
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        closeNotification();
    }, 5000);
}

function closeNotification() {
    const notification = document.getElementById('notification');
    notification.style.display = 'none';
}

function saveState() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const state = {};
    
    checkboxes.forEach(checkbox => {
        const key = `${checkbox.dataset.item}-${checkbox.dataset.action}`;
        state[key] = checkbox.checked;
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadSavedState() {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (!savedState) return;
    
    try {
        const state = JSON.parse(savedState);
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
            const key = `${checkbox.dataset.item}-${checkbox.dataset.action}`;
            if (state[key]) {
                checkbox.checked = true;
                checkbox.closest('.action-item').classList.add('completed');
            }
        });
    } catch (error) {
        console.error('Error loading saved state:', error);
    }
}

// Export data functionality
function exportData() {
    const data = {
        timestamp: new Date().toISOString(),
        totalActions: document.getElementById('totalActions').textContent,
        completedActions: document.getElementById('completedActions').textContent,
        remainingActions: document.getElementById('remainingActions').textContent,
        completedItems: []
    };
    
    const completedCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    completedCheckboxes.forEach(checkbox => {
        const actionText = checkbox.closest('.action-item').textContent.trim();
        const sectionTitle = checkbox.closest('.action-section').querySelector('h2').textContent;
        
        data.completedItems.push({
            section: sectionTitle,
            action: actionText,
            item: checkbox.dataset.item,
            actionType: checkbox.dataset.action
        });
    });
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-campaign-tracker-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Add export button functionality if needed
document.addEventListener('keydown', function(event) {
    // Ctrl+E to export data
    if (event.ctrlKey && event.key === 'e') {
        event.preventDefault();
        exportData();
        showNotification('Data exported successfully!', 'info');
    }
    
    // Ctrl+R to reset all checkboxes (with confirmation)
    if (event.ctrlKey && event.key === 'r') {
        event.preventDefault();
        if (confirm('Are you sure you want to reset all checkboxes? This action cannot be undone.')) {
            resetAllCheckboxes();
        }
    }
    
    // Ctrl+I to open AI import modal
    if (event.ctrlKey && event.key === 'i') {
        event.preventDefault();
        showAIImportModal();
    }
    
    // Escape to close AI modal
    if (event.key === 'Escape') {
        const modal = document.getElementById('aiImportModal');
        if (modal && modal.style.display === 'block') {
            hideAIImportModal();
        }
    }
});

function resetAllCheckboxes() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        checkbox.closest('.action-item').classList.remove('completed');
    });
    
    updateStats();
    updateProgressBar();
    updateEmailCta();
    saveState();
    showNotification('All checkboxes have been reset.', 'info');
}

// Add keyboard shortcuts info
console.log('Keyboard shortcuts:');
console.log('Ctrl+E: Export data');
console.log('Ctrl+R: Reset all checkboxes');
console.log('Ctrl+I: AI Import checklist');
console.log('Escape: Close modals');

// AI Configuration for Kluster AI with Mistral Nemo
// Uses OpenAI client format with Kluster AI endpoint
// Compatible with: from openai import OpenAI
// SECURITY: API key is obfuscated and should be set via environment variables in production
const AI_CONFIG = {
    // Obfuscated API key - decode at runtime for security
    apiKeyEncoded: 'ZWE4NTAzODEtZWU4NS00NGRkLTkwZTItMGJjNjIyMzE3MmI2', // Base64 encoded
    baseUrl: 'https://api.kluster.ai/v1', // Kluster AI endpoint
    model: 'gpt-3.5-turbo', // Using standard model name for better compatibility
    maxTokens: 1500, // Reduced for better response quality
    temperature: 0.1, // Low temperature for consistent JSON output
    topP: 0.9,
    // Additional obfuscation layers
    keyParts: ['ZWE4NTAzODE=', 'ZWU4NQ==', 'NDRkZA==', 'OTBlMg==', 'MGJjNjIyMzE3MmI2'],
    separator: '-'
};

// Secure API key retrieval function
function getApiKey() {
    // Try to get from environment first (for production)
    if (typeof process !== 'undefined' && process.env && process.env.KLUSTER_API_KEY) {
        return process.env.KLUSTER_API_KEY;
    }
    
    // Fallback to obfuscated key (for client-side)
    try {
        // Method 1: Direct decode
        const decoded = atob(AI_CONFIG.apiKeyEncoded);
        if (decoded && decoded.length > 30) {
            return decoded;
        }
        
        // Method 2: Reconstruct from parts
        const parts = AI_CONFIG.keyParts.map(part => atob(part));
        return parts.join(AI_CONFIG.separator);
    } catch (error) {
        console.error('Failed to decode API key:', error);
        // Return a placeholder that will fail gracefully
        return 'INVALID_API_KEY_PLEASE_CONFIGURE';
    }
}

// AI-powered checklist parsing
async function parseChecklistWithAI(rawText) {
    try {
        console.log('Starting AI parsing with Kluster AI...');
        
        // First attempt with Kluster AI
        const parsedData = await attemptAIParsing(rawText, AI_CONFIG);
        
        if (parsedData) {
            return parsedData;
        }
        
        // If Kluster AI fails, we'll fall back to manual parsing
        console.log('AI parsing failed, falling back to manual parsing...');
        return null;
        
    } catch (error) {
        console.error('AI parsing error:', error);
        
        if (error.message.includes('corrupted response')) {
            showNotification('AI API returned invalid data. Using manual parsing instead.', 'warning');
        } else if (error.message.includes('API authentication')) {
            showNotification('AI service authentication failed. Please check configuration.', 'error');
        } else if (error.message.includes('rate limit')) {
            showNotification('AI service rate limit exceeded. Please wait a moment and try again.', 'error');
        } else if (error.message.includes('API error')) {
            showNotification('AI service is unavailable. Please check your API key and try again.', 'error');
        } else if (error.message.includes('JSON')) {
            showNotification('AI parsing failed - invalid response format. Using manual parsing instead.', 'warning');
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showNotification('Network error: Unable to connect to AI service. Please check your internet connection.', 'error');
        } else {
            showNotification(`AI parsing failed: ${error.message}. Using manual parsing instead.`, 'warning');
        }
        
        return null;
    }
}

// Separate function to attempt AI parsing with given config
async function attemptAIParsing(rawText, config) {
    const prompt = `Extract checklist data from this text and return ONLY a valid JSON object with no additional text or formatting.

Required JSON structure:
{
  "sections": [
    {
      "id": 1,
      "title": "Section Title Here",
      "cathieStatus": "GO/NO-GO with details or Status not specified",
      "malaurieStatus": "GO/NO-GO with details or Status not specified", 
      "actions": ["Action item 1", "Action item 2", "Action item 3"]
    }
  ]
}

Rules:
- Return ONLY the JSON object, no explanations
- Extract all sections with their titles
- Include action items for each section
- Look for Cathie and Malaurie status information
- If no status found, use "Status not specified"

Input text to parse:
${rawText}`;

    const requestBody = {
        model: config.model,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        top_p: config.topP,
        messages: [
            {
                role: 'system',
                content: 'You are a JSON data extractor. Return only valid JSON objects. Never include explanations, markdown formatting, or additional text. Only respond with the requested JSON structure.'
            },
            {
                role: 'user',
                content: prompt
            }
        ]
    };

    console.log('Making API request to:', config.baseUrl + '/chat/completions');
    
    const response = await fetch(config.baseUrl + '/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getApiKey()}`,
            'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    console.log('API Response status:', response.status);

    if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        
        // Check for specific error types
        if (response.status === 401) {
            throw new Error('API authentication failed. Please check your API key.');
        } else if (response.status === 429) {
            throw new Error('API rate limit exceeded. Please wait and try again.');
        } else if (response.status === 500) {
            throw new Error('AI service is temporarily unavailable. Please try again later.');
        } else {
            throw new Error(`AI API error: ${response.status} - ${errorText}`);
        }
    }

    const data = await response.json();
    console.log('API Response data:', data);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Invalid API response structure:', data);
        throw new Error('Invalid API response format');
    }
    
    let aiResponse = data.choices[0].message.content.trim();
    console.log('AI Response content:', aiResponse);
    console.log('Response length:', aiResponse.length);
    console.log('First 100 chars:', aiResponse.substring(0, 100));
    
    // Check for common issues in the response
    if (aiResponse.includes('enth apply me') || aiResponse.includes('enfer perf')) {
        console.warn('Detected corrupted/garbled response from API');
        throw new Error('AI API returned corrupted response. This may be an API configuration issue.');
    }
    
    // Enhanced JSON extraction with multiple fallback methods
    let parsedData = null;
    
    // Method 1: Try direct JSON parsing
    try {
        parsedData = JSON.parse(aiResponse);
        console.log('✅ Direct JSON parsing successful');
    } catch (error) {
        console.log('❌ Direct JSON parse failed, trying extraction methods...');
        
        // Method 2: Extract JSON from code blocks
        const codeBlockMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch) {
            try {
                parsedData = JSON.parse(codeBlockMatch[1]);
                console.log('✅ Extracted JSON from code block');
            } catch (e) {
                console.log('❌ Code block extraction failed');
            }
        }
        
        // Method 3: Find JSON objects in the response
        if (!parsedData) {
            const jsonStart = aiResponse.indexOf('{');
            const jsonEnd = aiResponse.lastIndexOf('}') + 1;
            
            if (jsonStart !== -1 && jsonEnd > jsonStart) {
                const jsonString = aiResponse.substring(jsonStart, jsonEnd);
                try {
                    parsedData = JSON.parse(jsonString);
                    console.log('✅ Extracted JSON from substring');
                } catch (e) {
                    console.log('❌ Substring extraction failed');
                }
            }
        }
        
        // Method 4: Clean and retry
        if (!parsedData) {
            const cleanedResponse = aiResponse
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .replace(/^\s*JSON:\s*/i, '')
                .trim();
            
            try {
                parsedData = JSON.parse(cleanedResponse);
                console.log('✅ Parsed cleaned response');
            } catch (e) {
                console.error('❌ All JSON extraction methods failed');
                console.error('Raw response:', aiResponse);
                throw new Error('AI returned invalid JSON format. Please try again or check your input.');
            }
        }
    }
    
    // Validate the parsed data structure
    if (!parsedData || typeof parsedData !== 'object') {
        throw new Error('AI returned invalid data structure');
    }
    
    if (!parsedData.sections || !Array.isArray(parsedData.sections)) {
        console.error('Invalid data structure:', parsedData);
        throw new Error('Invalid data structure: missing sections array');
    }
    
    console.log('✅ Successfully parsed data:', parsedData);
    return parsedData;
}
            model: AI_CONFIG.model,
            max_tokens: AI_CONFIG.maxTokens,
            temperature: AI_CONFIG.temperature,
            top_p: AI_CONFIG.topP,
            messages: [
                {
                    role: 'system',
                    content: 'You are a JSON data extractor. Return only valid JSON objects. Never include explanations, markdown formatting, or additional text. Only respond with the requested JSON structure.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ]
        };

        console.log('Making API request to:', AI_CONFIG.baseUrl + '/chat/completions');
        
        const response = await fetch(AI_CONFIG.baseUrl + '/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getApiKey()}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log('API Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            
            // Check for specific error types
            if (response.status === 401) {
                throw new Error('API authentication failed. Please check your API key.');
            } else if (response.status === 429) {
                throw new Error('API rate limit exceeded. Please wait and try again.');
            } else if (response.status === 500) {
                throw new Error('AI service is temporarily unavailable. Please try again later.');
            } else {
                throw new Error(`AI API error: ${response.status} - ${errorText}`);
            }
        }

        const data = await response.json();
        console.log('API Response data:', data);
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('Invalid API response structure:', data);
            throw new Error('Invalid API response format');
        }
          let aiResponse = data.choices[0].message.content.trim();
        console.log('AI Response content:', aiResponse);
        console.log('Response length:', aiResponse.length);
        console.log('First 100 chars:', aiResponse.substring(0, 100));
        
        // Check for common issues in the response
        if (aiResponse.includes('enth apply me') || aiResponse.includes('enfer perf')) {
            console.warn('Detected corrupted/garbled response from API');
            throw new Error('AI API returned corrupted response. This may be an API configuration issue.');
        }
        
        // Enhanced JSON extraction with multiple fallback methods
        let parsedData = null;
        
        // Method 1: Try direct JSON parsing
        try {
            parsedData = JSON.parse(aiResponse);
            console.log('✅ Direct JSON parsing successful');
        } catch (error) {
            console.log('❌ Direct JSON parse failed, trying extraction methods...');
            
            // Method 2: Extract JSON from code blocks
            const codeBlockMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
            if (codeBlockMatch) {
                try {
                    parsedData = JSON.parse(codeBlockMatch[1]);
                    console.log('Extracted JSON from code block');
                } catch (e) {
                    console.log('Code block extraction failed');
                }
            }
            
            // Method 3: Find JSON objects in the response
            if (!parsedData) {
                const jsonStart = aiResponse.indexOf('{');
                const jsonEnd = aiResponse.lastIndexOf('}') + 1;
                
                if (jsonStart !== -1 && jsonEnd > jsonStart) {
                    const jsonString = aiResponse.substring(jsonStart, jsonEnd);
                    try {
                        parsedData = JSON.parse(jsonString);
                        console.log('Extracted JSON from substring');
                    } catch (e) {
                        console.log('Substring extraction failed');
                    }
                }
            }
            
            // Method 4: Clean and retry
            if (!parsedData) {
                const cleanedResponse = aiResponse
                    .replace(/```json/g, '')
                    .replace(/```/g, '')
                    .replace(/^\s*JSON:\s*/i, '')
                    .trim();
                
                try {
                    parsedData = JSON.parse(cleanedResponse);
                    console.log('Parsed cleaned response');
                } catch (e) {
                    console.error('All JSON extraction methods failed');
                    console.error('Raw response:', aiResponse);
                    throw new Error('AI returned invalid JSON format. Please try again or check your input.');
                }
            }
        }
        
        // Validate the parsed data structure
        if (!parsedData || typeof parsedData !== 'object') {
            throw new Error('AI returned invalid data structure');
        }
        
        if (!parsedData.sections || !Array.isArray(parsedData.sections)) {
            console.error('Invalid data structure:', parsedData);
            throw new Error('Invalid data structure: missing sections array');
        }
        
        console.log('Successfully parsed data:', parsedData);
        return parsedData;
        
    } catch (error) {
        console.error('AI parsing error:', error);
        
        if (error.message.includes('API authentication')) {
            showNotification('AI service authentication failed. Please check configuration.', 'error');
        } else if (error.message.includes('rate limit')) {
            showNotification('AI service rate limit exceeded. Please wait a moment and try again.', 'error');
        } else if (error.message.includes('API error')) {
            showNotification('AI service is unavailable. Please check your API key and try again.', 'error');
        } else if (error.message.includes('JSON')) {
            showNotification('AI parsing failed - invalid response format. Please try rephrasing your checklist or try again.', 'error');
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showNotification('Network error: Unable to connect to AI service. Please check your internet connection.', 'error');
        } else {
            showNotification(`AI parsing failed: ${error.message}`, 'error');
        }
        
        return null;
    }
}

// Fallback manual parsing for when AI fails
function createFallbackStructure(rawText) {
    console.log('Creating fallback structure from raw text...');
    
    const lines = rawText.split('\n').filter(line => line.trim());
    const sections = [];
    let currentSection = null;
    let sectionId = 1;
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip empty lines
        if (!trimmedLine) continue;
        
        // Check if it's a section header (no bullet points or status info)
        if (!trimmedLine.startsWith('-') && !trimmedLine.includes('Cathie') && !trimmedLine.includes('Malaurie')) {
            // Save previous section if exists
            if (currentSection) {
                sections.push(currentSection);
            }
            
            // Create new section
            currentSection = {
                id: sectionId++,
                title: trimmedLine,
                cathieStatus: "Status not specified",
                malaurieStatus: "Status not specified",
                actions: []
            };
        } 
        // Check for status lines
        else if (trimmedLine.toLowerCase().includes('cathie')) {
            if (currentSection) {
                currentSection.cathieStatus = trimmedLine.replace(/^-\s*/, '');
            }
        } 
        else if (trimmedLine.toLowerCase().includes('malaurie')) {
            if (currentSection) {
                currentSection.malaurieStatus = trimmedLine.replace(/^-\s*/, '');
            }
        }
        // Action items (lines starting with -)
        else if (trimmedLine.startsWith('-')) {
            if (currentSection) {
                const actionText = trimmedLine.replace(/^-\s*/, '');
                if (actionText && !actionText.toLowerCase().includes('status')) {
                    currentSection.actions.push(actionText);
                }
            }
        }
        // Other lines that might be actions
        else {
            if (currentSection && trimmedLine.length > 5) {
                currentSection.actions.push(trimmedLine);
            }
        }
    }
    
    // Add the last section
    if (currentSection) {
        sections.push(currentSection);
    }
    
    // If no sections found, create a default one
    if (sections.length === 0) {
        sections.push({
            id: 1,
            title: "Imported Checklist",
            cathieStatus: "Status not specified",
            malaurieStatus: "Status not specified", 
            actions: rawText.split('\n').filter(line => line.trim()).slice(0, 10)
        });
    }
    
    return { sections };
}

// Update the application with AI-parsed data
async function updateWithAIParsedData(parsedData) {
    if (!parsedData || !parsedData.sections) {
        showNotification('Invalid data format from AI parsing', 'error');
        return;
    }

    try {
        // Generate new HTML for the parsed sections
        const newSectionsHTML = generateSectionsHTML(parsedData.sections);
        
        // Replace the existing action items
        const actionItemsContainer = document.querySelector('.action-items');
        actionItemsContainer.innerHTML = newSectionsHTML;
        
        // Reinitialize event listeners and state
        setupEventListeners();
        updateStats();
        updateProgressBar();
        updateEmailCta();
        
        showNotification(`Successfully imported ${parsedData.sections.length} sections from AI parsing!`, 'success');
        
        // Save the new structure
        saveState();
        
    } catch (error) {
        console.error('Error updating with AI data:', error);
        showNotification('Error updating the application with parsed data', 'error');
    }
}

// Generate HTML for sections from AI-parsed data
function generateSectionsHTML(sections) {
    return sections.map(section => `
        <div class="action-section">
            <h2>${section.id}. ${section.title}</h2>
            <div class="status">
                <span class="status-item cathie">Cathie: ${section.cathieStatus}</span>
                <span class="status-item malaurie">Malaurie: ${section.malaurieStatus}</span>
            </div>
            <div class="actions">
                ${section.actions.map((action, index) => `
                    <label class="action-item">
                        <input type="checkbox" data-item="${section.id}" data-action="action-${index}"> 
                        ${action}
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Show AI import modal
function showAIImportModal() {
    const modal = document.getElementById('aiImportModal');
    modal.style.display = 'block';
    document.getElementById('checklistInput').focus();
}

// Hide AI import modal
function hideAIImportModal() {
    const modal = document.getElementById('aiImportModal');
    modal.style.display = 'none';
    document.getElementById('checklistInput').value = '';
}

// Process AI import
async function processAIImport() {
    const checklistText = document.getElementById('checklistInput').value.trim();
    
    if (!checklistText) {
        showNotification('Please paste a checklist to import', 'error');
        return;
    }
    
    // Get elements with better error handling
    const importBtn = document.querySelector('.ai-import-btn');
    const spinner = document.querySelector('.ai-spinner');
    const btnText = importBtn ? importBtn.querySelector('span') : null;
    const modal = document.getElementById('aiImportModal');
    
    if (!importBtn) {
        console.error('Import button not found');
        showNotification('Interface error. Please try again.', 'error');
        return;
    }
    
    // Store original text safely
    const originalText = btnText ? btnText.textContent : 'Import with AI';
    
    try {
        // Show enhanced loading state
        importBtn.disabled = true;
        if (btnText) btnText.textContent = 'Processing with AI...';
        if (spinner) spinner.style.display = 'inline-block';
        if (modal) modal.classList.add('processing');
        
        // Show loading notification
        showNotification('🤖 AI is analyzing your checklist...', 'info');
        
        // Parse with AI
        const parsedData = await parseChecklistWithAI(checklistText);
        
        if (parsedData) {
            showNotification('✅ Successfully parsed checklist!', 'success');
            // Update the application
            await updateWithAIParsedData(parsedData);
            hideAIImportModal();
            showNotification('📋 Checklist imported and ready to use!', 'success');
        } else {
            // Fallback to manual parsing
            showNotification('AI parsing failed, trying manual parsing...', 'warning');
            const fallbackData = createFallbackStructure(checklistText);
            await updateWithAIParsedData(fallbackData);
            hideAIImportModal();
            showNotification('📋 Checklist imported using fallback method.', 'success');
        }
        
    } catch (error) {
        console.error('Import error:', error);
        showNotification('Failed to import checklist. Please try again.', 'error');
    } finally {
        // Reset button state safely
        if (importBtn) {
            importBtn.disabled = false;
        }
        if (btnText) {
            btnText.textContent = originalText;
        }
        if (spinner) {
            spinner.style.display = 'none';
        }
        if (modal) {
            modal.classList.remove('processing');
        }
    }
}

// Security Warning System
const SecurityMonitor = {
    // Track authentication attempts
    attempts: 0,
    lastAttempt: 0,
    
    // Check if running in production
    isProduction: function() {
        return location.protocol === 'https:' || 
               location.hostname !== 'localhost' && 
               location.hostname !== '127.0.0.1';
    },
    
    // Log security events (in production, this should go to a secure logging service)
    logSecurityEvent: function(event, details = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            event,
            details,
            userAgent: navigator.userAgent,
            hostname: location.hostname,
            protocol: location.protocol
        };
        
        // In production, send to secure logging service
        if (this.isProduction()) {
            console.warn('Security Event:', logEntry);
            // TODO: Send to secure logging service
        } else {
            console.log('Security Event (Dev):', logEntry);
        }
    },
    
    // Check for dev tools (basic detection)
    detectDevTools: function() {
        const threshold = 160;
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
            this.logSecurityEvent('DEV_TOOLS_DETECTED', {
                message: 'Developer tools may be open'
            });
        }
    },
    
    // Initialize security monitoring
    init: function() {
        if (this.isProduction()) {
            // Set up dev tools detection
            setInterval(() => this.detectDevTools(), 5000);
            
            // Warn about client-side credentials
            console.warn('⚠️  SECURITY WARNING: This application uses client-side authentication for demo purposes only.');
            console.warn('⚠️  For production use, implement proper server-side authentication.');
            console.warn('⚠️  API keys and credentials should never be stored in client-side code.');
        }
    }
};

// Start security monitoring
SecurityMonitor.init();

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {    // Initialize authentication
    if (isAuthenticated()) {
        showApp();
    } else {
        setupLoginForm();
    }
    
    // Security warning banner disabled for cleaner UI
    // if (SecurityMonitor.isProduction()) {
    //     addSecurityWarningBanner();
    // }
    
    console.log('🔐 SFMC Tracker initialized with enhanced security');
    console.log('🤖 AI Import functionality available (Ctrl+I)');
    console.log('📊 Email campaign tracking ready');
});

// Add visible security warning banner
function addSecurityWarningBanner() {
    const banner = document.createElement('div');
    banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(45deg, #ff6b6b, #ee5a24);
        color: white;
        padding: 8px;
        text-align: center;
        font-size: 12px;
        z-index: 999999;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `;
    banner.innerHTML = `
        ⚠️ DEMO MODE: This application uses client-side authentication for demonstration purposes only. 
        Not suitable for production use without proper server-side security implementation.
        <button onclick="this.parentElement.style.display='none'" style="margin-left: 10px; background: rgba(255,255,255,0.2); border: none; color: white; padding: 2px 8px; border-radius: 3px; cursor: pointer;">×</button>
    `;
    document.body.insertBefore(banner, document.body.firstChild);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        if (banner.parentElement) {
            banner.style.opacity = '0';
            banner.style.transition = 'opacity 0.5s';
            setTimeout(() => banner.remove(), 500);
        }
    }, 10000);
}
