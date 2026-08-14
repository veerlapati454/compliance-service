(function() {
      'use strict';

      if (window.AOS) {
        AOS.init({ once: true, easing: 'ease-out-cubic' });
      }

      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');
      const togglePassword = document.getElementById('togglePassword');
      const toggleIcon = document.getElementById('toggleIcon');
      const loginForm = document.getElementById('loginForm');
      const loginBtn = document.getElementById('loginBtn');
      const errorMsg = document.getElementById('errorMsg');
      const errorText = document.getElementById('errorText');
      const emailValidation = document.getElementById('emailValidation');
      const userRoleBtn = document.getElementById('userRole');
      const adminRoleBtn = document.getElementById('adminRole');

      let selectedRole = 'user';
      let isPasswordVisible = false;

      // --- Role Selection ---
      function setRole(role) {
        selectedRole = role;
        [userRoleBtn, adminRoleBtn].forEach(btn => btn.classList.remove('active'));
        if (role === 'user') userRoleBtn.classList.add('active');
        else adminRoleBtn.classList.add('active');
        hideError();
        validateEmail();
      }

      userRoleBtn.addEventListener('click', () => setRole('user'));
      adminRoleBtn.addEventListener('click', () => setRole('admin'));

      // --- Email Validation (only Gmail) ---
      function validateEmail() {
        const email = emailInput.value.trim();
        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

        if (email.length > 0 && !gmailRegex.test(email)) {
          emailValidation.classList.add('show');
          return false;
        } else {
          emailValidation.classList.remove('show');
          return email.length > 0 && gmailRegex.test(email);
        }
      }

      emailInput.addEventListener('input', () => { validateEmail(); hideError(); });
      emailInput.addEventListener('blur', validateEmail);

      // --- Password Toggle ---
      togglePassword.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        isPasswordVisible = !isPasswordVisible;
        passwordInput.type = isPasswordVisible ? 'text' : 'password';
        toggleIcon.className = isPasswordVisible ? 'fas fa-eye-slash' : 'fas fa-eye';
        passwordInput.focus();
      });

      togglePassword.addEventListener('mousedown', (e) => e.preventDefault());

      // --- Error handling ---
      function showError(message) {
        errorText.textContent = message || 'Invalid credentials. Please try again.';
        errorMsg.classList.add('show');
      }

      function hideError() {
        errorMsg.classList.remove('show');
      }

      // --- Direct navigation without loading delay ---
      function redirectToDashboard() {
        const email = emailInput.value.trim();
        const redirectUrl = (selectedRole === 'admin') ? 'adminDashboard.html' : 'dashboard.html';

        const userData = {
          email: email,
          role: selectedRole,
          name: email.split('@')[0]
        };

        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', selectedRole);
        localStorage.setItem('userEmail', email);

        window.location.replace(redirectUrl);
      }

      // --- Login handler ---
      function handleLogin(e) {
        e.preventDefault();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

        if (!gmailRegex.test(email)) {
          showError('Please enter a valid Gmail address (@gmail.com)');
          emailInput.focus();
          return;
        }

        if (password.length < 4) {
          showError('Password must be at least 4 characters');
          passwordInput.focus();
          return;
        }

        redirectToDashboard();
      }

      loginForm.addEventListener('submit', handleLogin);

      passwordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          loginForm.dispatchEvent(new Event('submit'));
        }
      });

      emailInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          passwordInput.focus();
        }
      });

      // --- Init ---
      setRole('user');
      hideError();
    })();