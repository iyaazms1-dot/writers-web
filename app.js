// app.js — full app logic: posts, editor, upload, share, detail view
(() => {
  // selectors
  const feedList = document.getElementById('feedList');
  const publishBtn = document.getElementById('publishBtn');
  const postTitle = document.getElementById('postTitle');
  const postBody = document.getElementById('postBody');
  const privacyToggle = document.getElementById('privacyToggle');
  const sigToggle = document.getElementById('sigToggle');
  const saveDraft = document.getElementById('saveDraft');
  const editorMsg = document.getElementById('editorMsg');
  const libraryList = document.getElementById('libraryList');

  // detail view container: will create a modal-like overlay in DOM if needed
  let detailOverlay = null;

  // comment modal elements (existing)
  const commentModal = document.getElementById('commentModal');
  const commentList = document.getElementById('commentList');
  const newComment = document.getElementById('newComment');
  const postComment = document.getElementById('postComment');
  const closeComments = document.getElementById('closeComments');

  let activeCommentPostId = null;

  // storage helpers
  function savePosts(posts){ localStorage.setItem('ww_posts', JSON.stringify(posts)); }
  function loadPosts(){ try { return JSON.parse(localStorage.getItem('ww_posts')||'[]'); } catch(e){ return []; } }

  // create post object
  function makePost(title, body, isPrivate=false, signature='', bgData=null){
    return {
      id: 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2,7),
      title: title || '',
      body: body || '',
      createdAt: Date.now(),
      private: !!isPrivate,
      likes: 0,
      stars: 0,
      comments: [],
      signature: signature || '',
      bg: bgData // optional base64 image for background
    };
  }

  // simple escape
  function escapeHTML(str='') { return String(str||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
  function truncate(text, len=300){ if(!text) return ''; return text.length > len ? text.slice(0,len) + '…' : text; }
  function sanitizeFileName(name){ return name.replace(/[^a-z0-9-_]/gi,'_').slice(0,80) || 'post'; }

  // RENDER
  function renderPostCard(post){
    const card = document.createElement('article');
    card.className = 'post-card';
    card.dataset.id = post.id;
    // background image if exists
    const bgStyle = post.bg ? `style="background-image: linear-gradient(135deg, rgba(9,10,12,0.25), rgba(9,10,12,0.2)), url('${post.bg}'); background-size:cover; background-position:center"` : '';
    card.innerHTML = `
      <div class="post-meta" ${bgStyle}>
        <div class="left">
          <div class="avatar">${escapeHTMLInitials(post.signature || extractInitials(post))}</div>
          <div>
            <div class="post-title">${escapeHTML(post.title || (post.body.slice(0,40) || 'Untitled'))}</div>
            <div class="muted small">${timeAgo(post.createdAt)}</div>
          </div>
        </div>
        <div class="right muted">${post.private ? 'Private' : 'Public'}</div>
      </div>
      <div class="post-body">${escapeHTML(truncate(post.body, 800))}${post.signature ? ("\n\n— " + escapeHTML(post.signature)) : ''}</div>
      <div class="post-actions">
        <button class="action-btn like-btn">👍 <span class="count">${post.likes}</span></button>
        <button class="action-btn star-btn">⭐ <span class="count">${post.stars}</span></button>
        <button class="action-btn comment-btn">💬 <span class="count">${post.comments.length}</span></button>
        <button class="action-btn share-btn">🔗</button>
        <button class="action-btn download-btn">⬇️</button>
      </div>
    `;

    // events
    card.querySelector('.like-btn').addEventListener('click', ()=> { toggleLike(post.id); });
    card.querySelector('.star-btn').addEventListener('click', ()=> { toggleStar(post.id); });
    card.querySelector('.comment-btn').addEventListener('click', ()=> { openComments(post.id); });
    card.querySelector('.download-btn').addEventListener('click', ()=> { downloadPostAsTxt(post); });
    card.querySelector('.share-btn').addEventListener('click', ()=> { sharePostLink(post.id); });
    // open detail when clicking post body or title
    card.querySelector('.post-title').addEventListener('click', ()=> openPostDetail(post.id));
    card.querySelector('.post-body').addEventListener('click', ()=> openPostDetail(post.id));
    return card;
  }

  // for avatar initials
  function escapeHTMLInitials(str=''){ return escapeHTML((str || 'WW').slice(0,2).toUpperCase()); }
  function extractInitials(post){ return 'WW'; }

  // helper: time ago
  function timeAgo(ts){
    const diff = Date.now() - ts;
    const s = Math.floor(diff/1000);
    if(s < 60) return `${s}s`;
    const m = Math.floor(s/60);
    if(m < 60) return `${m}m`;
    const h = Math.floor(m/60);
    if(h < 24) return `${h}h`;
    const d = Math.floor(h/24);
    if(d < 7) return `${d}d`;
    return new Date(ts).toLocaleDateString();
  }

  // LOAD & RENDER
  function loadAndRender(){
    const posts = loadPosts().sort((a,b)=> b.createdAt - a.createdAt);
    feedList.innerHTML = '';
    const savedName = localStorage.getItem('writerName') || '';
    posts.forEach(p => {
      if(!p.private) feedList.appendChild(renderPostCard(p));
      else {
        // private posts aren't shown in feed; user can view them in profile/library
      }
    });
    renderLibrary(posts);
  }

  function renderLibrary(posts){
    libraryList.innerHTML = '';
    if(!posts.length){
      libraryList.innerHTML = '<div class="muted">No posts yet — your library is empty.</div>';
      return;
    }
    posts.slice().reverse().forEach(p => {
      const row = document.createElement('div');
      row.className = 'lib-item';
      row.innerHTML = `<div style="max-width:60%"><strong>${escapeHTML(p.title||'Untitled')}</strong><div class="muted small">${new Date(p.createdAt).toLocaleString()}</div></div>
        <div style="display:flex;gap:8px">
          <button class="btn-secondary small download-lib">Download</button>
          <button class="btn-secondary small del-lib">Delete</button>
        </div>`;
      row.querySelector('.download-lib').addEventListener('click', ()=> downloadPostAsTxt(p));
      row.querySelector('.del-lib').addEventListener('click', ()=> { deletePost(p.id); });
      libraryList.appendChild(row);
    });
  }

  // PUBLISH
  function publish(){
    const title = postTitle.value.trim();
    const body = postBody.value.trim();
    if(!body){
      editorMsg.textContent = 'Please write something before publishing.';
      setTimeout(()=> editorMsg.textContent = '', 2200);
      return;
    }
    const isPrivate = !!privacyToggle.checked;
    const sigEnabled = !!sigToggle.checked;
    const signature = sigEnabled ? (localStorage.getItem('writerSignature') || 'LuneR.') : '';
    // check draft background stored temporarily on editor (data attribute)
    const tempBg = postBody.dataset.bg || null;
    const posts = loadPosts();
    const post = makePost(title, body, isPrivate, signature, tempBg);
    posts.push(post);
    savePosts(posts);
    // clear editor
    postTitle.value = '';
    postBody.value = '';
    delete postBody.dataset.bg;
    privacyToggle.checked = false;
    sigToggle.checked = false;
    window.WW_UI.showToast('Published ✨');
    loadAndRender();
  }

  // likes, stars, delete
  function toggleLike(id){
    const posts = loadPosts();
    const idx = posts.findIndex(p=>p.id===id);
    if(idx===-1) return;
    posts[idx].likes = (posts[idx].likes||0)+1;
    savePosts(posts);
    loadAndRender();
  }
  function toggleStar(id){
    const posts = loadPosts();
    const idx = posts.findIndex(p=>p.id===id);
    if(idx===-1) return;
    posts[idx].stars = (posts[idx].stars||0)+1;
    savePosts(posts);
    window.WW_UI.showToast('Starred ⭐');
    loadAndRender();
  }
  function deletePost(id){
    let posts = loadPosts();
    posts = posts.filter(p=>p.id !== id);
    savePosts(posts);
    window.WW_UI.showToast('Deleted');
    loadAndRender();
  }

  // COMMENTS
  function openComments(postId){
    activeCommentPostId = postId;
    const posts = loadPosts();
    const post = posts.find(p=>p.id===postId);
    if(!post) return;
    commentList.innerHTML = '';
    if(!post.comments || !post.comments.length) {
      commentList.innerHTML = '<div class="muted">No comments yet.</div>';
    } else {
      post.comments.forEach(c => {
        const el = document.createElement('div');
        el.className = 'comment';
        el.innerHTML = `<div class="muted small">${new Date(c.at).toLocaleString()}</div><div>${escapeHTML(c.text)}</div>`;
        commentList.appendChild(el);
      });
    }
    commentModal.classList.remove('hidden');
  }
  postComment?.addEventListener('click', ()=>{
    const txt = newComment.value.trim();
    if(!txt || !activeCommentPostId) return;
    const posts = loadPosts();
    const idx = posts.findIndex(p=>p.id===activeCommentPostId);
    if(idx===-1) return;
    posts[idx].comments = posts[idx].comments || [];
    posts[idx].comments.push({ id: 'c_' + Date.now(), text: txt, at: Date.now() });
    savePosts(posts);
    newComment.value = '';
    openComments(activeCommentPostId);
    loadAndRender();
  });
  closeComments?.addEventListener('click', ()=> { commentModal.classList.add('hidden'); activeCommentPostId = null; });

  // DOWNLOAD
  function downloadPostAsTxt(post){
    const title = post.title || 'untitled';
    const filename = `${sanitizeFileName(title)}_${new Date(post.createdAt).toISOString().slice(0,10)}.txt`;
    const body = `${post.title ? post.title + '\n\n' : ''}${post.body}\n\n— ${post.signature || ''}`;
    const blob = new Blob([body], {type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // SHARE: create link to writers.html?post=<id>
  function sharePostLink(id){
    const base = location.origin + location.pathname.replace(/\/[^\/]*$/, '/') + 'writers.html';
    // If path already writers.html, build relative
    const urlBase = base.endsWith('/') ? base + 'writers.html' : base;
    const link = (urlBase.indexOf('http')===0 ? urlBase : (location.href.split('?')[0].replace(/index.html.*$/,'') + 'writers.html')) + '?post=' + encodeURIComponent(id);
    // copy to clipboard
    if(navigator.clipboard){
      navigator.clipboard.writeText(link).then(()=> window.WW_UI.showToast('Share link copied 🔗'));
    } else {
      prompt('Copy this link:', link);
    }
  }

  // DETAIL VIEW (opens overlay with full post)
  function openPostDetail(id){
    const posts = loadPosts();
    const post = posts.find(p=>p.id===id);
    if(!post) {
      window.WW_UI.showToast('Post not found');
      return;
    }
    // create overlay if not exists
    if(!detailOverlay){
      detailOverlay = document.createElement('div');
      detailOverlay.className = 'detail-overlay';
      detailOverlay.innerHTML = `<div class="detail-card"><button class="detail-close">Close</button><div class="detail-content"></div></div>`;
      document.body.appendChild(detailOverlay);
      detailOverlay.querySelector('.detail-close').addEventListener('click', ()=> detailOverlay.classList.remove('visible'));
    }
    const content = detailOverlay.querySelector('.detail-content');
    const bg = post.bg ? `style="background-image:url('${post.bg}');background-size:cover;background-position:center"` : '';
    content.innerHTML = `
      <article class="post-detail" ${bg}>
        <header><div class="avatar">${escapeHTMLInitials(post.signature||'WW')}</div><div><h3>${escapeHTML(post.title||'Untitled')}</h3><div class="muted small">${new Date(post.createdAt).toLocaleString()}</div></div></header>
        <div class="detail-body">${escapeHTML(post.body).replace(/\n/g,'<br>')}<div class="signature">${post.signature?('<br><br>— '+escapeHTML(post.signature)):''}</div></div>
        <div class="detail-actions">
          <button class="btn-primary detail-like">👍 ${post.likes}</button>
          <button class="btn-primary detail-star">⭐ ${post.stars}</button>
          <button class="btn-secondary detail-comment">💬 ${post.comments.length}</button>
          <button class="btn-secondary detail-share">🔗 Share</button>
        </div>
        <section class="detail-comments">
          <h4>Comments</h4>
          <div class="comments-list-mini"></div>
          <textarea class="detail-newcomment" placeholder="Add a comment..."></textarea>
          <div style="display:flex;gap:8px"><button class="btn-primary detail-postcomment">Post</button></div>
        </section>
      </article>
    `;
    // attach behavior
    detailOverlay.classList.add('visible');
    const likeBtn = content.querySelector('.detail-like');
    const starBtn = content.querySelector('.detail-star');
    const commentBtn = content.querySelector('.detail-comment');
    const shareBtn = content.querySelector('.detail-share');
    const postCommentBtn = content.querySelector('.detail-postcomment');
    const commentsMini = content.querySelector('.comments-list-mini');
    const newCommentEl = content.querySelector('.detail-newcomment');

    function refreshComments(){
      commentsMini.innerHTML = '';
      if(!post.comments || !post.comments.length) commentsMini.innerHTML = '<div class="muted">No comments yet.</div>';
      else post.comments.forEach(c => {
        const el = document.createElement('div'); el.className='comment';
        el.innerHTML = `<div class="muted small">${new Date(c.at).toLocaleString()}</div><div>${escapeHTML(c.text)}</div>`;
        commentsMini.appendChild(el);
      });
    }
    refreshComments();

    likeBtn.addEventListener('click', ()=> {
      toggleLike(post.id);
      // update label
      post = loadPosts().find(p=>p.id===id);
      likeBtn.textContent = `👍 ${post.likes}`;
    });
    starBtn.addEventListener('click', ()=> {
      toggleStar(post.id);
      post = loadPosts().find(p=>p.id===id);
      starBtn.textContent = `⭐ ${post.stars}`;
    });
    shareBtn.addEventListener('click', ()=> sharePostLink(post.id));
    postCommentBtn.addEventListener('click', ()=> {
      const t = newCommentEl.value.trim();
      if(!t) return;
      const posts = loadPosts();
      const idx = posts.findIndex(p=>p.id===post.id);
      posts[idx].comments.push({id:'c_'+Date.now(), text:t, at:Date.now()});
      savePosts(posts);
      newCommentEl.value='';
      post = posts[idx];
      refreshComments();
      loadAndRender();
    });
  }

  // make sample posts if empty
  function makeSamplePosts(){
    const posts = loadPosts();
    if(posts && posts.length) return;
    const s = [
      makePost('Moonlight Letter','The moon wrote me a letter last night — gentle, small lines that smelled of salt and dust.', false, 'LuneR.'),
      makePost('First Steps','I learned to breathe the edges of the day.\n\nShort lines for short feet.', false, ''),
      makePost('Private Draft','This draft will rest here for you alone.', true, '')
    ];
    savePosts(s);
  }

  // editor autosave: store drafts every 4s if changed
  let autosaveTimer = null;
  function setupAutosave(){
    let last = '';
    function tick(){
      const cur = postBody.value;
      if(cur && cur !== last){
        const state = {title: postTitle.value, body: cur, at: Date.now(), bg: postBody.dataset.bg || null};
        localStorage.setItem('ww_editor_autosave', JSON.stringify(state));
        window.WW_UI.showToast('Autosaved', 900);
        last = cur;
      }
      autosaveTimer = setTimeout(tick, 4000);
    }
    tick();
    // restore if present
    const saved = JSON.parse(localStorage.getItem('ww_editor_autosave') || 'null');
    if(saved){
      postTitle.value = saved.title || '';
      postBody.value = saved.body || '';
      if(saved.bg) postBody.dataset.bg = saved.bg;
      window.WW_UI.showToast('Restored autosave', 1200);
    }
  }

  // image upload for post background (drag-drop onto editor or file input)
  function setupImageUpload(){
    // allow drag/drop onto panel
    const editorArea = document.querySelector('.editor-area');
    if(!editorArea) return;
    editorArea.addEventListener('dragover', (e)=> { e.preventDefault(); editorArea.classList.add('dragover'); });
    editorArea.addEventListener('dragleave', ()=> editorArea.classList.remove('dragover'));
    editorArea.addEventListener('drop', (e)=> {
      e.preventDefault(); editorArea.classList.remove('dragover');
      const f = e.dataTransfer.files && e.dataTransfer.files[0];
      if(f && f.type.startsWith('image/')) { readFileAsDataURL(f); }
    });

    // also create an upload button in editor controls
    const uploadBtn = document.createElement('button');
    uploadBtn.className = 'btn-secondary';
    uploadBtn.textContent = 'Upload background';
    uploadBtn.type = 'button';
    uploadBtn.addEventListener('click', ()=> {
      const inp = document.createElement('input'); inp.type='file'; inp.accept='image/*';
      inp.onchange = ()=> { const f = inp.files[0]; if(f) readFileAsDataURL(f); };
      inp.click();
    });
    const editorControls = document.querySelector('.editor-controls .editor-right');
    if(editorControls) editorControls.insertBefore(uploadBtn, editorControls.firstChild);
  }

  function readFileAsDataURL(file){
    const r = new FileReader();
    r.onload = function(){ postBody.dataset.bg = r.result; window.WW_UI.showToast('Background set'); };
    r.readAsDataURL(file);
  }

  // small helpers
  function escapeHTMLInitials(str=''){ return escapeHTML((str || 'WW').slice(0,2).toUpperCase()); }
  function escapeHTML(str='') { return String(str||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }

  // PUBLIC API exposures
  window.WW_App = {
    loadAndRender,
    publish,
    downloadPostAsTxt,
    openPostDetail: openPostDetail // used by ui.js to open from ?post=ID
  };

  // UI actions
  publishBtn?.addEventListener('click', publish);
  saveDraft?.addEventListener('click', ()=> {
    const title = postTitle.value.trim();
    const body = postBody.value.trim();
    if(!body){ window.WW_UI.showToast('Nothing to save'); return; }
    const drafts = JSON.parse(localStorage.getItem('ww_drafts')||'[]');
    drafts.push({id:'d_'+Date.now(), title, body, at:Date.now()});
    localStorage.setItem('ww_drafts', JSON.stringify(drafts));
    window.WW_UI.showToast('Draft saved');
  });

  // INIT
  makeSamplePosts();
  loadAndRender();
  setupAutosave();
  setupImageUpload();

})();
