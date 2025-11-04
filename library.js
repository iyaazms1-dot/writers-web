document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("libraryContainer");
  const searchBar = document.getElementById("searchBar");

  if (!container) return; // Prevent null errors

  function loadPoems() {
    const savedPoems = JSON.parse(localStorage.getItem("poems")) || [];
    return savedPoems.filter(p => p.downloaded === true || p.owner === getUser());
  }

  function getUser() {
    return localStorage.getItem("writerName") || "Guest";
  }

  function refreshLibrary() {
    const poems = loadPoems();
    container.innerHTML = "";

    poems.forEach(poem => {
      const card = document.createElement("div");
      card.className = "lib-item";
      card.innerHTML = `
        <div>
          <strong>${poem.title || "Untitled"}</strong><br>
          <small>by ${poem.author || "Unknown"}</small>
        </div>
        <button class="btn-secondary" data-id="${poem.id}">Open</button>
      `;

      // safer alert (no nested template literal)
      card.querySelector("button").addEventListener("click", () => {
        alert(
          "\n" +
          (poem.title || "Untitled") +
          "\n\n" +
          (poem.content || "No content")
        );
      });

      container.appendChild(card);
    });
  }

  // Search filtering
  searchBar?.addEventListener("input", e => {
    const term = e.target.value.toLowerCase();
    const poems = loadPoems();
    container.innerHTML = "";

    const filtered = poems
      .filter(p => (p.title || "").toLowerCase().includes(term))
      .slice(0, 5);

    filtered.forEach(poem => {
      const card = document.createElement("div");
      card.className = "lib-item";
      card.innerHTML = `
        <div>
          <strong>${poem.title || "Untitled"}</strong><br>
          <small>by ${poem.author || "Unknown"}</small>
        </div>
        <button class="btn-secondary" data-id="${poem.id}">Open</button>
      `;

      card.querySelector("button").addEventListener("click", () => {
        alert(
          "\n" +
          (poem.title || "Untitled") +
          "\n\n" +
          (poem.content || "No content")
        );
      });

      container.appendChild(card);
    });
  });

  refreshLibrary();
});
