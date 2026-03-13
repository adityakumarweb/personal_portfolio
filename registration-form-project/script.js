function handleRegister(event) {
    event.preventDefault();
    
    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return false;
    }

    if (!terms) {
        alert("Please agree to the terms and conditions.");
        return false;
    }

    // Simulate successful registration
    const btn = document.querySelector('.btn-register');
    const originalText = btn.textContent;
    
    btn.disabled = true;
    btn.textContent = 'Creating Account...';

    setTimeout(() => {
        alert(`Welcome, ${fullname}! Your account has been created successfully.`);
        document.getElementById('registrationForm').reset();
        btn.disabled = false;
        btn.textContent = originalText;
    }, 2000);

    return false;
}
