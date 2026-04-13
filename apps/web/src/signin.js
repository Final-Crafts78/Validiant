/**
 * Validiant Signin - Modular Entrypoint
 */
import { setCurrentUser } from './store/globalState';
import { showToast } from './utils/ui';

async function handleLogin(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    if (data.success) {
      setCurrentUser(data.user);
      window.location.href = '/dashboard.html';
    } else {
      showToast(data.message || 'Invalid credentials', 'error');
    }
  } catch (err) {
    showToast('Network error, please try again.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Sign In';
  }
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});
