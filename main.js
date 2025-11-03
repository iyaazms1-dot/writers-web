document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('savePoem');
  const clearBtn = document.getElementById('clearPoem');
  const input = document.getElementById('poemInput');
  const list = document.getElementById('poemList');
  const libraryList = document.getElementById('libraryList');

  const posts = JSON.parse(localStorage.getItem('posts')) || [];
  posts.forEach(renderPost);

  saveBtn?.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) return;

    const post = {
      id: Date.now(),
      text,
      author: localStorage.getItem('writerName') || 'Anonymous',
      private: document.getElementById('privacyCheck')?.checked || false,
      timestamp: new Date().toISOString(),
      comments: []
    };
    posts.push(post);
    localStorage.setItem('posts', JSON.stringify(posts));
    renderPost(post);
    input.value = '';
  });

  clearBtn?.addEventListener('click', () => input.value = '');

  function renderPost(post) {
    if (!list) return;
    const div = document.createElement('div');
    div.className = 'post-card';
    div.dataset.id = post.id;

    div.innerHTML = `
      <div class="post-meta">
        <div class="left"><span class="avatar">${post.author[0]}</span><strong>${post.author}</strong></div>
        <div>${new Date(post.timestamp).toLocaleString()}</div>
      </div>
      <div class="post-body">${post.text}</div>
      <div class="post-actions">
        <button class="action-btn comment-btn">Comment</button>
        <button class="action-btn share-btn">Share</button>
      </div>
    `;
    list.appendChild(div);

    // Comment
    div.querySelector('.comment-btn')?.addEventListener('click', () => {
      const comment = prompt('Add a comment:');
      if (!comment) return;
      post.comments.push(comment);
      localStorage.setItem('posts', JSON.stringify(posts));
      alert('Comment added!');
    });

    // Share
    div.querySelector('.share-btn')?.addEventListener('click', () => {
      const url = `${window.location.origin}${window.location.pathname}?post=${post.id}`;
      navigator.clipboard.writeText(url);
      alert('Post link copied!');
    });

    // Library
    if (!post.private && libraryList) {
      const libItem = document.createElement('div');
      libItem.className = 'lib-item';
      libItem.textContent = post.text;
      libraryList.appendChild(libItem);
    }
  }
});
