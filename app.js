document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  const modal = document.getElementById('loginModal');
  const closeBtn = document.querySelector('.close');
  const submitLogin = document.getElementById('submitLogin');
  const userName = document.getElementById('userName');
  const profileName = document.getElementById('profileName');
  const startBtn = document.getElementById('startBtn');

  // Load saved name
  const savedName = localStorage.getItem('writerName');
  if (savedName && profileName) {
    profileName.textContent = `Hi, ${savedName}`;
    if (loginBtn) loginBtn.style.display = 'none';
  }

  // Login modal
  loginBtn?.addEventListener('click', () => modal.style.display = 'flex');
  closeBtn?.addEventListener('click', () => modal.style.display = 'none');
  submitLogin?.addEventListener('click', () => {
    const name = userName.value.trim();
    if (name) {
      localStorage.setItem('writerName', name);
      if (profileName) profileName.textContent = `Hi, ${name}`;
      if (loginBtn) loginBtn.style.display = 'none';
      modal.style.display = 'none';
    }
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // Start button
  startBtn?.addEventListener('click', () => window.location.href = './writers.html');
});
