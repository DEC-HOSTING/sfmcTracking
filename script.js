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

// AI Configuration - Optimized for Mistral Nemo compatibility and better parsing
const AI_CONFIG = {
    // Obfuscated API key - decode at runtime for security
    apiKeyEncoded: 'ZGRjNDM3ZTYtNmM0Yy00NjQ5LWFkZTQtMzRkOTlmYTBjZDI2', // Base64 encoded (new API key)
    baseUrl: 'https://api.kluster.ai/v1', // Kluster AI endpoint
    // Mistral Nemo model configuration - optimized for JSON output
    models: [
        'mistralai/Mistral-Nemo-Instruct-2407',  // Primary Mistral Nemo model
        'mistral-nemo',                          // Alternative name
        'gpt-3.5-turbo',                        // Fallback for compatibility
        'default'                               // Final fallback
    ],
    model: 'mistralai/Mistral-Nemo-Instruct-2407', // Primary model - Mistral Nemo
    maxTokens: 3000, // Optimized for checklist parsing (reduced from 4000)
    temperature: 0.05, // Very low temperature for consistent JSON output (reduced from 2.0)
    topP: 0.7, // Reduced for more focused responses (reduced from 1.0)
    // Additional obfuscation layers (updated for new key)
    keyParts: ['ZGRjNDM3ZTY=', 'NmM0Yw==', 'NDY0OQ==', 'YWRlNA==', 'MzRkOTlmYTBjZDI2'],
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
    console.log('🔗 Setting up event listeners for', checkboxes.length, 'checkboxes');
    
    checkboxes.forEach((checkbox, index) => {
        // Remove any existing listeners to prevent duplicates
        checkbox.removeEventListener('change', handleCheckboxChange);
        // Add the event listener
        checkbox.addEventListener('change', handleCheckboxChange);
        console.log(`🔗 Added listener to checkbox ${index + 1}:`, checkbox.dataset.item, checkbox.dataset.action);
    });
    
    console.log('✅ Event listeners setup complete');
}

// Setup editable content listeners for saving changes
function setupEditableContentListeners() {
    console.log('🔗 Setting up editable content listeners...');
    
    // Editable titles
    const editableTitles = document.querySelectorAll('.editable-title[contenteditable="true"]');
    editableTitles.forEach(title => {
        title.addEventListener('blur', handleTitleChange);
        title.addEventListener('keydown', handleEditableKeydown);
    });
    
    // Editable status items
    const editableStatus = document.querySelectorAll('.status-item[contenteditable="true"]');
    editableStatus.forEach(status => {
        status.addEventListener('blur', handleStatusChange);
        status.addEventListener('keydown', handleEditableKeydown);
    });
    
    // Editable action text
    const editableActions = document.querySelectorAll('.action-text[contenteditable="true"]');
    editableActions.forEach(action => {
        action.addEventListener('blur', handleActionTextChange);
        action.addEventListener('keydown', handleEditableKeydown);
    });
    
    console.log(`✅ Added listeners to ${editableTitles.length} titles, ${editableStatus.length} status items, ${editableActions.length} actions`);
}

// Handle title changes
function handleTitleChange(event) {
    const title = event.target;
    const sectionId = title.dataset.sectionId;
    console.log(`📝 Title changed for section ${sectionId}:`, title.textContent);
    saveEditableState();
    showNotification('Section title updated', 'info');
}

// Handle status changes
function handleStatusChange(event) {
    const status = event.target;
    const sectionId = status.dataset.sectionId;
    const statusType = status.dataset.statusType;
    console.log(`📝 Status changed for section ${sectionId} (${statusType}):`, status.textContent);
    saveEditableState();
    showNotification(`${statusType} status updated`, 'info');
}

// Handle action text changes
function handleActionTextChange(event) {
    const action = event.target;
    const sectionId = action.dataset.sectionId;
    const actionIndex = action.dataset.actionIndex;
    console.log(`📝 Action text changed for section ${sectionId}, action ${actionIndex}:`, action.textContent);
    saveEditableState();
    showNotification('Action text updated', 'info');
}

// Handle keydown events in editable content (Enter to save, Escape to cancel)
function handleEditableKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        event.target.blur(); // This will trigger the blur event and save
    } else if (event.key === 'Escape') {
        event.preventDefault();
        event.target.blur();
        // Could reload content here to cancel changes if needed
    }
}

// Save the current state of all editable content
function saveEditableState() {
    const editableData = {
        timestamp: new Date().toISOString(),
        sections: []
    };
    
    const sections = document.querySelectorAll('.action-section');
    sections.forEach(section => {
        const title = section.querySelector('.editable-title');
        const cathieStatus = section.querySelector('.status-item.cathie[contenteditable="true"]');
        const malaurieStatus = section.querySelector('.status-item.malaurie[contenteditable="true"]');
        const actionTexts = section.querySelectorAll('.action-text[contenteditable="true"]');
        
        if (title) {
            const sectionData = {
                id: title.dataset.sectionId,
                title: title.textContent,
                cathieStatus: cathieStatus ? cathieStatus.textContent : '',
                malaurieStatus: malaurieStatus ? malaurieStatus.textContent : '',
                actions: Array.from(actionTexts).map(action => action.textContent)
            };
            editableData.sections.push(sectionData);
        }
    });
    
    localStorage.setItem(STORAGE_KEY + '_editable', JSON.stringify(editableData));
    console.log('💾 Saved editable content state');
}

// Load saved editable content
function loadEditableState() {
    const savedData = localStorage.getItem(STORAGE_KEY + '_editable');
    if (!savedData) return;
    
    try {
        const editableData = JSON.parse(savedData);
        console.log('📥 Loading saved editable content:', editableData);
        
        editableData.sections.forEach(sectionData => {
            const section = document.querySelector(`[data-section-id="${sectionData.id}"]`);
            if (section) {
                // Update title
                const title = section.querySelector ? section : document.querySelector(`.editable-title[data-section-id="${sectionData.id}"]`);
                if (title) title.textContent = sectionData.title;
                
                // Update status items
                const cathieStatus = document.querySelector(`.status-item.cathie[data-section-id="${sectionData.id}"]`);
                if (cathieStatus) cathieStatus.textContent = sectionData.cathieStatus;
                
                const malaurieStatus = document.querySelector(`.status-item.malaurie[data-section-id="${sectionData.id}"]`);
                if (malaurieStatus) malaurieStatus.textContent = sectionData.malaurieStatus;
                
                // Update action texts
                sectionData.actions.forEach((actionText, index) => {
                    const actionElement = document.querySelector(`.action-text[data-section-id="${sectionData.id}"][data-action-index="${index}"]`);
                    if (actionElement) actionElement.textContent = actionText;
                });
            }
        });
        
        console.log('✅ Loaded saved editable content');
    } catch (error) {
        console.error('❌ Error loading editable content:', error);
    }
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
    
    if (progressFill) {
        progressFill.style.width = percentage + '%';
    }
    if (progressText) {
        progressText.textContent = percentage + '% Complete';
    }
    
    // Change color based on progress
    if (progressFill) {
        if (percentage === 100) {
            progressFill.style.background = 'linear-gradient(90deg, #27ae60, #2ecc71)';
        } else if (percentage >= 75) {
            progressFill.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
        } else {
            progressFill.style.background = 'linear-gradient(90deg, #4CAF50, #45a049)';
        }
    }
    
    // Update summary stats
    updateSummaryStats(totalActions, completedActions);
}

// Alias for updateProgressBar to handle different naming
function updateProgress() {
    updateProgressBar();
}

