// ui.js - UI & navigation helpers (upgraded)
(() => {
    console.log("UI initialized");

  // elements
  const navHome = document.getElementById('navHome');
  const navEditor = document.getElementById('navEditor');
  const navLibrary = document.getElementById('navLibrary');
  const navProfile = document.getElementById('navProfile');

  const homePanel = document.getElementById('home');
  const editorPanel = document.getElementById('editor');
  const libraryPanel = document.getElementById('library');
  const profilePanel = document.getElementById('profile');
  const rightPanel = document.getElementById('rightPanel');

  const loginBtnTop = document.getElementById('loginBtnTop');
  const profileChip = document.getElementById('profileChip');
  const profileArea = document.getElementById('profileArea');
  const profileInitials = document.getElementById('profileInitials');
  const profileText = document.getElementById('profileText');
  const profileNameInput = document.getElementById('profileNameInput');
  const profileSigInput = document.getElementById('profileSigInput');
  const saveProfile = document.getElementById('saveProfile');
  const logoutBtn = document.getElementById('logout');

  const themeToggle = document.getElementById('themeToggle');
  const toastEl = document.getElementById('toast');

  // simple show/hide
  function showPanel(which) {
    homePanel.classList.add('hidden');
    editorPanel.classList.add('hidden');
    profilePanel.classList.add('hidden');
    // library is part of right column, toggled via nav selection
    if (which === 'home') homePanel.classList.remove('hidden');
    if (which === 'editor') editorPanel.classList.remove('hidden');
    if (which === 'library') homePanel.classList.remove('hidden'); // keep feed visible
    if (which === 'profile') {
      profilePanel.classList.remove('hidden');
      // ensure right panel visible on larger screens
    }
  }

  // nav events
  navHome?.addEventListener('click', () => showPanel('home'));
  navEditor?.addEventListener('click', () => showPanel('editor'));
  navLibrary?.addEventListener('click', () => showPanel('library'));
  navProfile?.addEventListener('click', () => showPanel('profile'));

  // login simulation: prompt style
  loginBtnTop?.addEventListener('click', () => {
    const name = prompt('Enter your name to continue:');
    if (name && name.trim()) {
      setProfileName(name.trim());
      showToast(`Welcome, ${name.trim()}`);
    }
  });

  // profile functions
  function setProfileName(name) {
    localStorage.setItem('writerName', name);
    profileChip.classList.remove('hidden');
    if(loginBtnTop) loginBtnTop.style.display = 'none';
    profileInitials.textContent = makeInitials(name);
    profileText.textContent = `Hi, ${name}`;
    profileNameInput.value = name;
  }

  function makeInitials(name){
    const parts = name.split(' ').filter(Boolean);
    if(parts.length===0) return 'WW';
    if(parts.length===1) return parts[0].slice(0,2).toUpperCase();
    return (parts[0][0]+parts[1][0]).toUpperCase();
  }

  // on load, populate profile if exists
  window.addEventListener('load', () => {
    const saved = localStorage.getItem('writerName');
    const sig = localStorage.getItem('writerSignature') || 'LuneR.';
    if (saved) setProfileName(saved);
    profileSigInput.value = sig;
    // theme restore
    const theme = localStorage.getItem('ww_theme');
    if(theme === 'light') document.documentElement.classList.add('light');
    // allow external check for query param (share link)
    openPostFromQuery();
  });

  saveProfile?.addEventListener('click', () => {
    const name = profileNameInput.value.trim() || 'Writer';
    const sig = profileSigInput.value.trim() || 'LuneR.';
    localStorage.setItem('writerName', name);
    localStorage.setItem('writerSignature', sig);
    setProfileName(name);
    showToast('Profile saved');
  });

  logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem('writerName');
    localStorage.removeItem('writerSignature');
    profileChip.classList.add('hidden');
    if(loginBtnTop) loginBtnTop.style.display = 'inline-block';
    profileText.textContent = '';
    showToast('Logged out');
  });

  // theme toggle (light/dark-ish) with persistence
  themeToggle?.addEventListener('click', () => {
    document.documentElement.classList.toggle('light');
    const isLight = document.documentElement.classList.contains('light');
    localStorage.setItem('ww_theme', isLight ? 'light' : 'dark');
    // small color tweak when toggled handled by CSS variables in writers.css
  });

  // toast helper
  let toastTimer = null;
  function showToast(msg, timeout = 2400){
    if(!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> toastEl.classList.add('hidden'), timeout);
  }

  // expose setProfileName and showToast for app.js
  window.WW_UI = {
    setProfileName,
    showToast
  };

  // parse query param ?post=<id> and open detail
  function openPostFromQuery(){
    try {
      const params = new URLSearchParams(location.search);
      const id = params.get('post');
      if(id){
        // open feed then request app to show detail
        setTimeout(()=> {
          if(window.WW_App && typeof window.WW_App.openPostDetail === 'function'){
            window.WW_App.openPostDetail(id);
          } else {
            // wait a moment if app not loaded yet
            let retries = 0;
            const t = setInterval(()=> {
              if(window.WW_App && typeof window.WW_App.openPostDetail === 'function'){
                clearInterval(t);
                window.WW_App.openPostDetail(id);
              }
              retries++;
              if(retries>20) clearInterval(t);
            }, 200);
          }
        }, 200);
      }
    } catch(e){}
  }

})();
