/**
 * TaskMaster Authentication - Modern JavaScript Interface
 * Handles login, registration, and form interactions
 */

class AuthApp {
    constructor() {
        this.isLoginMode = true;
        this.init();
    }
    
    init() {
        this.initializeEventListeners();
        this.initializeFormValidation();
        console.log('Authentication interface initialized');
    }
      initializeEventListeners() {
        // Add null checks for all elements
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const showRegisterBtn = document.getElementById('showRegisterBtn');
        const showLoginBtn = document.getElementById('showLoginBtn');
        
        // Form submissions
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
        
        // Form switching
        if (showRegisterBtn) {
            showRegisterBtn.addEventListener('click', () => this.switchToRegister());
        }
        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', () => this.switchToLogin());
        }
          // Real-time validation
        if (loginForm) {
            this.setupFormValidation('loginForm');
        }
        if (registerForm) {
            this.setupFormValidation('registerForm');
        }
        
        // Password confirmation for register form
        const confirmPassword = document.getElementById('confirmPassword');
        const registerPassword = document.getElementById('registerPassword');
        
        if (confirmPassword && registerPassword) {
            confirmPassword.addEventListener('input', () => {
                this.validatePasswordConfirmation();
            });
            
            registerPassword.addEventListener('input', () => {
                this.validatePasswordConfirmation();
            });
        }
        
        // Enter key handling
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                const activeForm = this.isLoginMode ? 
                    document.getElementById('loginForm') : 
                    document.getElementById('registerForm');
                