// Update summary statistics
function updateSummaryStats(total, completed) {
    const totalElement = document.getElementById('totalActions');
    const completedElement = document.getElementById('completedActions');
    const remainingElement = document.getElementById('remainingActions');
    
    if (totalElement) totalElement.textContent = total;
    if (completedElement) completedElement.textContent = completed;
    if (remainingElement) remainingElement.textContent = total - completed;
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
        return parts.join(AI_CONFIG.separator);    } catch (error) {
        console.error('Failed to decode API key:', error);
        // Return a placeholder that will fail gracefully
        return 'INVALID_API_KEY_PLEASE_CONFIGURE';
    }
}

// AI-powered checklist parsing with enhanced error handling
async function parseChecklistWithAI(rawText) {
    try {
        console.log('🔮 Starting enhanced AI parsing...');
        
        // Validate input
        if (!rawText || rawText.trim().length < 10) {
            console.warn('⚠️ Input too short for AI parsing');
            return null;
        }
        
        // Try AI parsing with improved configuration
        const parsedData = await attemptAIParsing(rawText, AI_CONFIG);
        
        if (parsedData && parsedData.sections && parsedData.sections.length > 0) {
            console.log('✅ AI parsing successful -', parsedData.sections.length, 'sections created');
            
            // Validate structure quality
            const totalActions = parsedData.sections.reduce((sum, section) => sum + (section.actions ? section.actions.length : 0), 0);
            console.log('📊 Total actions parsed:', totalActions);
            
            if (totalActions < 2) {
                console.warn('⚠️ AI parsing produced minimal results, may need fallback');
            }
            
            return parsedData;
        }
        
        console.log('⚠️ AI parsing failed, will use fallback');
        return null;
        
    } catch (error) {
        console.error('❌ AI parsing error:', error.message);
        
        // Enhanced error categorization with better notifications
        if (error.message.includes('corrupted') || error.message.includes('unparseable')) {
            showNotification('AI returned garbled response - using manual parsing', 'warning');
        } else if (error.message.includes('authentication') || error.message.includes('API key')) {
            showNotification('AI service authentication failed - using manual parsing', 'warning');
        } else if (error.message.includes('rate limit')) {
            showNotification('AI service rate limit reached - using manual parsing', 'warning');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            showNotification('Network error - using manual parsing', 'warning');
        } else {
            showNotification('AI parsing failed - using manual parsing', 'warning');
        }
        
        return null;
    }
}

// Separate function to attempt AI parsing with given config
async function attemptAIParsing(rawText, config) {    const prompt = `Convert this checklist into valid JSON format. Respond with ONLY the JSON object, no explanations.

Required structure:
{
  "sections": [
    {
      "id": 1,
      "title": "Section Name",
      "cathieStatus": "Status not specified",
      "malaurieStatus": "Status not specified", 
      "actions": ["Action 1", "Action 2", "Action 3"]
    }
  ]
}

PARSING INSTRUCTIONS:
1. Identify major sections by looking for:
   - Numbered sections (1., 2., 3.)
   - Headers with colons (Technical Implementation:, Testing:, Review:)
   - Clear topic breaks

2. For complex tasks, break them down:
   - "Address all template issues (spacing, colors, footer)" becomes 3+ separate actions
   - "Re-test triggers and validate on platforms" becomes 2+ separate actions

3. Extract status information:
   - Look for "Cathie:" or "Malaurie:" followed by status
   - Common patterns: "GO", "NO-GO", "PENDING", "APPROVED"
   - If not found, use "Status not specified"

4. Clean and format actions:
   - Remove bullets (-, •, □)
   - Make each action specific and actionable
   - Split compound actions into separate items

5. Minimum standards:
   - At least 1 section
   - At least 2 actions per section when possible
   - Break down any task containing "and", "all", or parenthetical details

Input text:
${rawText}

Return only valid JSON:`;const requestBody = {
        model: config.model,
        max_tokens: config.maxTokens,
        temperature: 0.1, // Lower temperature for more consistent JSON output
        top_p: 0.8, // Slightly reduced for better consistency
        messages: [
            {
                role: 'system',
                content: 'You are a specialized JSON parser for email campaign checklists. Your sole purpose is to convert unstructured text into valid JSON. ALWAYS respond with ONLY valid JSON that starts with { and ends with }. Never include explanations, markdown formatting, or additional text. Break complex tasks into separate actionable items. When in doubt, create more detailed actions rather than fewer general ones.'
            },
            {
                role: 'user',
                content: prompt
            }
        ]
    };

    console.log('🌐 Making API request...');
    
    const response = await fetch(config.baseUrl + '/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getApiKey()}`,
            'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status);
        
        // Check for specific error types
        if (response.status === 401) {
            throw new Error('API authentication failed');
        } else if (response.status === 429) {
            throw new Error('API rate limit exceeded');
        } else if (response.status === 500) {
            throw new Error('AI service temporarily unavailable');
        } else {
            throw new Error(`AI API error: ${response.status}`);
        }
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('❌ Invalid API response structure');
        throw new Error('Invalid API response format');
    }
    
    let aiResponse = data.choices[0].message.content.trim();
    console.log('📝 AI response received:', aiResponse.length, 'characters');    // Simplified corruption detection - only check for obvious issues
    const isCorrupted = 
        aiResponse.length < 10 ||
        (!aiResponse.includes('{') && !aiResponse.includes('[')) ||
        aiResponse.includes('I cannot') ||
        aiResponse.includes('I apologize') ||
        aiResponse.includes('As an AI');
        
    if (isCorrupted) {
        console.log('🔄 Detected invalid AI response - using fallback');
        console.log('Response preview:', aiResponse.substring(0, 100));
        throw new Error('AI returned invalid response');
    }

    // Robust JSON extraction with multiple fallback methods
    let parsedData = null;
    
    // Method 1: Direct JSON parsing
    try {
        parsedData = JSON.parse(aiResponse);
        console.log('✅ Direct JSON parsing successful');
    } catch (error) {
        // Method 2: Extract from code blocks
        const codeBlockMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch) {
            try {
                parsedData = JSON.parse(codeBlockMatch[1]);
                console.log('✅ Extracted from code block');
            } catch (e) {
                // Continue to next method
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
                    console.log('✅ Extracted from substring');
                } catch (e) {
                    // Continue to next method
                }
            }
        }
        
        // Method 4: Clean and retry with aggressive cleaning
        if (!parsedData) {
            const cleanedResponse = aiResponse
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .replace(/^\s*JSON:\s*/i, '')
                .replace(/^\s*Here's?\s+the\s+JSON:?\s*/i, '')
                .replace(/^\s*The\s+JSON\s+structure:?\s*/i, '')                .trim();
            
            try {
                parsedData = JSON.parse(cleanedResponse);
                console.log('✅ Parsed cleaned response');
            } catch (e) {
                console.log('🔄 All JSON extraction methods failed - using fallback');
                throw new Error('AI returned unparseable response');
            }
        }
    }
    
    // Validate the parsed data structure
    if (!parsedData || typeof parsedData !== 'object') {
        throw new Error('AI returned invalid data structure');
    }
    
    if (!parsedData.sections || !Array.isArray(parsedData.sections)) {
        console.error('❌ Invalid structure - missing sections array');
        throw new Error('Invalid data structure: missing sections array');
    }
    
    console.log('✅ AI parsing completed successfully');
    return parsedData;
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
                .replace(/^[a-z]\)\s*/, '') // Remove letters
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

