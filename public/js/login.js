// List of allowed email domains
const allowedDomains = [
    'gmail.com',
    'yahoo.com',
    'outlook.com',
    'hotmail.com'
    // Add more domains as needed
];

// Email validation function
function isValidEmail(email) {
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, message: 'Invalid email format' };
    }

    // Domain validation
    const domain = email.split('@')[1].toLowerCase();
    if (!allowedDomains.includes(domain)) {
        return { 
            valid: false, 
            message: 'Please use a valid email provider (Gmail, Yahoo, Outlook, or Hotmail)' 
        };
    }

    return { valid: true };
}

document.addEventListener('DOMContentLoaded', function() {
    // Helper function to get the API base URL
    function getApiBaseUrl() {
        // When using live server (port 5500 or 5501), point to the Express server
        if (window.location.port === '5500' || window.location.port === '5501') {
            return 'http://localhost:3000';
        }
        // When running through Express, use relative paths
        return '';
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (user && window.location.pathname.includes('login.html')) {
        if (user.role === 'admin') {
            window.location.href = '/dashboard.html';
        } else {
            window.location.href = '/index.html';
        }
        return;
    }

    // Login form template
    const loginForm = `
    <div class="form-container">
        <div class="logo">
            <img src="img/people/banner.png" alt="FG Cabahug Trading">
        </div>
        <div class="form-group">
            <label for="email">Email or Username</label>
            <input type="text" id="loginEmail" placeholder="Enter email or username" required>
        </div>
        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="loginPassword" placeholder="Password" required>
        </div>
        <button type="submit" class="login-btn" onclick="handleLogin(event)">Sign In</button>    
        <div class="links">
            <a href="#" onclick="forgotPassword(event)">Forgot password?</a>
            <a href="#" onclick="toggleForm('register')">Don't have an account?</a>
        </div>

        <div class="footer">
            © FG Cabahug Trading - <a href="#">Privacy Policy</a> - <a href="#">Legal Notices</a>
        </div>
    </div>
`;

    // Register form template
    const registerForm = `
        <div class="form-container">
            <div class="logo">
                <img src="img/people/banner.png" alt="FG Cabahug Trading">
            </div>
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="regUsername" placeholder="Username" required>
            </div>
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="regEmail" placeholder="Email" required>
            </div>  
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="regPassword" placeholder="Password" required>
            </div>
            <div class="form-group">
                <label for="confirmPassword">Confirm Password</label>
                <input type="password" id="regConfirmPassword" placeholder="Confirm Password" required>
            </div>
            <div class="form-group">
                <label for="fullName">Full Name</label>
                <input type="text" id="regFullName" placeholder="Full Name" required>
            </div>
            <div class="form-group">
                <label for="mobile">Mobile No.</label>
                <input type="tel" id="regMobile" placeholder="+63" required>
            </div>
            <div class="form-group">
                <label for="address">Address</label>
                <input type="text" id="regAddress" placeholder="House/Unit No, Street name" required>
            </div>
            <div class="form-row">
                <div class="form-group half">
                    <label for="province">Province</label>
                    <input type="text" id="regProvince" placeholder="Select Province" required>
                </div>
                <div class="form-group half">
                    <label for="city">City/Municipality</label>
                    <input type="text" id="regCity" placeholder="Enter your City or Municipality" required>
                </div>
            </div>
            <div class="form-group">
                <label for="zipCode">ZIP Code</label>
                <input type="text" id="regZipCode" placeholder="4-digit ZIP Code" required>
            </div>
            <button type="submit" class="login-btn" onclick="handleRegister(event)">Create an Account</button>
            
            <div class="links">
                <a href="#" onclick="toggleForm('login')">Already have an account? Log in here.</a>
            </div>
        </div>
    `;

    // Initialize the form with login form
    const formSection = document.querySelector('.form-section');
    formSection.innerHTML = loginForm;

    // Form toggle function
    window.toggleForm = function(type) {
        const formSection = document.querySelector('.form-section');
        formSection.innerHTML = type === 'login' ? loginForm : registerForm;
        
        // Close any open popups when switching forms
        const popupOverlay = document.querySelector('.popup-overlay');
        if (popupOverlay) {
            closePopup(popupOverlay);
        }
    }

    window.handleLogin = async function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(`${getApiBaseUrl()}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirect based on role
            if (data.user.role === 'admin') {
                window.location.href = '/dashboard.html';
            } else {
                window.location.href = '/index.html';
            }
        } catch (error) {
            showError(error.message);
        }
    }

    window.handleRegister = async function(e) {
        e.preventDefault();
    
        const email = document.getElementById('regEmail').value;
        const emailValidation = isValidEmail(email);
    
        if (!emailValidation.valid) {
            showError(emailValidation.message);
            return;
        }
    
        // Get all registration values
        const user = {
            username: document.getElementById('regUsername').value,
            email: email,
            password: document.getElementById('regPassword').value,
            confirmPassword: document.getElementById('regConfirmPassword').value,
            fullName: document.getElementById('regFullName').value,
            mobile: document.getElementById('regMobile').value,
            address: document.getElementById('regAddress').value,
            province: document.getElementById('regProvince').value,
            city: document.getElementById('regCity').value,
            zipCode: document.getElementById('regZipCode').value,
            role: 'member' // Always register as member
        };
    
        // Basic validation
        if (user.password !== user.confirmPassword) {
            showError('Passwords do not match');
            return;
        }
    
        try {
            const response = await fetch(`${getApiBaseUrl()}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }
    
            // Show success popup with email status
            showSuccess(data.message, data.emailSent);
            
            // Form will be switched via popup button, no need for automatic toggle
        } catch (error) {
            showError(error.message);
        }
    }

    window.forgotPassword = function(e) {
        e.preventDefault();
        window.location.href = '/reset-password.html';
    }

    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        // Remove any existing error messages
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Insert error message after the login/register button
        const btn = document.querySelector('.login-btn');
        btn.parentNode.insertBefore(errorDiv, btn.nextSibling);
        
        // Remove error message after 3 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    function showPopup(content, autoClose = true) {
        // Remove any existing popups
        const existingPopup = document.querySelector('.popup-overlay');
        if (existingPopup) {
            document.body.removeChild(existingPopup);
        }
        
        // Create popup elements
        const popupOverlay = document.createElement('div');
        popupOverlay.className = 'popup-overlay';
        
        const popupContent = document.createElement('div');
        popupContent.className = 'popup-content';
        
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.className = 'popup-close';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', () => {
            closePopup(popupOverlay);
        });
        
        // Create content container
        const contentContainer = document.createElement('div');
        contentContainer.className = 'popup-body';
        contentContainer.innerHTML = content;
        
        // Assemble the popup
        popupContent.appendChild(closeButton);
        popupContent.appendChild(contentContainer);
        popupOverlay.appendChild(popupContent);
        
        // Add to DOM
        document.body.appendChild(popupOverlay);
        
        // Activate popup (trigger animation)
        setTimeout(() => {
            popupOverlay.classList.add('active');
        }, 10);
        
        // Auto close after delay if requested
        if (autoClose) {
            setTimeout(() => {
                closePopup(popupOverlay);
            }, 12000); // 12 seconds
        }
        
        return popupOverlay;
    }
    
    // Close popup function
    function closePopup(popupOverlay) {
        popupOverlay.classList.remove('active');
        setTimeout(() => {
            if (popupOverlay.parentNode) {
                popupOverlay.parentNode.removeChild(popupOverlay);
            }
        }, 500); // Wait for animation to complete
    }


    function showSuccess(message, emailSent = true) {
    // Check if this is a registration success message
    if (message.includes('Registration successful')) {
        let popupContent = '';
        
        if (emailSent) {
            popupContent = `
                <i class="fas fa-envelope-open-text popup-icon"></i>
                <h3 class="popup-title">Registration Successful!</h3>
                <div class="popup-message">
                    <p>Please check your email to verify your account. You will need to verify your email before logging in.</p>
                    <p style="margin-top: 10px; font-size: 0.9rem;">If you don't see the email, please check your spam folder or request a new verification link.</p>
                </div>
                <div class="popup-footer">
                    <button class="popup-button" onclick="toggleForm('login')">Go to Login</button>
                </div>
            `;
        } else {
            popupContent = `
                <i class="fas fa-exclamation-circle popup-icon" style="color: #e67e22;"></i>
                <h3 class="popup-title">Registration Successful!</h3>
                <div class="popup-message">
                    <p>Your account was created, but we couldn't send the verification email.</p>
                    <p style="margin-top: 10px;">Please contact support at <a href="mailto:fgctrading.business@gmail.com">fgctrading.business@gmail.com</a> for assistance.</p>
                </div>
                <div class="popup-footer">
                    <button class="popup-button" onclick="toggleForm('login')">Go to Login</button>
                </div>
            `;
        }
        
        // Show as popup
        showPopup(popupContent);
        
        // No need to switch forms automatically as the popup has a button for that
    } else {
        // For other success messages, use the original inline message
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        
        // Remove any existing success messages
        const existingSuccess = document.querySelector('.success-message');
        if (existingSuccess) {
            existingSuccess.remove();
        }
        
        // Insert success message after the login/register button
        const btn = document.querySelector('.login-btn');
        btn.parentNode.insertBefore(successDiv, btn.nextSibling);
        
        // Remove after delay
        setTimeout(() => {
            successDiv.classList.add('fade-out');
            setTimeout(() => {
                successDiv.remove();
            }, 500);
        }, 5000);
    }
}

    // Check if user is already logged in, but only after a brief delay
    // This prevents immediate redirect and allows the page to load properly
    setTimeout(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && window.location.pathname.includes('login.html')) {
            if (user.role === 'admin') {
                window.location.href = '/dashboard.html';
            } else {
                window.location.href = '/index.html';
            }
        }
    }, 100);
});
