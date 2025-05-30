/**
 * Minimal test for authentication functionality
 */

// Test basic DOM readiness
console.log('Testing DOM and basic functionality...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM loaded successfully');
    
    // Test element access
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    
    console.log('Form elements found:', {
        loginForm: !!loginForm,
        registerForm: !!registerForm,
        loginEmail: !!loginEmail,
        loginPassword: !!loginPassword
    });
    
    // Test basic event handling
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('✅ Login form submission intercepted');
            
            const formData = new FormData(loginForm);
            const email = formData.get('email');
            const password = formData.get('password');
            
            console.log('Form data extracted:', { email: !!email, password: !!password });
            
            // Test fetch capability
            fetch('/auth/check')
                .then(response => response.json())
                .then(data => {
                    console.log('✅ API call successful:', data);
                })
                .catch(error => {
                    console.log('⚠️ API call failed:', error);
                });
        });
    }
    
    // Test form switching
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const showLoginBtn = document.getElementById('showLoginBtn');
    
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', function() {
            console.log('✅ Register button clicked');
            if (registerForm) {
                loginForm.style.display = 'none';
                registerForm.style.display = 'block';
            }
        });
    }
    
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', function() {
            console.log('✅ Login button clicked');
            if (loginForm) {
                registerForm.style.display = 'none';
                loginForm.style.display = 'block';
            }
        });
    }
    
    console.log('🎉 Basic auth test completed successfully');
});