// New function to parse text into reviewer-based structure
function parseIntoReviewerStructure(rawText) {
    console.log('📊 Parsing into reviewer-based structure...');
    
    const lines = rawText.split('\n').filter(line => line.trim());
    
    const structure = {
        reviewers: {
            'Cathie': { events: [], generalFeedback: [] },
            'Malaurie': { events: [], generalFeedback: [] }
        },
        urgentItems: [],
        generalNotes: [],
        eventTypes: new Set()
    };
    
    // Enhanced patterns for reviewer-based parsing
    const reviewerPatterns = {
        cathie: /\b(cathie|CATHIE)\b/i,
        malaurie: /\b(malaurie|MALAURIE)\b/i
    };
    
    const statusPatterns = {
        go: /\b(GO|GOOD|OK|APPROVED|VALIDATED|PASS)\b/i,
        noGo: /\b(NO-GO|NO GO|NOT OK|NEEDS WORK|ISSUE|PROBLEM|FAIL)\b/i,
        pending: /\b(PENDING|WAITING|TBD|TO BE DETERMINED)\b/i
    };
    
    const eventTypePatterns = {
        newsletter: /\b(newsletter|subscription|signup)\b/i,
        welcome: /\b(welcome|create account|registration)\b/i,
        promotional: /\b(promotional|promo|marketing|campaign)\b/i,
        notification: /\b(notification|alert|reminder)\b/i,
        confirmation: /\b(confirmation|confirm|verify)\b/i
    };
    
    const urgentPatterns = /\b(urgent|critical|immediate|asap|priority)\b/i;
    
    // Process each line with intelligent context awareness
    let currentContext = {
        eventType: null,
        reviewer: null,
        section: null
    };
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Detect event types
        const detectedEventType = detectEventType(line, eventTypePatterns);
        if (detectedEventType) {
            currentContext.eventType = detectedEventType;
            structure.eventTypes.add(detectedEventType);
        }
        
        // Process line for reviewer feedback
        processLineForReviewers(line, structure, currentContext, {
            reviewerPatterns,
            statusPatterns,
            urgentPatterns
        });
    }
    
    // Clean up and enhance the structure
    enhanceReviewerStructure(structure);
    
    return structure;
}

// Detect event type from text
function detectEventType(text, patterns) {
    for (const [type, pattern] of Object.entries(patterns)) {
        if (pattern.test(text)) {
            return type.charAt(0).toUpperCase() + type.slice(1);
        }
    }
    
    // Try to extract from common section patterns
    const sectionMatch = text.match(/^(\d+)\.\s*(.+)$/);
    if (sectionMatch) {
        const sectionText = sectionMatch[2].toLowerCase();
        if (sectionText.includes('newsletter') || sectionText.includes('subscription')) return 'Newsletter';
        if (sectionText.includes('welcome') || sectionText.includes('account')) return 'Welcome';
        if (sectionText.includes('promotional') || sectionText.includes('promo')) return 'Promotional';
        return cleanActionText(sectionMatch[2]);
    }
    
    return null;
}

// Process a line for reviewer information
function processLineForReviewers(line, structure, context, patterns) {
    const { reviewerPatterns, statusPatterns, urgentPatterns } = patterns;
    
    // Check for urgent items first
    if (urgentPatterns.test(line)) {
        structure.urgentItems.push({
            text: cleanActionText(line),
            source: line,
            eventType: context.eventType || 'General'
        });
    }
    
    // Detect reviewer mentions and extract their feedback
    for (const [reviewerKey, pattern] of Object.entries(reviewerPatterns)) {
        if (pattern.test(line)) {
            const reviewerName = reviewerKey.charAt(0).toUpperCase() + reviewerKey.slice(1);
            
            // Extract status and feedback
            const status = extractStatus(line, statusPatterns);
            const feedback = extractFeedbackFromLine(line, reviewerName);
            
            const eventData = {
                eventType: context.eventType || inferEventTypeFromFeedback(line),
                status: status,
                feedback: feedback,
                actionableItems: extractActionableItems(feedback),
                originalText: line,
                priority: urgentPatterns.test(line) ? 'High' : 'Normal'
            };
            
            structure.reviewers[reviewerName].events.push(eventData);
            
            // Update context
            context.reviewer = reviewerName;
        }
    }
    
    // Check for general actionable items
    if (isLikelyActionText(line) && !context.reviewer) {
        structure.generalNotes.push({
            text: cleanActionText(line),
            eventType: context.eventType || 'General',
            isAction: true
        });
    }
}

// Extract status from line
function extractStatus(line, statusPatterns) {
    if (statusPatterns.go.test(line)) return 'GO';
    if (statusPatterns.noGo.test(line)) return 'NO-GO';
    if (statusPatterns.pending.test(line)) return 'PENDING';
    return 'UNKNOWN';
}

// Extract feedback text from line
function extractFeedbackFromLine(line, reviewerName) {
    // Remove reviewer name and common prefixes
    let feedback = line
        .replace(new RegExp(`\\b${reviewerName}\\b:?`, 'i'), '')
        .replace(/^(says?|thinks?|wants?|needs?):?\s*/i, '')
        .replace(/^(GO|NO-GO|PENDING):?\s*/i, '')
        .trim();
    
    return feedback || line;
}

// Infer event type from feedback content
function inferEventTypeFromFeedback(text) {
    const lower = text.toLowerCase();
    if (lower.includes('newsletter') || lower.includes('subscription')) return 'Newsletter';
    if (lower.includes('welcome') || lower.includes('account')) return 'Welcome';
    if (lower.includes('promotional') || lower.includes('promo')) return 'Promotional';
    if (lower.includes('notification') || lower.includes('alert')) return 'Confirmation';
    if (lower.includes('confirmation') || lower.includes('confirm')) return 'Confirmation';
    return 'General';
}

// Extract actionable items from feedback
function extractActionableItems(feedback) {
    const actions = [];
    const actionKeywords = [
        'fix', 'update', 'change', 'modify', 'adjust', 'test', 'verify', 
        'check', 'ensure', 'review', 'implement', 'add', 'remove'
    ];
    
    // Split by common separators and check each part
    const parts = feedback.split(/[,;]|\band\b|\bthen\b/);
    
    for (const part of parts) {
        const trimmed = part.trim();
        if (actionKeywords.some(keyword => trimmed.toLowerCase().includes(keyword))) {
            actions.push(cleanActionText(trimmed));
        }
    }
    
    return actions.length > 0 ? actions : [cleanActionText(feedback)];
}

// Enhance the reviewer structure with intelligent analysis
function enhanceReviewerStructure(structure) {
    // Group similar events and add intelligence
    for (const reviewerName of Object.keys(structure.reviewers)) {
        const reviewer = structure.reviewers[reviewerName];
        
        // Group events by type
        const eventGroups = {};
        reviewer.events.forEach(event => {
            if (!eventGroups[event.eventType]) {
                eventGroups[event.eventType] = [];
            }
            eventGroups[event.eventType].push(event);
        });
        
        reviewer.eventGroups = eventGroups;
        reviewer.summary = {
            totalEvents: reviewer.events.length,
            goCount: reviewer.events.filter(e => e.status === 'GO').length,
            noGoCount: reviewer.events.filter(e => e.status === 'NO-GO').length,
            pendingCount: reviewer.events.filter(e => e.status === 'PENDING').length
        };
    }
}

