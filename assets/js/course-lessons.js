(function () {
  function init() {
    const root = document.querySelector(".course-page[data-course-slug]");
    if (!root) return;

    const courseSlug = String(root.dataset.courseSlug || "").trim();
    const apiBase = String(window.PUBLIC_DATABASE_URL || "").replace(/\/$/, "");
    const player = document.getElementById("lesson-player");
    const current = document.getElementById("lesson-current");
    const courseList = document.getElementById("course-list");
    const gallery = document.getElementById("video-gallery");

    let lessons = [];
    let isAdminMode = false;
    let currentAdminUserId = null;
    let adminNoteEl = null;
    let syncNoteEl = null;

    function toThumbnail(lesson) {
      if (lesson.thumbnailUrl) return lesson.thumbnailUrl;
      return "https://img.youtube.com/vi/" + lesson.videoId + "/hqdefault.jpg";
    }

    function showSyncIssue(message) {
      const title = document.querySelector(".gallery-title");
      if (!title) return;
      if (!syncNoteEl) {
        syncNoteEl = document.createElement("p");
        syncNoteEl.className = "admin-sync-note";
        title.insertAdjacentElement("afterend", syncNoteEl);
      }
      syncNoteEl.textContent = message;
    }

    function clearSyncIssue() {
      if (!syncNoteEl) return;
      syncNoteEl.remove();
      syncNoteEl = null;
    }

    function renderAdminNote() {
      const title = document.querySelector(".gallery-title");
      if (!title) return;

    if (!isAdminMode) {
      if (adminNoteEl) {
        adminNoteEl.remove();
        adminNoteEl = null;
      }
      return;
    }

    if (adminNoteEl) return;
    adminNoteEl = document.createElement("p");
    adminNoteEl.className = "admin-mode-note";
    adminNoteEl.textContent = "Modo admin ativo: use o botao em cada aula para ativar ou desativar.";
    title.insertAdjacentElement("afterend", adminNoteEl);
    }

    function buildCourseList() {
    if (!courseList) return;
    courseList.innerHTML = "";

    lessons.forEach(function (lesson) {
      const item = document.createElement("li");
      const strong = document.createElement("strong");
      strong.textContent = lesson.title;
      item.appendChild(strong);
      item.appendChild(document.createTextNode(" - " + lesson.description));
      if (!lesson.enabled) {
        item.appendChild(document.createTextNode(" (desativada)"));
      }
      courseList.appendChild(item);
    });
    }

    function playableLessons() {
    return lessons.filter(function (lesson) {
      return lesson.enabled;
    });
    }

    function setCurrentText(text) {
      if (current) current.textContent = text;
    }

    function playLesson(lesson, autoplay) {
    if (!lesson.enabled) return false;
    if (!player) return false;

    player.src = "https://www.youtube.com/embed/" + lesson.videoId + (autoplay ? "?autoplay=1" : "");
    setCurrentText("Reproduzindo: " + lesson.title + " - " + lesson.description);

    const cards = gallery ? Array.from(gallery.querySelectorAll(".js-video-card")) : [];
    cards.forEach(function (card) {
      card.classList.toggle("is-active", card.dataset.lessonId === lesson.lessonId);
    });
    return true;
    }

    function ensureSelectedPlayable() {
    if (!gallery) return;
    const selectedCard = gallery.querySelector(".js-video-card.is-active");
    if (selectedCard) {
      const lesson = lessons.find(function (item) {
        return item.lessonId === selectedCard.dataset.lessonId;
      });
      if (lesson && lesson.enabled) {
        return;
      }
    }

    const enabled = playableLessons();
    if (enabled.length === 0) {
      if (player) player.src = "";
      setCurrentText("Nenhuma aula ativa no momento.");
      return;
    }

    playLesson(enabled[0], false);
    }

    async function writeEnabled(lessonId, enabled) {
    if (!apiBase || !courseSlug) return;
    const response = await fetch(apiBase + "/api/lessons/status", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        course: courseSlug,
        lessonId: lessonId,
        enabled: enabled,
        updatedBy: currentAdminUserId
      })
    });

    if (!response.ok) {
      throw new Error("Nao foi possivel salvar no banco.");
    }

    clearSyncIssue();
    }

    function renderGallery() {
    if (!gallery) return;
    gallery.innerHTML = "";

    if (lessons.length === 0) {
      const empty = document.createElement("p");
      empty.className = "summary";
      empty.textContent = "Nenhuma aula cadastrada para este curso.";
      gallery.appendChild(empty);
      if (player) player.src = "";
      setCurrentText("Nenhuma aula ativa no momento.");
      return;
    }

    lessons.forEach(function (lesson, index) {
      const card = document.createElement("button");
      card.className = "video-card js-video-card";
      card.type = "button";
      card.dataset.lessonId = lesson.lessonId;
      card.dataset.title = lesson.title;
      card.dataset.description = lesson.description;
      card.dataset.videoId = lesson.videoId;
      card.dataset.enabled = String(lesson.enabled);
      card.setAttribute("aria-disabled", String(!lesson.enabled));
      card.setAttribute("tabindex", lesson.enabled ? "0" : "-1");
      card.classList.toggle("is-disabled", !lesson.enabled);
      card.classList.toggle("is-admin-mode", isAdminMode);

      const image = document.createElement("img");
      image.src = toThumbnail(lesson);
      image.alt = lesson.title + " - " + lesson.description;
      card.appendChild(image);

      const title = document.createElement("h3");
      title.textContent = lesson.title;
      card.appendChild(title);

      const description = document.createElement("p");
      description.textContent = lesson.description;
      card.appendChild(description);

      function toggleEnabled(event) {
        event.stopPropagation();
        event.preventDefault();
        const previous = lesson.enabled;
        lesson.enabled = !lesson.enabled;
        renderGallery();
        buildCourseList();
        ensureSelectedPlayable();
        writeEnabled(lesson.lessonId, lesson.enabled).catch(function () {
          lesson.enabled = previous;
          renderGallery();
          buildCourseList();
          ensureSelectedPlayable();
          showSyncIssue("Falha ao salvar no banco. Verifique API local e credenciais do Turso.");
        });
      }

      if (isAdminMode) {
        const toggle = document.createElement("span");
        toggle.className = "admin-toggle";
        toggle.setAttribute("role", "button");
        toggle.setAttribute("tabindex", "0");
        toggle.setAttribute("aria-pressed", String(!lesson.enabled));
        toggle.textContent = lesson.enabled ? "Desativar" : "Ativar";
        toggle.addEventListener("click", toggleEnabled);
        toggle.addEventListener("keydown", function (event) {
          if (event.key === "Enter" || event.key === " ") {
            toggleEnabled(event);
          }
        });
        card.appendChild(toggle);
      }

      card.addEventListener("click", function (event) {
        if (event.target.closest(".admin-toggle")) return;
        if (!lesson.enabled) return;
        playLesson(lesson, true);
      });

      card.addEventListener("keydown", function (event) {
        if (event.key !== "Enter" && event.key !== " ") return;
        if (!lesson.enabled) return;
        event.preventDefault();
        playLesson(lesson, true);
      });

      if (index === 0) {
        card.classList.add("is-active");
      }

      gallery.appendChild(card);
    });
    }

    function setAdminMode(nextMode) {
      isAdminMode = Boolean(nextMode);
      renderAdminNote();
      renderGallery();
      ensureSelectedPlayable();
    }

    async function loadLessonsFromApi() {
      if (!apiBase || !courseSlug) {
        setCurrentText("API de aulas nao configurada.");
        return;
      }

    const response = await fetch(apiBase + "/api/courses/" + encodeURIComponent(courseSlug) + "/lessons");
    if (!response.ok) {
      showSyncIssue("Falha ao ler aulas no banco (API/Turso indisponivel).");
      setCurrentText("Nao foi possivel carregar aulas.");
      return;
    }

    const payload = await response.json();
    lessons = Array.isArray(payload.lessons) ? payload.lessons : [];
    renderGallery();
    buildCourseList();
    ensureSelectedPlayable();
    clearSyncIssue();
    }

    loadLessonsFromApi();

    if (window.cvAuth && window.cvAuth.ready) {
      window.cvAuth.ready.then(function (auth) {
        currentAdminUserId = auth && auth.user && auth.user.id ? String(auth.user.id) : null;
        setAdminMode(auth && auth.isSignedIn);
      });
    }

    window.addEventListener("cv-auth-ready", function (event) {
      const detail = event.detail || {};
      currentAdminUserId = detail && detail.user && detail.user.id ? String(detail.user.id) : null;
      setAdminMode(detail.isSignedIn);
    });
  }

  setTimeout(init, 0);
})();
