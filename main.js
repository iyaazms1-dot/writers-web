const loginBtn = document.getElementById('loginBtn');
const modal = document.getElementById('loginModal');
const closeBtn = document.querySelector('.close');
const submitLogin = document.getElementById('submitLogin');
const userName = document.getElementById('userName');
const profileName = document.getElementById('profileName');
const startBtn = document.getElementById('startBtn');
document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('savePoem');
  const clearBtn = document.getElementById('clearPoem');
  const input = document.getElementById('poemInput');
  const list = document.getElementById('poemList');
  console.log("Storage active");

  // Load saved poems
  const poems = JSON.parse(localStorage.getItem('poems')) || [];
  poems.forEach(renderPoem);

  saveBtn.addEventListener('click', () => {
    const text = input.value.trim();
    if (text.length === 0) return;
    poems.push(text);
    localStorage.setItem('poems', JSON.stringify(poems));
    renderPoem(text);
    input.value = '';
  });

  clearBtn.addEventListener('click', () => input.value = '');

  function renderPoem(poem) {
    const div = document.createElement('div');
    div.className = 'poem-card';
    div.textContent = poem;
    list.appendChild(div);
  }
});

// Open modal
loginBtn.onclick = () => {
  modal.style.display = 'flex';
};

// Close modal
closeBtn.onclick = () => {
  modal.style.display = 'none';
};

// Handle login submit
submitLogin.onclick = () => {
  const name = userName.value.trim();
  if (name) {
    localStorage.setItem('writerName', name);
    profileName.textContent = `Hi, ${name}`;
    loginBtn.style.display = 'none';
    modal.style.display = 'none';
  }
};

// Load saved name if exists
window.onload = () => {
  const savedName = localStorage.getItem('writerName');
  if (savedName) {
    profileName.textContent = `Hi, ${savedName}`;
    loginBtn.style.display = 'none';
  }
};

// Redirect to main page
startBtn.onclick = () => {
  window.location.href = "writers.html";
};

// Close modal on outside click
window.onclick = (e) => {
  if (e.target === modal) modal.style.display = 'none';
};