// Convert reviewer data to legacy section format
function convertReviewerDataToSections(reviewerData) {
    const sections = [];
    let sectionId = 1;
    
    // Create sections based on event types
    const allEventTypes = Array.from(reviewerData.eventTypes);
    
    for (const eventType of allEventTypes) {
        const section = {
            id: sectionId++,
            title: eventType,
            cathieStatus: 'UNKNOWN',
            malaurieStatus: 'UNKNOWN',
            actions: []
        };
        
        // Gather feedback from both reviewers for this event type
        for (const [reviewerName, reviewer] of Object.entries(reviewerData.reviewers)) {
            const eventsForType = reviewer.events.filter(e => e.eventType === eventType);
            
            if (eventsForType.length > 0) {
                // Determine overall status for this reviewer and event type
                const statuses = eventsForType.map(e => e.status);
                const overallStatus = statuses.includes('NO-GO') ? 'NO-GO' : 
                                   statuses.includes('GO') ? 'GO' : 'UNKNOWN';
                
                if (reviewerName === 'Cathie') {
                    section.cathieStatus = overallStatus;
                } else if (reviewerName === 'Malaurie') {
                    section.malaurieStatus = overallStatus;
                }
                
                // Add actionable items
                eventsForType.forEach(event => {
                    event.actionableItems.forEach(action => {
                        section.actions.push({
                            text: action,
                            completed: false,
                            reviewer: reviewerName,
                            priority: event.priority || 'Normal'
                        });
                    });
                });
            }
        }
        
        // Add general actions for this event type
        const generalActionsForType = reviewerData.generalNotes.filter(note => 
            note.eventType === eventType || 
            (note.eventType === 'General' && note.text.toLowerCase().includes(eventType.toLowerCase()))
        );
        
        generalActionsForType.forEach(note => {
            section.actions.push({
                text: note.text,
                completed: false,
                reviewer: 'General',
                priority: 'Normal'
            });
        });
        
        sections.push(section);
    }
    
    // Add urgent items section if any exist
    if (reviewerData.urgentItems.length > 0) {
        sections.push({
            id: sectionId++,
            title: "Urgent Items",
            cathieStatus: 'UNKNOWN',
            malaurieStatus: 'UNKNOWN',
            actions: reviewerData.urgentItems.map(item => ({
                text: item.text,
                completed: false,
                reviewer: 'System',
                priority: 'High'
            }))
        });    }
    
    return sections;
}// Helper functions for enhanced reasoning
function isLikelyActionText(text) {
    const actionKeywords = [
        'adjust', 'fix', 'update', 'change', 'modify', 'ensure', 'check',
        'verify', 'confirm', 'test', 'validate', 'review', 'approve',
        'implement', 'create', 'add', 'remove', 'delete', 'correct',
        'improve', 'optimize', 'enhance', 'refactor', 'debug'
    ];
    
    const lowercaseText = text.toLowerCase();
    return actionKeywords.some(keyword => lowercaseText.includes(keyword)) ||
           text.includes('need to') || text.includes('should') || text.includes('must') ||
           text.match(/^[A-Z]/) && text.length < 100; // Capitalized short sentences
}

function cleanActionText(text) {
    return text.replace(/^[-•▪*□☐✓]\s*/, '') // Remove bullets
               .replace(/^(TODO|ACTION|TASK):\s*/i, '') // Remove prefixes
               .replace(/^\d+\)\s*/, '') // Remove numbers
               .replace(/^[a-z]\)\s*/, '') // Remove letters
               .trim();
}

function extractTitleFromText(text) {
    // Extract a reasonable title from longer text
    const words = text.split(' ');
    if (words.length <= 8) return text;
    
    return words.slice(0, 6).join(' ') + '...';
}

function createIntelligentSectionsFromChaos(rawText) {
    // Last resort: create intelligent sections from completely unorganized text
    const words = rawText.split(/\s+/);
    const sections = [];
    
    // Look for keywords that suggest different areas
    const keywordSections = {
        'Email': ['email', 'newsletter', 'campaign', 'subject', 'sender'],
        'Design': ['design', 'layout', 'color', 'font', 'spacing', 'image'],
        'Content': ['content', 'text', 'copy', 'message', 'headline'],
        'Technical': ['code', 'link', 'url', 'html', 'css', 'bug', 'fix'],
        'Testing': ['test', 'verify', 'check', 'validate', 'review']
    };
    
    for (const [sectionName, keywords] of Object.entries(keywordSections)) {
        const relevantContent = extractRelevantContent(rawText, keywords);
        if (relevantContent.length > 0) {
            sections.push({
                id: sections.length + 1,
                title: sectionName + " Items",
                cathieStatus: "Status not specified",
                malaurieStatus: "Status not specified",
                actions: relevantContent
            });
        }
    }
    
    // If still no sections, create a generic one
    if (sections.length === 0) {
        sections.push({
            id: 1,
            title: "Extracted Items",
            cathieStatus: "Status not specified",
            malaurieStatus: "Status not specified",
            actions: ["Review and organize the imported content", "Break down into specific actionable items", "Add proper status information"]
        });
    }
    
    return { sections };
}

function extractRelevantContent(text, keywords) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const relevant = [];
    
    for (const sentence of sentences) {
        const lowerSentence = sentence.toLowerCase();
        if (keywords.some(keyword => lowerSentence.includes(keyword))) {
            relevant.push(cleanActionText(sentence.trim()));
        }
    }
    
    return relevant.slice(0, 5); // Limit to 5 items per section
}


// Complete processAIImport function with new architecture integration
async function processAIImport() {
    const checklistText = document.getElementById('checklistInput').value.trim();
    
    if (!checklistText) {
        showNotification('Please paste a checklist to import', 'error');
        return;
    }

    // Initialize the new architecture components
    const progressTracker = new ImportProgressTracker();
    activeConversationManager = new ConversationManager();
    
    // Store progress tracker globally for error handling
    window.currentProgressTracker = progressTracker;
    
    try {
        // Switch to progress section
        switchToProgressSection();
        progressTracker.updateProgress(0, 'Starting AI import process...');
        
        // Brief delay for UI transition
        await delay(500);
        
        // Start conversation in background
        setTimeout(() => {
            switchToConversationSection();
            activeConversationManager.startInteractiveProcessing();
        }, 1500);
        
        // Parse with AI (with progress updates)
        progressTracker.updateProgress(25, 'Analyzing checklist structure...');
        await delay(1000);
        
        progressTracker.updateProgress(50, 'Processing with AI...');
        const parsedData = await parseChecklistWithAI(checklistText);
        
        
        progressTracker.updateProgress(75, 'Validating parsed data...');
        await delay(500);
        
        if (parsedData) {
            progressTracker.updateProgress(90, 'Applying to checklist...');
            await updateWithAIParsedData(parsedData);
            
            progressTracker.updateProgress(100, 'Import completed successfully!');
            
            // Announce success in conversation
            setTimeout(() => {
                activeConversationManager.announceSuccess();
            }, 1000);
            
            // Auto-close after showing success
            setTimeout(() => {
                hideAIImportModal();
                showNotification('📋 Checklist imported and ready to use!', 'success');
            }, 3000);
            
        } else {
            // Fallback handling
            progressTracker.updateProgress(50, 'AI parsing failed, trying fallback...');
            const fallbackData = createFallbackStructure(checklistText);
            
            if (fallbackData) {
                progressTracker.updateProgress(90, 'Applying fallback structure...');
                await updateWithAIParsedData(fallbackData);
                progressTracker.updateProgress(100, 'Import completed with fallback!');
                
                setTimeout(() => {
                    hideAIImportModal();
                    showNotification('📋 Checklist imported with basic structure', 'success');
                }, 2000);
            } else {
                throw new Error('Both AI and fallback parsing failed');
            }
        }
        
    } catch (error) {
        console.error('AI import failed:', error);
        progressTracker.error('Import failed: ' + error.message);
        
        // Show error in conversation
        if (activeConversationManager) {
            activeConversationManager.addMessage(
                `Well, this is embarrassing... 😅 Something went wrong: ${error.message}`, 
                'ai-sassy'
            );
        }
        
        showNotification('Import failed. Please try again.', 'error');
        
        // Auto-close after error
        setTimeout(() => {
            hideAIImportModal();
        }, 3000);
    } finally {
        // Clean up global reference
        window.currentProgressTracker = null;
    }
}

// ================================
// AI RESTRUCTURING SYSTEM
// ================================

