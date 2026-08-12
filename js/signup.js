(function() {
      'use strict';

      if (window.AOS) {
        AOS.init({ once: true, easing: 'ease-out-cubic' });
      }

      const form = document.getElementById('signupForm');
      const fullName = document.getElementById('fullName');
      const username = document.getElementById('username');
      const gmail = document.getElementById('gmail');
      const password = document.getElementById('password');
      const confirmPassword = document.getElementById('confirmPassword');
      const termsCheckbox = document.getElementById('termsCheckbox');

      const nameWrap = document.getElementById('nameWrap');
      const userWrap = document.getElementById('userWrap');
      const gmailWrap = document.getElementById('gmailWrap');
      const passWrap = document.getElementById('passWrap');
      const confirmWrap = document.getElementById('confirmWrap');

      const nameError = document.getElementById('nameError');
      const userError = document.getElementById('userError');
      const gmailError = document.getElementById('gmailError');
      const passError = document.getElementById('passError');
      const confirmError = document.getElementById('confirmError');
      const termsError = document.getElementById('termsError');

      // ─── Toggle password visibility for Password field ───
      const toggleBtn = document.getElementById('togglePass');
      const eyeIcon = document.getElementById('eyeIcon');
      let passwordVisible = false;

      toggleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        passwordVisible = !passwordVisible;
        password.type = passwordVisible ? 'text' : 'password';
        eyeIcon.className = passwordVisible ? 'fas fa-eye-slash' : 'fas fa-eye';
        password.focus();
      });

      // ─── Toggle password visibility for Confirm Password field ───
      const toggleConfirmBtn = document.getElementById('toggleConfirmPass');
      const confirmEyeIcon = document.getElementById('confirmEyeIcon');
      let confirmPasswordVisible = false;

      toggleConfirmBtn.addEventListener('click', function(e) {
        e.preventDefault();
        confirmPasswordVisible = !confirmPasswordVisible;
        confirmPassword.type = confirmPasswordVisible ? 'text' : 'password';
        confirmEyeIcon.className = confirmPasswordVisible ? 'fas fa-eye-slash' : 'fas fa-eye';
        confirmPassword.focus();
      });

      // ─── Prevent digits and spaces ───
      function preventDigitsAndSpaces(e) {
        const key = e.key;
        if (key === 'Backspace' || key === 'Delete' || key === 'Tab' ||
            key === 'Escape' || key === 'Enter' || key.startsWith('Arrow') ||
            key === 'Home' || key === 'End' || key === 'PageUp' || key === 'PageDown') {
          return;
        }
        if (!/^[A-Za-z]$/.test(key)) {
          e.preventDefault();
        }
      }

      function preventSpaces(e) {
        if (e.key === ' ') {
          e.preventDefault();
        }
      }

      fullName.addEventListener('keydown', preventDigitsAndSpaces);
      username.addEventListener('keydown', preventDigitsAndSpaces);
      username.addEventListener('keydown', preventSpaces);

      function setError(wrap, errorEl, show) {
        wrap.classList.toggle('error', show);
        errorEl.classList.toggle('show', show);
      }

      function validateName() {
        const val = fullName.value.trim();
        const ok = val.length > 0 && /^[A-Za-z\s]+$/.test(val);
        setError(nameWrap, nameError, !ok);
        return ok;
      }

      function validateUsername() {
        const val = username.value.trim();
        const ok = val.length > 0 && /^[A-Za-z]+$/.test(val);
        setError(userWrap, userError, !ok);
        return ok;
      }

      function validateGmail() {
        const val = gmail.value.trim();
        const ok = val.length > 0 && /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(val);
        setError(gmailWrap, gmailError, !ok);
        return ok;
      }

      function validatePassword() {
        const val = password.value;
        const ok = val.length >= 8;
        setError(passWrap, passError, !ok);
        return ok;
      }

      function validateConfirm() {
        const ok = password.value === confirmPassword.value && confirmPassword.value.length > 0;
        setError(confirmWrap, confirmError, !ok);
        return ok;
      }

      function validateTerms() {
        const checked = termsCheckbox.checked;
        termsError.classList.toggle('visible', !checked);
        return checked;
      }

      fullName.addEventListener('input', validateName);
      fullName.addEventListener('paste', function() { setTimeout(validateName, 10); });

      username.addEventListener('input', validateUsername);
      username.addEventListener('paste', function() { setTimeout(validateUsername, 10); });

      gmail.addEventListener('input', validateGmail);
      password.addEventListener('input', function() {
        validatePassword();
        if (confirmPassword.value.length > 0) validateConfirm();
      });
      confirmPassword.addEventListener('input', validateConfirm);
      termsCheckbox.addEventListener('change', function() {
        termsError.classList.toggle('visible', !this.checked);
      });

      form.addEventListener('submit', function(e) {
        e.preventDefault();

        const isNameValid = validateName();
        const isUserValid = validateUsername();
        const isGmailValid = validateGmail();
        const isPassValid = validatePassword();
        const isConfirmValid = validateConfirm();
        const isTermsValid = validateTerms();

        if (isNameValid && isUserValid && isGmailValid && isPassValid && isConfirmValid && isTermsValid) {
          window.location.href = '404.html';
        } else {
          if (!isNameValid) { fullName.focus(); return; }
          if (!isUserValid) { username.focus(); return; }
          if (!isGmailValid) { gmail.focus(); return; }
          if (!isPassValid) { password.focus(); return; }
          if (!isConfirmValid) { confirmPassword.focus(); return; }
          if (!isTermsValid) { termsCheckbox.focus(); }
        }
      });

      [fullName, username, gmail, password, confirmPassword].forEach(field => {
        field.addEventListener('blur', function() {
          if (this === fullName) validateName();
          else if (this === username) validateUsername();
          else if (this === gmail) validateGmail();
          else if (this === password) { validatePassword(); if (confirmPassword.value.length > 0) validateConfirm(); }
          else if (this === confirmPassword) validateConfirm();
        });
      });
    })();

    function setViewportHeight() {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
    }

    setViewportHeight();

    window.addEventListener("resize", setViewportHeight);
    window.addEventListener("orientationchange", setViewportHeight);