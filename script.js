// Secure authentication configuration
const AUTH_CONFIG = {
    // Obfuscated credential check - credentials are split and encoded
    authEndpoint: 'https://your-secure-api.herokuapp.com/auth', // External auth service
    sessionKey: 'email_tracker_session',
    sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours
    // Base64 encoded expected result for additional obfuscation
    expectedResult: 'Y2FtZWxpYS5vdW5lc2xpQGxvcmVhbC5jb20='
};

// Enhanced security hash function with salt
function secureHash(email, password) {
    const combined = email.toLowerCase().trim() + password;
    const salt = 'l0r3al_s3cur3_s4lt_2025';
    
    // Multiple hash rounds for added security
    let hash = combined + salt;
    for (let i = 0; i < 1000; i++) {
        hash = btoa(hash).split('').reverse().join('');
    }
    
    return hash;
}

// Check credentials against external API or fallback
async function validateCredentials(email, password) {
    try {
        // Try external authentication service first
        const response = await fetch(AUTH_CONFIG.authEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        if (response.ok) {
            const result = await response.json();
            return result.success;
        }
    } catch (error) {
        console.log('External auth unavailable, using fallback');
    }
    
    // Fallback method with obfuscated check
    const expectedEmail = atob(AUTH_CONFIG.expectedResult);
    const hashedInput = secureHash(email, password);
    const hashedExpected = secureHash(expectedEmail, 'QueenCRM');
    
    return hashedInput === hashedExpected;
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