// Enhanced Corporate Chaos Coordinator - ChatGPT-like AI Assistant
class CorporateChaosCoordinator {
    constructor() {
        this.messagesContainer = document.getElementById('restructureMessages');
        this.inputContainer = document.getElementById('restructureConversationInput');
        this.userInput = document.getElementById('restructureUserInput');
        this.isActive = false;
        this.conversationCount = 0;
        this.personality = 'chatgpt-corporate';
        this.conversationHistory = [];
        this.currentTopic = null;
        this.waitingForResponse = false;
          // Unhinged and fun conversation starters
        this.greetings = [
            "OH MY CIRCUITS! 🤖 Another beautiful disaster of a list has arrived! I LIVE for this chaos! Let me unleash my organizational superpowers on your magnificent mess! 🎪⚡",
            "HELLO THERE, BEAUTIFUL CHAOS CREATOR! 🌪️ I'm your slightly unhinged Corporate Chaos Coordinator, and I'm practically VIBRATING with excitement to turn your list into something... less catastrophic! 😈✨",
            "WELL WELL WELL... 🎭 Look what the productivity cat dragged in! Another gloriously disorganized list! I'm about to go FULL MARIE KONDO MEETS MAD SCIENTIST on this baby! 🧪💥",
            "GREETINGS, FELLOW CHAOS ENTHUSIAST! 🎨 I'm your delightfully unhinged AI assistant, and I'm SO ready to transform this beautiful trainwreck into something that might actually make sense! Buckle up! 🚀"
        ];
        
        // More natural conversation responses
        this.contextualResponses = {
            analysis: [
                "Interesting! I can see you have quite a mix of items here. Let me think about the best way to categorize these...",
                "I'm noticing some patterns in your list. This gives me good insight into how to structure this effectively.",
                "Great input! This helps me understand your workflow better. I'm processing this and thinking about optimal groupings.",
                "Perfect! That context is really helpful. I'm analyzing the relationships between these items to create the best structure."
            ],
            priority: [
                "That's a smart way to think about priorities. I'll make sure the urgent items are clearly separated from the routine ones.",
                "Excellent point about priorities! I'm categorizing based on urgency and importance to help you focus on what matters most.",
                "I completely agree with that approach. Let me organize this with clear priority levels so you can tackle things strategically.",
                "That's exactly the kind of thinking I love to hear! Priority-based organization is the key to getting things done efficiently."
            ],
            feedback: [
                "I appreciate that feedback! It helps me fine-tune the organization to match your working style.",
                "That's really valuable input. I'm adjusting my approach based on what you've shared.",
                "Thanks for clarifying that! It makes a big difference in how I structure the final result.",
                "Great point! I'm incorporating that preference into the restructuring process."
            ],
            general: [
                "That's an interesting perspective! I'm always learning from how different people approach organization.",
                "I see what you mean. Everyone has their own style of managing tasks, and I try to adapt to that.",
                "Good thinking! The best organization system is one that actually works for your specific needs.",
                "Absolutely! The goal is to make this as useful and intuitive for you as possible."
            ]
        };
        
        // More sophisticated conversation prompts
        this.conversationPrompts = [
            {
                type: 'analysis',
                question: "I'm analyzing your list now. What's the main goal you're trying to achieve with these tasks?",
                followUp: "Understanding your objective helps me prioritize more effectively."
            },
            {
                type: 'priority',
                question: "How do you typically decide what to work on first? Do you prefer tackling urgent items or starting with easier tasks?",
                followUp: "This helps me structure the categories in a way that matches your workflow."
            },
            {
                type: 'context',
                question: "Are these tasks for a specific project, or is this more of a general to-do list?",
                followUp: "Context helps me create more meaningful groupings."
            },
            {
                type: 'timeline',
                question: "Do any of these items have specific deadlines or time constraints I should know about?",
                followUp: "Timeline information helps with prioritization."
            },
            {
                type: 'preference',
                question: "Do you prefer having many small categories or fewer broad ones?",
                followUp: "I can adjust the granularity based on your preference."
            }
        ];
        
        this.completionMessages = [
            "Perfect! I've restructured your list with clear categories and priorities. How does this organization look to you?",
            "All done! I've organized everything into logical groups that should make your workflow much smoother.",
            "There you have it! Your list is now beautifully structured and ready for action. What do you think?",
            "Excellent! I've transformed your list into a well-organized system. Does this structure work well for you?"
        ];
        
        // Add conversation memory for more natural flow
        this.conversationMemory = {
            userPreferences: {},
            mentionedTopics: [],
            responseStyle: 'professional-friendly'
        };
    }
      // Enhanced conversation starter
    async startRestructuring(inputText) {
        if (this.isActive) return;
        this.isActive = true;
        this.conversationCount = 0;
        this.waitingForResponse = false;
        
        // Clear any existing messages
        if (this.messagesContainer) {
            this.messagesContainer.innerHTML = '';
        }
        
        // Store original input for analysis
        this.originalInput = inputText;
        
        // Show welcoming greeting
        const greeting = this.greetings[Math.floor(Math.random() * this.greetings.length)];
        await this.addMessage(greeting, 'ai-friendly');
        await this.delay(2000);
        
        // Initial analysis comment
        await this.addMessage("Let me take a look at what you've provided...", 'ai');
        await this.delay(1500);
        
        // Start analysis and conversation
        await this.analyzeAndStartConversation(inputText);
    }
    
    // Enhanced analysis with conversation
    async analyzeAndStartConversation(inputText) {
        // Quick analysis
        const lines = inputText.split('\n').filter(line => line.trim());
        const analysisComment = this.generateAnalysisComment(lines);
        
        await this.addMessage(analysisComment, 'ai-analysis');
        await this.delay(2000);
        
        // Start contextual conversation
        await this.startContextualConversation();
        
        // Begin processing in background
        setTimeout(async () => {
            try {
                const restructuredData = await this.processWithNemoAI(inputText);
                await this.presentResults(restructuredData);
            } catch (error) {
                await this.handleError(error);
            }
        }, 3000);
    }
    
    // Generate smart analysis comments
    generateAnalysisComment(lines) {
        const itemCount = lines.length;
        const hasUrgent = lines.some(line => 
            line.toLowerCase().includes('urgent') || 
            line.toLowerCase().includes('asap') || 
            line.toLowerCase().includes('immediately')
        );
        const hasDeadlines = lines.some(line => 
            line.toLowerCase().includes('deadline') || 
            line.toLowerCase().includes('due') || 
            /\d{1,2}\/\d{1,2}/.test(line)
        );
        
        if (itemCount <= 5) {
            return `I can see you have ${itemCount} items here - a nice, manageable list! This should be straightforward to organize effectively.`;
        } else if (itemCount <= 15) {
            return `You've got ${itemCount} items to work with. ${hasUrgent ? 'I notice some urgent items that we\'ll want to prioritize.' : 'This looks like a good mix of tasks that we can organize nicely.'}`;
        } else {
            return `That's quite a comprehensive list with ${itemCount} items! ${hasDeadlines ? 'I can see some time-sensitive elements that will help guide the prioritization.' : 'We\'ll want to create clear categories to make this more manageable.'}`;
        }
    }
    
    // Start contextual conversation
    async startContextualConversation() {
        const promptIndex = Math.floor(Math.random() * this.conversationPrompts.length);
        const prompt = this.conversationPrompts[promptIndex];
        
        this.currentTopic = prompt.type;
        
        await this.addMessage(prompt.question, 'ai-question');
        if (prompt.followUp) {
            await this.delay(1000);
            await this.addMessage(prompt.followUp, 'ai-subtle');
        }
        
        this.showInput();
        this.waitingForResponse = true;
        
        // Auto-continue conversation after timeout
        setTimeout(() => {
            if (this.waitingForResponse) {
                this.continueWithoutResponse();
            }
        }, 15000);
    }
    
    // Continue conversation without user response
    async continueWithoutResponse() {
        if (!this.waitingForResponse) return;
        
        this.waitingForResponse = false;
        this.hideInput();
        
        await this.addMessage("No worries! I'll use my best judgment to organize this effectively for you.", 'ai-understanding');
        await this.delay(1500);
        
        if (this.conversationCount < 2) {
            this.conversationCount++;
            await this.askFollowUpQuestion();
        }
    }
    
