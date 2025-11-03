// === app.js / writers.js for LunaR Writers Web ===

document.addEventListener('DOMContentLoaded', () => {

  // --------------------------
  // ELEMENTS
  const loginBtn = document.getElementById('loginBtn');
  const modal = document.getElementById('loginModal');
  const closeBtn = document.querySelector('.close');
  const submitLogin = document.getElementById('submitLogin');
  const userName = document.getElementById('userName');
  const profileName = document.getElementById('profileName');
  const startBtn = document.getElementById('startBtn');

  const saveBtn = document.getElementById('savePoem');
  const clearBtn = document.getElementById('clearPoem');
  const input = document.getElementById('poemInput');
  const list = document.getElementById('poemList');

  console.log("Storage active");

  // --------------------------
  // Load saved poems
  const poems = JSON.parse(localStorage.getItem('poems')) || [];
  poems.forEach(renderPoem);

  // --------------------------
  // Save poem
  saveBtn?.addEventListener('click', () => {
    const text = input.value.trim();
    if (text.length === 0) return;
    poems.push(text);
    localStorage.setItem('poems', JSON.stringify(poems));
    renderPoem(text);
    input.value = '';
  });

  // Clear editor
  clearBtn?.addEventListener('click', () => input.value = '');

  // Render poem function
  function renderPoem(poem) {
    if (!list) return;
    const div = document.createElement('div');
    div.className = 'poem-card';
    div.textContent = poem;
    list.appendChild(div);
  }

  // --------------------------
  // Open modal
  loginBtn?.addEventListener('click', () => {
    modal.style.display = 'flex';
  });

  // Close modal
  closeBtn?.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Handle login submit
  submitLogin?.addEventListener('click', () => {
    const name = userName.value.trim();
    if (name) {
      localStorage.setItem('writerName', name);
      profileName.textContent = `Hi, ${name}`;
      loginBtn.style.display = 'none';
      modal.style.display = 'none';
    }
  });

  // Load saved name if exists
  const savedName = localStorage.getItem('writerName');
  if (savedName) {
    profileName.textContent = `Hi, ${savedName}`;
    loginBtn.style.display = 'none';
  }

  // --------------------------
  // Start button → redirect to writers.html
  startBtn?.addEventListener('click', () => {
    window.location.href = "./writers.html";
  });

  // --------------------------
  // Close modal on outside click
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

});
