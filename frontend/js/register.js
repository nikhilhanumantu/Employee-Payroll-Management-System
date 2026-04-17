document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const btn = e.target.querySelector('button');
    const originalText = btn.innerHTML;

    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }

    try {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
        btn.disabled = true;

        const res = await api('/api/register', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        showToast(res.message || 'Account created successfully!', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);

    } catch (err) {
        showToast(err.message || 'Registration failed', 'error');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});