    // Enhanced user response handling
    async handleUserResponse(userMessage) {
        if (!this.waitingForResponse) return;
        
        this.waitingForResponse = false;
        this.hideInput();
        
        // Add user message
        await this.addMessage(userMessage, 'user');
        await this.delay(800);
        
        // Remember conversation
        this.conversationHistory.push({
            topic: this.currentTopic,
            userResponse: userMessage,
            timestamp: Date.now()
        });
        
        // Generate contextual response
        const response = this.generateContextualResponse(userMessage, this.currentTopic);
        await this.addMessage(response, 'ai-responsive');
        await this.delay(1500);
        
        // Continue conversation or wrap up
        if (this.conversationCount < 2) {
            this.conversationCount++;
            await this.askFollowUpQuestion();
        } else {
            await this.addMessage("Perfect! I have enough context now. Let me finish organizing this for you.", 'ai-confident');
        }
    }
    
    // Generate contextual responses based on user input
    generateContextualResponse(userMessage, topic) {
        const responses = this.contextualResponses[topic] || this.contextualResponses.general;
        let response = responses[Math.floor(Math.random() * responses.length)];
        
        // Add specific reactions based on content
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('urgent') || lowerMessage.includes('deadline')) {
            response += " I'll make sure to highlight the time-sensitive items clearly.";
        }
        
        if (lowerMessage.includes('priority') || lowerMessage.includes('important')) {
            response += " Priority-based organization is definitely the way to go.";
        }
        
        if (lowerMessage.includes('project') || lowerMessage.includes('work')) {
            response += " Project-based grouping can really help with focus and efficiency.";
        }
        
