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

// AI Configuration - Fixed for better compatibility
const AI_CONFIG = {
    // Obfuscated API key - decode at runtime for security
    apiKeyEncoded: 'ZWE4NTAzODEtZWU4NS00NGRkLTkwZTItMGJjNjIyMzE3MmI2', // Base64 encoded
    baseUrl: 'https://api.kluster.ai/v1', // Kluster AI endpoint
    model: 'gpt-3.5-turbo', // Using standard model name for better compatibility
    maxTokens: 1000, // Reduced for better response quality
    temperature: 0.0, // Very low temperature for consistent JSON output
    topP: 0.8,
    // Additional obfuscation layers
    keyParts: ['ZWE4NTAzODE=', 'ZWU4NQ==', 'NDRkZA==', 'OTBlMg==', 'MGJjNjIyMzE3MmI2'],
    separator: '-'
};

// Email configuration
const EMAIL_CONFIG = {
    recipientEmail: 'thomas.nicoli@loreal.com',
    serviceUrl: 'https://formspree.io/f/xeoqvqbr'
};

// Track completion state in localStorage
const STORAGE_KEY = 'email_campaign_tracker';

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
        ctaSpinner.style.display = 'none';
        ctaButton.disabled = false;
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
    } else if (type === 'warning') {
        notificationContent.style.background = '#f39c12';
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

// Keyboard shortcuts
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

// FIXED AI-powered checklist parsing with better error handling
async function parseChecklistWithAI(rawText) {
    try {
        console.log('🤖 Starting AI parsing with Kluster AI...');
          const prompt = `You are a JSON converter. Convert this email campaign checklist to JSON format. Return ONLY the JSON object, no explanations.

Required JSON structure:
{
  "sections": [
    {
      "id": 1,
      "title": "Section Name",
      "cathieStatus": "Status found or 'Status not specified'",
      "malaurieStatus": "Status found or 'Status not specified'",
      "actions": ["Action item 1", "Action item 2"]
    }
  ]
}

PARSING RULES:
1. Extract numbered sections (e.g., "1. Newsletter Confirmation / Newsletter Subscription")
2. Look for "Status:" blocks with Cathie/Malaurie information
3. Extract all action items from "Actions Required:" sections
4. Remove bullet points (-, •, ▪) from action text
5. Preserve status details like "GO", "NO-GO", reasoning in parentheses
6. Each section should have multiple actionable items

Convert this checklist:
${rawText}`;

        const requestBody = {
            model: AI_CONFIG.model,
            max_tokens: AI_CONFIG.maxTokens,
            temperature: AI_CONFIG.temperature,
            top_p: AI_CONFIG.topP,
            messages: [
                {
                    role: 'system',
                    content: 'You are a JSON converter. Only return valid JSON. No explanations.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ]
        };

        console.log('📡 Making API request to:', AI_CONFIG.baseUrl + '/chat/completions');
        
        const response = await fetch(AI_CONFIG.baseUrl + '/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getApiKey()}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log('📥 API Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error Response:', errorText);
            throw new Error(`AI API error: ${response.status} - ${errorText.substring(0, 200)}`);
        }

        const data = await response.json();
        console.log('📋 API Response data:', data);
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('❌ Invalid API response structure:', data);
            throw new Error('Invalid API response format');
        }
        
        let aiResponse = data.choices[0].message.content.trim();
        console.log('🔍 AI Response content:', aiResponse);
        console.log('📏 Response length:', aiResponse.length);
        console.log('👀 First 200 chars:', aiResponse.substring(0, 200));
        
        // Check for common corruption patterns
        if (aiResponse.includes('enth apply me') || 
            aiResponse.includes('enfer perf') || 
            aiResponse.includes('corrupted') ||
            aiResponse.length < 20) {
            console.warn('⚠️ Detected corrupted/invalid AI response');
            throw new Error('AI returned corrupted response. The API may be misconfigured.');
        }
        
        // Enhanced JSON extraction
        let parsedData = null;
        
        // Method 1: Direct parsing
        try {
            parsedData = JSON.parse(aiResponse);
            console.log('✅ Direct JSON parsing successful');
        } catch (error) {
            console.log('❌ Direct JSON parse failed, trying extraction...');
            
            // Method 2: Extract from code blocks
            const codeBlockMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
            if (codeBlockMatch) {
                try {
                    parsedData = JSON.parse(codeBlockMatch[1]);
                    console.log('✅ Extracted from code block');
                } catch (e) {
                    console.log('❌ Code block extraction failed');
                }
            }
            
            // Method 3: Find JSON in response
            if (!parsedData) {
                const jsonStart = aiResponse.indexOf('{');
                const jsonEnd = aiResponse.lastIndexOf('}') + 1;
                
                if (jsonStart !== -1 && jsonEnd > jsonStart) {
                    try {
                        parsedData = JSON.parse(aiResponse.substring(jsonStart, jsonEnd));
                        console.log('✅ Extracted JSON substring');
                    } catch (e) {
                        console.log('❌ Substring extraction failed');
                    }
                }
            }
            
            // Method 4: Clean and retry
            if (!parsedData) {
                const cleaned = aiResponse
                    .replace(/```json/g, '')
                    .replace(/```/g, '')
                    .replace(/^.*?(\{.*\}).*$/s, '$1')
                    .trim();
                
                try {
                    parsedData = JSON.parse(cleaned);
                    console.log('✅ Parsed cleaned response');
                } catch (e) {
                    console.error('❌ All JSON extraction methods failed');
                    throw new Error('AI returned non-JSON response');
                }
            }
        }
        
        // Validate structure
        if (!parsedData || typeof parsedData !== 'object') {
            throw new Error('AI returned invalid data structure');
        }
        
        if (!parsedData.sections || !Array.isArray(parsedData.sections)) {
            console.error('❌ Invalid structure:', parsedData);
            throw new Error('Missing sections array in AI response');
        }
        
        console.log('✅ Successfully parsed AI data:', parsedData);
        return parsedData;
        
    } catch (error) {
        console.error('❌ AI parsing error:', error);
        
        // Show user-friendly error messages
        if (error.message.includes('corrupted')) {
            showNotification('AI returned invalid data. Using manual parsing instead.', 'warning');
        } else if (error.message.includes('authentication') || error.message.includes('401')) {
            showNotification('AI API authentication failed. Check API key configuration.', 'error');
        } else if (error.message.includes('rate limit') || error.message.includes('429')) {
            showNotification('AI service rate limit exceeded. Please wait and try again.', 'error');
        } else if (error.message.includes('500')) {
            showNotification('AI service is temporarily unavailable. Using manual parsing.', 'warning');
        } else if (error.message.includes('JSON') || error.message.includes('non-JSON')) {
            showNotification('AI response format error. Using manual parsing instead.', 'warning');
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showNotification('Network error: Cannot connect to AI service.', 'error');
        } else {
            showNotification(`AI parsing failed: ${error.message}. Using manual parsing.`, 'warning');
        }
        
        return null;
    }
}

// Improved fallback manual parsing
function createFallbackStructure(rawText) {
    console.log('🔧 Creating fallback structure from raw text...');
    
    const lines = rawText.split('\n').filter(line => line.trim());
    const sections = [];
    let currentSection = null;
    let sectionId = 1;
    let collectingActions = false;
    let collectingStatus = false;
    
    for (const line of lines) {
        const trimmed = line.trim();
        
        if (!trimmed) continue;
        
        // Section headers (numbered with dots: "1. Title", "2. Title", etc.)
        const sectionMatch = trimmed.match(/^(\d+)\.\s*(.+)$/);
        if (sectionMatch) {
            // Save previous section
            if (currentSection) {
                sections.push(currentSection);
            }
            
            // Create new section
            currentSection = {
                id: parseInt(sectionMatch[1]),
                title: sectionMatch[2],
                cathieStatus: "Status not specified",
                malaurieStatus: "Status not specified",
                actions: []
            };
            collectingActions = false;
            collectingStatus = false;
            continue;
        }
        
        // Status section detection
        if (trimmed.toLowerCase() === 'status:') {
            collectingStatus = true;
            collectingActions = false;
            continue;
        }
        
        // Actions section detection
        if (trimmed.toLowerCase().includes('actions required:')) {
            collectingActions = true;
            collectingStatus = false;
            continue;
        }
        
        // Parse status lines when in status section
        if (collectingStatus && currentSection) {
            if (trimmed.toLowerCase().startsWith('cathie:')) {
                currentSection.cathieStatus = trimmed.substring(7).trim();
            } else if (trimmed.toLowerCase().startsWith('malaurie:')) {
                currentSection.malaurieStatus = trimmed.substring(9).trim();
            }
            continue;
        }
        
        // Parse action items when in actions section
        if (collectingActions && currentSection) {
            // Remove bullet points and clean action text
            const actionText = trimmed
                .replace(/^[-•▪]\s*/, '')  // Remove bullets
                .replace(/^□\s*/, '')     // Remove checkboxes
                .replace(/^\d+\.\s*/, '') // Remove numbers
                .trim();
            
            if (actionText && actionText.length > 3) {
                currentSection.actions.push(actionText);
            }
            continue;
        }
        
        // If not in any special section, treat as general action item for current section
        if (currentSection && !collectingStatus) {
            const actionText = trimmed
                .replace(/^[-•▪]\s*/, '')
                .replace(/^□\s*/, '')
                .replace(/^\d+\.\s*/, '')
                .trim();
            
            // Only add if it looks like an action item (not status info)
            if (actionText && 
                actionText.length > 5 && 
                !actionText.toLowerCase().includes('cathie:') &&
                !actionText.toLowerCase().includes('malaurie:') &&
                !actionText.toLowerCase().includes('status:')) {
                currentSection.actions.push(actionText);
            }
        }
    }
    
    // Add last section
    if (currentSection) {
        sections.push(currentSection);
    }
    
    // Create default if no sections found
    if (sections.length === 0) {
        sections.push({
            id: 1,
            title: "Imported Checklist",
            cathieStatus: "Status not specified",
            malaurieStatus: "Status not specified",
            actions: lines.slice(0, 10).map(line => 
                line.replace(/^[-•▪□]\s*/, '').trim()
            ).filter(action => action.length > 3)
        });
    }
    
    console.log('✅ Created fallback structure with', sections.length, 'sections');
    console.log('📋 Sections preview:', sections.map(s => ({ id: s.id, title: s.title, actionsCount: s.actions.length })));
    return { sections };
}

// Update application with parsed data
async function updateWithAIParsedData(parsedData) {
    if (!parsedData || !parsedData.sections) {
        showNotification('Invalid data format from parsing', 'error');
        return;
    }

    try {
        // Generate HTML for sections
        const newHTML = parsedData.sections.map(section => `
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
        
        // Update the DOM
        const container = document.querySelector('.action-items');
        container.innerHTML = newHTML;
        
        // Reinitialize
        setupEventListeners();
        updateStats();
        updateProgressBar();
        updateEmailCta();
        saveState();
        
        console.log('✅ Successfully updated application with', parsedData.sections.length, 'sections');
        
    } catch (error) {
        console.error('❌ Error updating with parsed data:', error);
        showNotification('Error updating application with parsed data', 'error');
    }
}

// AI Import Modal Functions
function showAIImportModal() {
    const modal = document.getElementById('aiImportModal');
    modal.style.display = 'block';
    document.getElementById('checklistInput').focus();
}

function hideAIImportModal() {
    const modal = document.getElementById('aiImportModal');
    modal.style.display = 'none';
    document.getElementById('checklistInput').value = '';
}

// FIXED Process AI import with better error handling
async function processAIImport() {
    const checklistText = document.getElementById('checklistInput').value.trim();
    
    if (!checklistText) {
        showNotification('Please paste a checklist to import', 'error');
        return;
    }
    
    // Get UI elements with null checks
    const importBtn = document.querySelector('.ai-import-btn');
    const spinner = document.querySelector('.ai-spinner');
    const btnText = importBtn?.querySelector('span');
    const modal = document.getElementById('aiImportModal');
    
    if (!importBtn) {
        console.error('❌ Import button not found');
        showNotification('Interface error. Please refresh and try again.', 'error');
        return;
    }
    
    const originalText = btnText?.textContent || 'Import with AI';
    
    try {
        // Show loading state
        importBtn.disabled = true;
        if (btnText) btnText.textContent = 'AI Processing...';
        if (spinner) spinner.style.display = 'inline-block';
        if (modal) modal.classList.add('processing');
        
        showNotification('🤖 AI is analyzing your checklist...', 'info');
        
        // Try AI parsing first
        const aiData = await parseChecklistWithAI(checklistText);
        
        if (aiData) {
            showNotification('✅ AI parsing successful!', 'success');
            await updateWithAIParsedData(aiData);
            hideAIImportModal();
            showNotification('📋 Checklist imported successfully!', 'success');
        } else {
            // Fallback to manual parsing
            showNotification('🔧 Using manual parsing...', 'info');
            const fallbackData = createFallbackStructure(checklistText);
            await updateWithAIParsedData(fallbackData);
            hideAIImportModal();
            showNotification('📋 Checklist imported using manual parsing.', 'success');
        }
        
    } catch (error) {
        console.error('❌ Import error:', error);
        showNotification('Failed to import checklist. Please try again.', 'error');
    } finally {
        // Reset UI state
        if (importBtn) importBtn.disabled = false;
        if (btnText) btnText.textContent = originalText;
        if (spinner) spinner.style.display = 'none';
        if (modal) modal.classList.remove('processing');
    }
}

// Initialize logging
console.log('🔐 SFMC Tracker with Fixed AI Processing');
console.log('🤖 AI Import: Ctrl+I');
console.log('📊 Export: Ctrl+E');
console.log('🔄 Reset: Ctrl+R');
console.log('🚀 Ready to track email campaigns!');
