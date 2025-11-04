document.addEventListener("DOMContentLoaded", () => {
  const titleInput = document.getElementById("postTitle");
  const poemInput = document.getElementById("poemInput");
  const privacyCheck = document.getElementById("privacyCheck");
  const bgUpload = document.getElementById("bgUpload");
  const saveBtn = document.getElementById("savePoem");
  const clearBtn = document.getElementById("clearPoem");
  const feedList = document.getElementById("feedList");

  const modal = document.getElementById("poemModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalAuthor = document.getElementById("modalAuthor");
  const modalContent = document.getElementById("modalContent");
  const modalClose = modal.querySelector(".close");

  let bgImage = null;

  function getUser() {
    return localStorage.getItem("writerName") || "Guest";
  }

  function loadPosts() {
    return JSON.parse(localStorage.getItem("poems")) || [];
  }

  function savePosts(posts) {
    localStorage.setItem("poems", JSON.stringify(posts));
  }

  function renderFeed() {
    feedList.innerHTML = "";
    const posts = loadPosts().filter(p => !p.private);
    posts.reverse().forEach(post => {
      const card = document.createElement("div");
      card.className = "post-card";
      if (post.bg) {
        const bg = document.createElement("div");
        bg.className = "post-bg";
        bg.style.backgroundImage = `url(${post.bg})`;
        card.appendChild(bg);
      }
      const info = document.createElement("div");
      info.className = "post-info";
      info.innerHTML = `
        <div class="post-title">${post.title || "Untitled"}</div>
        <div class="post-author">by ${post.author}</div>
        <div class="post-content">${post.content.slice(0, 200)}...</div>
      `;
      card.appendChild(info);
      card.addEventListener("click", () => openModal(post));
      feedList.appendChild(card);
    });
  }

  function openModal(post) {
    modalTitle.textContent = post.title || "Untitled";
    modalAuthor.textContent = "by " + (post.author || "Unknown");
    modalContent.textContent = post.content || "";
    modal.style.display = "flex";

    document.getElementById("downloadBtn").onclick = () => downloadPoem(post);
    document.getElementById("shareBtn").onclick = () =>
      navigator.clipboard.writeText(window.location.href + "#" + post.title);
  }

  function downloadPoem(post) {
    const blob = new Blob(
      [`${post.title}\n\n${post.content}\n\n— ${post.author}`],
      { type: "text/plain" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${post.title || "poem"}.txt`;
    a.click();
  }

  modalClose.onclick = () => (modal.style.display = "none");
  window.onclick = e => {
    if (e.target === modal) modal.style.display = "none";
  };

  saveBtn.addEventListener("click", () => {
    const title = titleInput.value.trim();
    const content = poemInput.value.trim();
    if (!content) return alert("Write something first!");
    const posts = loadPosts();
    const newPost = {
      id: Date.now(),
      title,
      content,
      author: getUser(),
      private: privacyCheck.checked,
      bg: bgImage,
    };
    posts.push(newPost);
    savePosts(posts);
    titleInput.value = "";
    poemInput.value = "";
    bgImage = null;
    renderFeed();
  });

  clearBtn.addEventListener("click", () => {
    titleInput.value = "";
    poemInput.value = "";
  });

  bgUpload.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => (bgImage = reader.result);
    reader.readAsDataURL(file);
  });

  renderFeed();
});