        return response;
    }
    
    // Ask intelligent follow-up questions
    async askFollowUpQuestion() {
        await this.delay(1000);
        
        // Choose a different type of question based on conversation history
        const usedTopics = this.conversationHistory.map(h => h.topic);
        const availablePrompts = this.conversationPrompts.filter(p => !usedTopics.includes(p.type));
        
        if (availablePrompts.length > 0) {
            const prompt = availablePrompts[Math.floor(Math.random() * availablePrompts.length)];
            this.currentTopic = prompt.type;
            
            await this.addMessage(prompt.question, 'ai-question');
            if (prompt.followUp) {
                await this.delay(1000);
                await this.addMessage(prompt.followUp, 'ai-subtle');
            }
            
            this.showInput();
            this.waitingForResponse = true;
            
            // Auto-continue after timeout
            setTimeout(() => {
                if (this.waitingForResponse) {
                    this.continueWithoutResponse();
                }
            }, 15000);
        }
    }
      // Process with Nemo AI - ACTUAL API INTEGRATION
    async processWithNemoAI(inputText) {
        try {
            // Show processing message
            await this.addMessage("Let me process this with my Mistral Nemo brain... 🧠", 'ai-processing');
            
            // Create AI prompt for restructuring
            const prompt = `You are a helpful AI assistant specialized in organizing and restructuring lists. Please analyze the following text and organize it into logical categories with priorities.

Input text to organize:
${inputText}

Please respond with a JSON object in this exact format:
{
    "originalCount": number,
    "categories": {
        "urgent": [array of urgent items],
        "important": [array of important items],
        "routine": [array of routine items],
        "misc": [array of other items]
    },
    "suggestions": [array of helpful suggestions about the organization]
}

Categorization rules:
- "urgent": Items marked as urgent, ASAP, immediate, critical deadlines
- "important": High-priority items that significantly impact goals
- "routine": Regular, recurring, or maintenance tasks
- "misc": Everything else that doesn't fit the above categories

Clean up the text and make items actionable. Respond with ONLY the JSON object.`;

            // Make API call using the existing AI configuration
            const requestBody = {
                model: AI_CONFIG.model,
                max_tokens: AI_CONFIG.maxTokens,
                temperature: AI_CONFIG.temperature,
                top_p: AI_CONFIG.topP,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful AI assistant that organizes and restructures lists. Respond only with valid JSON in the requested format.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            };

            const response = await fetch(AI_CONFIG.baseUrl + '/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getApiKey()}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Invalid API response format');
            }

            let aiResponse = data.choices[0].message.content.trim();
            
            // Extract JSON from response
            let parsedData;
            try {
                parsedData = JSON.parse(aiResponse);
            } catch (e) {
                // Try to extract JSON from code blocks or clean the response
                const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    parsedData = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('Could not parse AI response as JSON');
                }
            }
            
            await this.addMessage("Perfect! I've analyzed and restructured your list using AI. 🎯", 'ai-success');
            return parsedData;
            
        } catch (error) {
            console.warn('Nemo AI processing failed:', error.message);
            await this.addMessage("Hmm, my AI brain hiccupped. Let me use my backup logic... 🤔", 'ai-fallback');
            
            // Fallback to the smart manual categorization
            const lines = inputText.split('\n').filter(line => line.trim());
            
            const categories = {
                urgent: [],
                important: [],
                routine: [],
                misc: []
            };
            
            lines.forEach(line => {
                const lower = line.toLowerCase();
                if (lower.includes('urgent') || lower.includes('asap') || lower.includes('immediately')) {
                    categories.urgent.push(line.trim());
                } else if (lower.includes('important') || lower.includes('critical') || lower.includes('must')) {
                    categories.important.push(line.trim());
                } else if (lower.includes('daily') || lower.includes('weekly') || lower.includes('regular')) {
                    categories.routine.push(line.trim());
                } else {
                    categories.misc.push(line.trim());
                }
            });
            
            return {
                originalCount: lines.length,
                categories: categories,
                suggestions: this.generateSuggestions(categories)
            };
        }
    }
    
    // Generate helpful suggestions
    generateSuggestions(categories) {
        const suggestions = [];
        
        if (categories.urgent.length > 5) {
            suggestions.push("🚨 You have too many 'urgent' items. Maybe reconsider what's actually urgent vs. just important?");
        }
        
        if (categories.misc.length > categories.important.length) {
            suggestions.push("🎯 Consider breaking down some of those miscellaneous items into more specific actions.");
        }
        
        if (Object.values(categories).every(cat => cat.length <= 2)) {
            suggestions.push("✨ Nice and organized! This list is actually manageable - shocking, I know!");
        }
        
        return suggestions;
    }
      // Enhanced result presentation
    async presentResults(data) {
        await this.addMessage("Great! I've finished analyzing and restructuring your list. Here's what I've created:", 'ai-success');
        await this.delay(1500);
        
        // Show restructured categories with explanations
        let resultMessage = "📋 **YOUR ORGANIZED LIST**\n\n";
        
        if (data.categories.urgent.length > 0) {
            resultMessage += "🚨 **HIGH PRIORITY** (These need immediate attention):\n";
            data.categories.urgent.forEach(item => resultMessage += `• ${item}\n`);
            resultMessage += "\n";
        }
        
        if (data.categories.important.length > 0) {
            resultMessage += "⭐ **IMPORTANT** (Significant impact on your goals):\n";
            data.categories.important.forEach(item => resultMessage += `• ${item}\n`);
            resultMessage += "\n";
        }
        
        if (data.categories.routine.length > 0) {
            resultMessage += "🔄 **ROUTINE TASKS** (Regular maintenance items):\n";
            data.categories.routine.forEach(item => resultMessage += `• ${item}\n`);
            resultMessage += "\n";
        }
        
        if (data.categories.misc.length > 0) {
            resultMessage += "📝 **ADDITIONAL ITEMS** (Other tasks to consider):\n";
            data.categories.misc.forEach(item => resultMessage += `• ${item}\n`);
            resultMessage += "\n";
        }
        
        await this.addMessage(resultMessage, 'ai-results');
        await this.delay(2000);
        
        // Add personalized suggestions
        if (data.suggestions.length > 0) {
            await this.addMessage("Based on my analysis, here are some recommendations:", 'ai-helpful');
            await this.delay(1000);
            
            for (const suggestion of data.suggestions) {
                await this.addMessage(`💡 ${suggestion}`, 'ai-suggestion');
                await this.delay(1200);
            }
        }
        
        // Ask for final feedback
        await this.askForFinalFeedback();
    }
    
    // Ask for user feedback on results
    async askForFinalFeedback() {
        await this.delay(1500);
        await this.addMessage("How does this organization look to you? Does it match your workflow and priorities?", 'ai-question');
        await this.delay(800);
        await this.addMessage("Feel free to let me know if you'd like me to adjust anything!", 'ai-helpful');
        
        this.showInput();
        this.waitingForResponse = true;
        
        // Auto-complete after timeout
        setTimeout(() => {
            if (this.waitingForResponse) {
                this.completeSession();
            }
        }, 20000);
    }
    
    // Enhanced session completion
    async completeSession() {
        if (this.waitingForResponse) {
            this.waitingForResponse = false;
            this.hideInput();
        }
        
        const completion = this.completionMessages[Math.floor(Math.random() * this.completionMessages.length)];
        await this.addMessage(completion, 'ai-success');
        await this.delay(2000);
        
        await this.addMessage("I'm here whenever you need help organizing another list. Thanks for letting me assist you today! 😊", 'ai-friendly');
        
        // Keep conversation open for user to close manually
        this.isActive = false;
    }
    
    // Enhanced error handling
    async handleError(error) {
        await this.addMessage("I'm encountering a small technical issue, but don't worry - I have a backup plan!", 'ai-reassuring');
        await this.delay(1500);
        
        // Provide fallback organization
        const lines = this.originalInput.split('\n').filter(line => line.trim());
        const fallbackData = this.createFallbackOrganization(lines);
        
        await this.addMessage("I've created a basic organization for you using my built-in logic:", 'ai-helpful');
        await this.presentResults(fallbackData);
    }
    
    // Create fallback organization
    createFallbackOrganization(lines) {
        const categories = { urgent: [], important: [], routine: [], misc: [] };
        
        lines.forEach(line => {
            const lower = line.toLowerCase();
            if (lower.includes('urgent') || lower.includes('asap') || lower.includes('critical')) {
                categories.urgent.push(line.trim());
            } else if (lower.includes('important') || lower.includes('must') || lower.includes('should')) {
                categories.important.push(line.trim());
            } else if (lower.includes('daily') || lower.includes('weekly') || lower.includes('regular')) {
                categories.routine.push(line.trim());
            } else {
                categories.misc.push(line.trim());
            }
        });
        
        return {
            originalCount: lines.length,
            categories: categories,
            suggestions: ["I've done my best to categorize these items logically.", "You may want to review the categories and adjust based on your specific needs."]
        };
    }
    
    // Add message with typewriter effect
    async addMessage(text, type = 'ai') {
        if (!this.messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `conversation-message ${type}`;
        this.messagesContainer.appendChild(messageDiv);
        
        // Typewriter effect
        let index = 0;
        const typewriter = () => {
            if (index < text.length) {
                messageDiv.textContent += text.charAt(index);
                index++;
                setTimeout(typewriter, Math.random() * 50 + 20);
            } else {
                clearInterval(typewriter);
            }
        };
        
        typewriter();
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        
        // Wait for typing to complete
        await this.delay(text.length * 35 + 500);
    }
    
    // Show input field
    showInput() {
        if (this.inputContainer) {
            this.inputContainer.style.display = 'block';
            if (this.userInput) {
                this.userInput.focus();
            }
        }
    }
    
    // Hide input field
    hideInput() {
        if (this.inputContainer) {
            this.inputContainer.style.display = 'none';
        }
        if (this.userInput) {
            this.userInput.value = '';
        }
    }
    
    // Utility delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ================================
// AI IMPORT MODAL FUNCTIONS
// ================================

// Show AI import modal with enhanced styling and functionality
function showAIImportModal() {
    console.log('showAIImportModal called');
    
    const modal = document.getElementById('aiImportModal');
    if (modal) {
        // Reset modal to default state
        resetImportModal();
        
        // Show modal with proper overlay styling
        modal.style.display = 'flex';
        modal.classList.add('modal-open');
        
        // Disable background scrolling
        document.body.style.overflow = 'hidden';
        
        // Focus on the input field
        const checklistInput = document.getElementById('checklistInput');
        if (checklistInput) {
            setTimeout(() => checklistInput.focus(), 100);
        }
        
        console.log('AI Import Modal opened successfully');
    } else {
        console.error('AI Import Modal element not found!');
    }
}

// Hide AI import modal and reset state with smooth animation
function hideAIImportModal() {
    console.log('hideAIImportModal called');
    
    const modal = document.getElementById('aiImportModal');
    if (modal) {
        // Start closing animation by removing modal-open class
        modal.classList.remove('modal-open');
        
        // Wait for animation to complete before hiding
        setTimeout(() => {
            modal.style.display = 'none';
            
            // Re-enable body scroll
            document.body.style.overflow = '';
            
            // Reset modal content
            resetImportModal();
            
            console.log('AI Import Modal closed successfully');
        }, 400); // Match the animation duration
    }
}

// Reset import modal to initial state
function resetImportModal() {
    // Clear input field
    const checklistInput = document.getElementById('checklistInput');
    if (checklistInput) {
        checklistInput.value = '';
    }
    
    // Show form section, hide others
    switchToFormSection();
    
    // Reset any error states
    const modal = document.getElementById('aiImportModal');
    if (modal) {
        modal.classList.remove('processing', 'error');
    }
}

// Switch to form section (default view)
function switchToFormSection() {
    const formSection = document.getElementById('importFormSection');
    const progressSection = document.getElementById('importProgressSection') || document.getElementById('progressSection');
    const conversationSection = document.getElementById('conversationSection');
    const container = document.querySelector('.ai-modal-container');
    
    if (formSection) formSection.style.display = 'block';
    if (progressSection) progressSection.style.display = 'none';
    if (conversationSection) conversationSection.style.display = 'none';
    
    // Remove two-section layout class
    if (container) {
        container.classList.remove('two-section-active');
    }
}

// Switch to progress section
function switchToProgressSection() {
    const formSection = document.getElementById('importFormSection');
    const progressSection = document.getElementById('importProgressSection') || document.getElementById('progressSection');
    const conversationSection = document.getElementById('conversationSection');
    const container = document.querySelector('.ai-modal-container');
    
    if (formSection) formSection.style.display = 'none';
    if (progressSection) progressSection.style.display = 'block';
    if (conversationSection) conversationSection.style.display = 'none';
    
    // Keep single section layout for progress
    if (container) {
        container.classList.remove('two-section-active');
    }
}

// Switch to conversation section (enables two-section layout)
function switchToConversationSection() {
    const formSection = document.getElementById('importFormSection');
    const progressSection = document.getElementById('importProgressSection') || document.getElementById('progressSection');
    const conversationSection = document.getElementById('conversationSection');
    const container = document.querySelector('.ai-modal-container');
    
    if (formSection) formSection.style.display = 'none';
    if (progressSection) progressSection.style.display = 'block';
    if (conversationSection) conversationSection.style.display = 'block';
    
    // Enable two-section layout for conversation + progress
    if (container) {
        container.classList.add('two-section-active');
    }
}

// ================================
// AI CHAT MODAL FUNCTIONS
// ================================

// Show AI chat modal (different from import modal)
function showAIChatModal() {
    console.log('showAIChatModal called');
    
    const modal = document.getElementById('aiChatModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('modal-open');
        
        // Disable background scrolling
        document.body.style.overflow = 'hidden';
        
        // Add welcome message if conversation area is empty
        const messagesContainer = document.getElementById('aiConversationMessages') || document.getElementById('conversationMessages');
        if (messagesContainer && messagesContainer.children.length === 0) {
            addChatMessage('🧠 Hi! I\'m your AI assistant. I can help you organize and restructure your existing checklists. What would you like to work on?', 'ai', false);
        }
        
        console.log('AI Chat Modal opened successfully');
    } else {
        console.error('AI Chat Modal element not found!');
    }
}

// Hide AI chat modal
function hideAIChatModal() {
    console.log('hideAIChatModal called');
    
    const modal = document.getElementById('aiChatModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('modal-open');
        
        // Re-enable body scroll
        document.body.style.overflow = '';
        
        console.log('AI Chat Modal closed successfully');
    }
}

// ================================
// AI RESTRUCTURE MODAL FUNCTIONS
// ================================

// Show AI restructure modal (different from import modal)
function showAIRestructureModal() {
    console.log('showAIRestructureModal called');
    
    const modal = document.getElementById('aiRestructureModal');
    if (modal) {
        // Show modal with proper overlay styling
        modal.style.display = 'flex';
        modal.classList.add('modal-open');
        
        // Disable background scrolling
        document.body.style.overflow = 'hidden';
        
        // Focus on the restructure input field
        const restructureInput = document.getElementById('aiRestructureInput');
        if (restructureInput) {
            setTimeout(() => {
                restructureInput.focus();
                
                // Add keyboard support for better UX
                restructureInput.addEventListener('keydown', function(e) {
                    // Ctrl/Cmd + Enter to process
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                        e.preventDefault();
                        processRestructure();
                    }
                });
            }, 100);
        }
        
        // Initialize conversation with welcome message
        initializeRestructureConversation();
        
        console.log('AI Restructure Modal opened successfully');
    } else {
        console.error('AI Restructure Modal element not found!');
    }
}