                if (document.activeElement && activeForm.contains(document.activeElement)) {
                    e.preventDefault();
                    activeForm.dispatchEvent(new Event('submit'));
                }
            }
        });
    }
      setupFormValidation(formId) {
        const form = document.getElementById(formId);
        if (!form) {
            console.warn(`Form with ID '${formId}' not found`);
            return;
        }
        
        const inputs = form.querySelectorAll('input[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }
    
    initializeFormValidation() {
        // Email validation pattern
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            input.addEventListener('input', () => this.validateEmail(input));
        });
        
        // Password strength validation
        const passwordInputs = document.querySelectorAll('input[type="password"]');
        passwordInputs.forEach(input => {
            if (input.id.includes('register')) {
                input.addEventListener('input', () => this.validatePasswordStrength(input));
            }
        });
    }
    
    // Form Switching
    switchToRegister() {
        if (this.isLoginMode) {
            this.animateFormSwitch('register');
            this.isLoginMode = false;
        }
    }
    
    switchToLogin() {
        if (!this.isLoginMode) {
            this.animateFormSwitch('login');
            this.isLoginMode = true;
        }
    }
    
    animateFormSwitch(targetForm) {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if (targetForm === 'register') {
            // Hide login form
            loginForm.classList.add('sliding-out');
            
            setTimeout(() => {
                loginForm.style.display = 'none';
                loginForm.classList.remove('sliding-out');
                
                // Show register form
                registerForm.style.display = 'block';
                registerForm.classList.add('sliding-in');
                
                setTimeout(() => {
                    registerForm.classList.remove('sliding-in');
                    document.getElementById('registerEmail').focus();
                }, 50);
            }, 150);
            
        } else {
            // Hide register form
            registerForm.classList.add('sliding-out');
            
            setTimeout(() => {
                registerForm.style.display = 'none';
                registerForm.classList.remove('sliding-out');
                
                // Show login form
                loginForm.style.display = 'block';
                loginForm.classList.add('sliding-in');
                
                setTimeout(() => {
                    loginForm.classList.remove('sliding-in');
                    document.getElementById('loginEmail').focus();
                }, 50);
            }, 150);
        }
    }
      // Authentication Handlers
    async handleLogin(event) {
        event.preventDefault();
        
        const form = event.target;
        const submitBtn = document.getElementById('loginBtn');
        const formData = new FormData(form);
        
        const email = formData.get('email');
        const password = formData.get('password');
        
        // Validate that we have the required data
        if (!email || !password) {
            this.showMessage('Please fill in all required fields.', 'error');
            return;
        }
        
        const emailTrimmed = email.trim().toLowerCase();
        const passwordTrimmed = password.trim();
        
        // Validate inputs
        if (!this.validateLoginForm(emailTrimmed, passwordTrimmed)) {
            return;
        }
        
        try {
            // Show loading state
            this.setButtonLoading(submitBtn, true);
              const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    email: emailTrimmed, 
                    password: passwordTrimmed 
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showToast('Login successful! Redirecting...', 'success');
                
                // Redirect after short delay
                setTimeout(() => {
                    window.location.href = data.redirect || '/dashboard';
                }, 1000);
                
            } else {
                throw new Error(data.message || 'Login failed');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            this.showToast(error.message || 'Login failed. Please try again.', 'error');
            this.setButtonLoading(submitBtn, false);
        }
    }
    
    async handleRegister(event) {
        event.preventDefault();
        
        const form = event.target;
        const submitBtn = document.getElementById('registerBtn');
        const formData = new FormData(form);
        
        const email = formData.get('email').trim().toLowerCase();
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        
        // Validate inputs
        if (!this.validateRegisterForm(email, password, confirmPassword)) {
            return;
        }
        
        try {
            // Show loading state
            this.setButtonLoading(submitBtn, true);
            
            const response = await fetch('/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showToast('Account created successfully! Redirecting...', 'success');
                
                // Redirect after short delay
                setTimeout(() => {
                    window.location.href = data.redirect || '/dashboard';
                }, 1000);
                
            } else {
                throw new Error(data.message || 'Registration failed');
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            this.showToast(error.message || 'Registration failed. Please try again.', 'error');
            this.setButtonLoading(submitBtn, false);
        }
    }
    
    // Form Validation
    validateLoginForm(email, password) {
        let isValid = true;
        
        // Email validation
        if (!email) {
            this.showFieldError('loginEmail', 'Email is required');
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            this.showFieldError('loginEmail', 'Please enter a valid email address');
            isValid = false;
        }
        
        // Password validation
        if (!password) {
            this.showFieldError('loginPassword', 'Password is required');
            isValid = false;
        }
        
        return isValid;
    }
    
    validateRegisterForm(email, password, confirmPassword) {
        let isValid = true;
        
        // Email validation
        if (!email) {
            this.showFieldError('registerEmail', 'Email is required');
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            this.showFieldError('registerEmail', 'Please enter a valid email address');
            isValid = false;
        }
        
        // Password validation
        if (!password) {
            this.showFieldError('registerPassword', 'Password is required');
            isValid = false;
        } else if (password.length < 6) {
            this.showFieldError('registerPassword', 'Password must be at least 6 characters long');
            isValid = false;
        }
        
        // Confirm password validation
        if (!confirmPassword) {
            this.showFieldError('confirmPassword', 'Please confirm your password');
            isValid = false;
        } else if (password !== confirmPassword) {
            this.showFieldError('confirmPassword', 'Passwords do not match');
            isValid = false;
        }
        
        return isValid;
    }
    
    validateField(input) {
        const value = input.value.trim();
        
        switch (input.type) {
            case 'email':
                if (!value) {
                    this.showFieldError(input.id, 'Email is required');
                    return false;
                } else if (!this.isValidEmail(value)) {
                    this.showFieldError(input.id, 'Please enter a valid email address');
                    return false;
                }
                break;
                
            case 'password':
                if (!value) {
                    this.showFieldError(input.id, 'Password is required');
                    return false;
                } else if (input.id.includes('register') && value.length < 6) {
                    this.showFieldError(input.id, 'Password must be at least 6 characters long');
                    return false;
                }
                break;
        }
        
        this.clearFieldError(input.id);
        return true;
    }
    
    validateEmail(input) {
        const email = input.value.trim();
        
        if (email && !this.isValidEmail(email)) {
            this.showFieldError(input.id, 'Please enter a valid email address');
            return false;
        }
        
        if (email && this.isValidEmail(email)) {
            this.showFieldSuccess(input.id);
            return true;
        }
        
        this.clearFieldError(input.id);
        return true;
    }
    
    validatePasswordStrength(input) {
        const password = input.value;
        
        if (!password) {
            this.clearFieldError(input.id);
            return;
        }
        
        if (password.length < 6) {
            this.showFieldError(input.id, 'Password must be at least 6 characters long');
            return false;
        }
        
        // Check password strength
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        if (strength >= 3) {
            this.showFieldSuccess(input.id, 'Strong password');
            return true;
        } else if (strength >= 2) {
            this.showFieldWarning(input.id, 'Medium strength password');
            return true;
        } else {
            this.showFieldWarning(input.id, 'Weak password - consider adding numbers, symbols, or mixed case');
            return true;
        }
    }
      validatePasswordConfirmation() {
        const passwordField = document.getElementById('registerPassword');
        const confirmPasswordField = document.getElementById('confirmPassword');
        
        if (!passwordField || !confirmPasswordField) {
            return;
        }
        
        const password = passwordField.value;
        const confirmPassword = confirmPasswordField.value;
        
        if (!confirmPassword) {
            this.clearFieldError('confirmPassword');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showFieldError('confirmPassword', 'Passwords do not match');
            return false;
        }
        
        this.showFieldSuccess('confirmPassword', 'Passwords match');
        return true;
    }
    
    // Field Error/Success Display
    showFieldError(fieldId, message) {
        this.clearFieldMessages(fieldId);
        
        const field = document.getElementById(fieldId);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
        field.classList.add('error');
    }
    
    showFieldSuccess(fieldId, message = '') {
        this.clearFieldMessages(fieldId);
        
        if (message) {
            const field = document.getElementById(fieldId);
            const successDiv = document.createElement('div');
            successDiv.className = 'form-success';
            successDiv.textContent = message;
            
            field.parentNode.appendChild(successDiv);
        }
        
        const field = document.getElementById(fieldId);
        field.classList.remove('error');
        field.classList.add('success');
    }
    
    showFieldWarning(fieldId, message) {
        this.clearFieldMessages(fieldId);
        
        const field = document.getElementById(fieldId);
        const warningDiv = document.createElement('div');
        warningDiv.className = 'form-warning';
        warningDiv.textContent = message;
        
        field.parentNode.appendChild(warningDiv);
        field.classList.remove('error', 'success');
        field.classList.add('warning');
    }
      clearFieldError(field) {
        this.clearFieldMessages(field);
        
        // Handle both field ID string and field element
        const fieldElement = typeof field === 'string' ? document.getElementById(field) : field;
        if (fieldElement) {
            fieldElement.classList.remove('error', 'success', 'warning');
        }
    }
    
    clearFieldMessages(field) {
        // Handle both field ID string and field element
        const fieldElement = typeof field === 'string' ? document.getElementById(field) : field;
        if (!fieldElement || !fieldElement.parentNode) return;
        
        const parent = fieldElement.parentNode;
        
        // Remove existing error/success/warning messages
        const messages = parent.querySelectorAll('.form-error, .form-success, .form-warning');
        messages.forEach(msg => msg.remove());
    }
    
    // Utility Methods
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    setButtonLoading(button, loading) {
        const text = button.querySelector('.btn-text');
        const spinner = button.querySelector('.btn-spinner');
        
        if (loading) {
            button.disabled = true;
            text.style.display = 'none';
            spinner.style.display = 'block';
        } else {
            button.disabled = false;
            text.style.display = 'block';
            spinner.style.display = 'none';
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? '✅' : 
                    type === 'error' ? '❌' : 
                    type === 'warning' ? '⚠️' : 'ℹ️';
        
        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${this.escapeHtml(message)}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        container.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }
}

// Initialize auth app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authApp = new AuthApp();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthApp;
}