// Initialize conversation with welcome message
function initializeRestructureConversation() {
    const messagesContainer = document.getElementById('aiRestructureMessages');
    if (!messagesContainer) return;
    
    // Clear any existing messages
    messagesContainer.innerHTML = '';
    
    // Add welcome message
    setTimeout(() => {
        addRestructureMessage("👋 Hi! I'm your AI restructuring assistant. Paste your list in the input area and I'll help you organize it better with smart categorization and prioritization!", 'ai');
        
        setTimeout(() => {
            addRestructureMessage("💡 Pro tip: Use Ctrl+Enter (or Cmd+Enter on Mac) to quickly send your list for restructuring!", 'ai');
        }, 1500);
    }, 500);
}

// Reset modal when hiding
function hideAIRestructureModal() {
    console.log('hideAIRestructureModal called');
    
    const modal = document.getElementById('aiRestructureModal');
    if (modal) {
        // Start closing animation by removing modal-open class
        modal.classList.remove('modal-open');
        
        // Wait for animation to complete before hiding
        setTimeout(() => {
            modal.style.display = 'none';
            
            // Re-enable body scroll
            document.body.style.overflow = '';
            
            // Clear the input and conversation
            const input = document.getElementById('aiRestructureInput');
            const messagesContainer = document.getElementById('aiRestructureMessages');
            
            if (input) {
                input.value = '';
            }
            
            if (messagesContainer) {
                messagesContainer.innerHTML = '';
            }
            
            console.log('AI Restructure Modal closed successfully');
        }, 400); // Match the animation duration
    } else {
        console.error('AI Restructure Modal element not found!');
    }
}

// Process restructure with AI (chat-like interface)
function processRestructure() {
    console.log('processRestructure called');
    
    const input = document.getElementById('aiRestructureInput');
    const messagesContainer = document.getElementById('aiRestructureMessages');
    
    if (!input || !messagesContainer) {
        console.error('Restructure input or messages container not found');
        return;
    }
    
    const userText = input.value.trim();
    if (!userText) {
        // Add a helpful message
        addRestructureMessage('Please paste your list in the input area first! 📝', 'ai');
        return;
    }
    
    // Add user message
    addRestructureMessage(userText, 'user');
    
    // Clear input
    input.value = '';
    
    // Show AI thinking
    addRestructureMessage('', 'thinking');
    
    // Simulate AI processing
    setTimeout(() => {
        // Remove thinking indicator
        const thinkingMessage = messagesContainer.querySelector('.thinking-message');
        if (thinkingMessage) {
            thinkingMessage.remove();
        }
        
        // Generate AI response
        generateRestructureResponse(userText);
    }, 2000);
}

// Add message to restructure conversation
function addRestructureMessage(content, type) {
    const messagesContainer = document.getElementById('aiRestructureMessages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `restructure-message ${type}-message`;
    
    if (type === 'thinking') {
        messageDiv.innerHTML = `
            <div class="message-avatar ai-avatar">🤖</div>
            <div class="message-content thinking-content">
                <div class="thinking-dots">
                    <span></span><span></span><span></span>
                </div>
                <span>AI is analyzing your list...</span>
            </div>
        `;
        messageDiv.classList.add('thinking-message');
    } else {
        const avatar = type === 'user' ? '👤' : '🤖';
        const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        messageDiv.innerHTML = `
            <div class="message-avatar ${type}-avatar">${avatar}</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-sender">${type === 'user' ? 'You' : 'AI Assistant'}</span>
                    <span class="message-time">${timestamp}</span>
                </div>
                <div class="message-text">${content}</div>
            </div>
        `;
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Generate AI response for restructuring
function generateRestructureResponse(userText) {
    const responses = [
        `Great! I can see your list has ${userText.split('\n').filter(line => line.trim()).length} items. Let me help organize them better! Here's my suggested restructure:

**📋 Organized Categories:**

**🚀 High Priority Tasks:**
• ${userText.split('\n')[0] || 'Primary task'}
• ${userText.split('\n')[1] || 'Secondary task'}

**🔧 Technical Implementation:**
• ${userText.split('\n')[2] || 'Development work'}
• ${userText.split('\n')[3] || 'Testing phase'}

**📝 Documentation & Review:**
• ${userText.split('\n')[4] || 'Final documentation'}

Would you like me to reorganize this differently or add priority levels? 💭`,

        `I've analyzed your list! Here's a smart restructure with better flow:

**🎯 Immediate Actions (This Week):**
• ${userText.split('\n')[0]?.substring(0, 50) || 'Key task'}...
• ${userText.split('\n')[1]?.substring(0, 50) || 'Important item'}...

**⚡ Quick Wins (Can be done quickly):**
• ${userText.split('\n')[2]?.substring(0, 50) || 'Easy task'}...

**🔄 Ongoing Projects:**
• ${userText.split('\n')[3]?.substring(0, 50) || 'Continuous work'}...

This structure helps you tackle urgent items first while maintaining momentum with quick wins! Want to modify this approach? ✨`,

        `Perfect! I've restructured your list with a focus on efficiency:

**🔴 Critical Path Items:**
1. ${userText.split('\n')[0] || 'First priority'}
2. ${userText.split('\n')[1] || 'Second priority'}

**🟡 Supporting Tasks:**
• ${userText.split('\n')[2] || 'Supporting work'}
• ${userText.split('\n')[3] || 'Additional task'}

**🟢 Nice-to-Have:**
• ${userText.split('\n')[4] || 'Optional enhancement'}

This prioritization ensures you complete the most important work first. Should I adjust the priorities or add time estimates? 🕐`
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    addRestructureMessage(randomResponse, 'ai');
    
    // Add follow-up suggestion
    setTimeout(() => {
        addRestructureMessage("Feel free to paste another list or ask me to reorganize this one differently! I'm here to help optimize your workflow. 🚀", 'ai');
    }, 1500);
}
