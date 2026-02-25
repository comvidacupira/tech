---
layout: course
title: Curso de Word
course_name: Word
summary: Criacao e formatacao de documentos para estudo e trabalho.
order: 3
image: /assets/images/word.jpg
---

## Aulas

<details class="list-box" open>
  <summary>Ver/ocultar lista de aulas</summary>

  <ul id="course-list" class="course-list"></ul>
</details>

## Voce esta assistindo a aula:

<div class="video-player-box">
  <div class="video-player-frame">
    <iframe
      id="lesson-player"
      src="https://www.youtube.com/embed/IldPMbfLb1E"
      title="Player da aula"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen>
    </iframe>
  </div>
  <p id="lesson-current" class="video-current">Reproduzindo: Aula 1 - Introducao ao Word.</p>
</div>

<h3 class="gallery-title">Galeria de aulas</h3>
<hr class="gallery-divider" />

<div class="video-gallery" id="video-gallery">
  <button class="video-card js-video-card is-active" type="button" data-video-id="IldPMbfLb1E" data-title="Aula 1" data-description="Introducao ao Word." data-enabled="true">
    <img src="https://img.youtube.com/vi/IldPMbfLb1E/hqdefault.jpg" alt="Aula 1 - Introducao ao Word" />
    <h3>Aula 1</h3>
    <p>Introducao ao Word.</p>
  </button>

  <button class="video-card js-video-card" type="button" data-video-id="IldPMbfLb1E" data-title="Aula 2" data-description="Interface e barra de ferramentas." data-enabled="true">
    <img src="https://img.youtube.com/vi/IldPMbfLb1E/hqdefault.jpg" alt="Aula 2 - Interface e barra de ferramentas" />
    <h3>Aula 2</h3>
    <p>Interface e barra de ferramentas.</p>
  </button>

  <button class="video-card js-video-card" type="button" data-video-id="IldPMbfLb1E" data-title="Aula 3" data-description="Formatacao de texto e paragrafos." data-enabled="true">
    <img src="https://img.youtube.com/vi/IldPMbfLb1E/hqdefault.jpg" alt="Aula 3 - Formatacao de texto e paragrafos" />
    <h3>Aula 3</h3>
    <p>Formatacao de texto e paragrafos.</p>
  </button>

  <button class="video-card js-video-card" type="button" data-video-id="IldPMbfLb1E" data-title="Aula 4" data-description="Insercao de imagens e tabelas." data-enabled="true">
    <img src="https://img.youtube.com/vi/IldPMbfLb1E/hqdefault.jpg" alt="Aula 4 - Insercao de imagens e tabelas" />
    <h3>Aula 4</h3>
    <p>Insercao de imagens e tabelas.</p>
  </button>

  <button class="video-card js-video-card" type="button" data-video-id="IldPMbfLb1E" data-title="Aula 5" data-description="Cabecalho, rodape e revisao final." data-enabled="true">
    <img src="https://img.youtube.com/vi/IldPMbfLb1E/hqdefault.jpg" alt="Aula 5 - Cabecalho, rodape e revisao final" />
    <h3>Aula 5</h3>
    <p>Cabecalho, rodape e revisao final.</p>
  </button>
</div>

<script>
  (function () {
    const player = document.getElementById("lesson-player");
    const current = document.getElementById("lesson-current");
    const allCards = Array.from(document.querySelectorAll(".js-video-card"));
    const courseList = document.getElementById("course-list");
    const courseSlug = window.location.pathname.split("/").filter(Boolean).pop() || "";
    const apiBase = String(window.PUBLIC_DATABASE_URL || "").replace(/\/$/, "");
    let isAdminMode = false;
    let currentAdminUserId = null;
    let adminNoteEl = null;
    let syncNoteEl = null;
    const adminToggleByCard = new Map();

    function cardId(card, index) {
      const raw = (card.dataset.title || "aula-" + (index + 1)).toLowerCase().trim();
      return raw.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    }

    function readEnabled(card) {
      return card.dataset.enabled !== "false";
    }

    async function writeEnabled(card, index, enabled) {
      if (!apiBase || !courseSlug) return;

      const response = await fetch(apiBase + "/api/lessons/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          course: courseSlug,
          lessonId: cardId(card, index),
          enabled: enabled,
          updatedBy: currentAdminUserId
        })
      });

      if (!response.ok) {
        throw new Error("Nao foi possivel salvar no banco.");
      }

      clearSyncIssue();
    }

    const enabledByCard = new Map();

    function applyCardState(card, enabled) {
      card.dataset.enabled = String(enabled);
      card.classList.toggle("is-disabled", !enabled);
      card.classList.toggle("is-admin-mode", isAdminMode);
      card.setAttribute("aria-disabled", String(!enabled));
      card.setAttribute("tabindex", enabled ? "0" : "-1");
    }

    allCards.forEach(function (card) {
      const enabled = readEnabled(card);
      enabledByCard.set(card, enabled);
      applyCardState(card, enabled);
    });

    async function loadStatusesFromApi() {
      if (!apiBase || !courseSlug) return;

      const response = await fetch(apiBase + "/api/lessons/status?course=" + encodeURIComponent(courseSlug));
      if (!response.ok) {
        showSyncIssue("Falha ao ler status no banco (API/Turso indisponivel).");
        return;
      }

      const payload = await response.json();
      if (!payload || !Array.isArray(payload.lessons)) return;

      const enabledByLessonId = new Map();
      payload.lessons.forEach(function (lesson) {
        enabledByLessonId.set(String(lesson.lessonId), Boolean(lesson.enabled));
      });

      allCards.forEach(function (card, index) {
        const lessonId = cardId(card, index);
        if (!enabledByLessonId.has(lessonId)) return;
        const enabled = enabledByLessonId.get(lessonId);
        enabledByCard.set(card, enabled);
        applyCardState(card, enabled);
        const toggle = adminToggleByCard.get(card);
        if (toggle) {
          toggle.textContent = enabled ? "Desativar" : "Ativar";
          toggle.setAttribute("aria-pressed", String(!enabled));
        }
      });

      buildCourseListFromCards();
      ensureSelectedPlayable();
      clearSyncIssue();
    }

    function getEnabledCards() {
      return allCards.filter(function (card) {
        return enabledByCard.get(card);
      });
    }

    function buildCourseListFromCards() {
      if (!courseList) return;
      courseList.innerHTML = "";

      allCards.forEach(function (card) {
        const title = card.dataset.title || "Aula";
        const description = card.dataset.description || "";
        const enabled = enabledByCard.get(card);

        const item = document.createElement("li");
        const strong = document.createElement("strong");
        strong.textContent = title;
        item.appendChild(strong);
        item.appendChild(document.createTextNode(" - " + description));

        if (!enabled) {
          item.appendChild(document.createTextNode(" (desativada)"));
        }

        courseList.appendChild(item);
      });
    }

    function playFromCard(card, autoplay) {
      if (!enabledByCard.get(card)) return false;

      const videoId = card.dataset.videoId;
      const title = card.dataset.title;
      const description = card.dataset.description;

      player.src = "https://www.youtube.com/embed/" + videoId + (autoplay ? "?autoplay=1" : "");
      current.textContent = "Reproduzindo: " + title + " - " + description;

      allCards.forEach(function (c) {
        c.classList.remove("is-active");
      });
      card.classList.add("is-active");
      return true;
    }

    function ensureSelectedPlayable() {
      const selected = allCards.find(function (card) {
        return card.classList.contains("is-active");
      });
      const enabledCards = getEnabledCards();

      if (selected && enabledByCard.get(selected)) {
        return;
      }

      if (enabledCards.length > 0) {
        playFromCard(enabledCards[0], false);
        return;
      }

      allCards.forEach(function (card) {
        card.classList.remove("is-active");
      });
      player.src = "";
      current.textContent = "Nenhuma aula ativa no momento.";
    }

    function makeAdminToggle(card, index) {
      const adminToggle = document.createElement("span");
      adminToggle.className = "admin-toggle";
      adminToggle.setAttribute("role", "button");
      adminToggle.setAttribute("tabindex", "0");
      adminToggle.textContent = enabledByCard.get(card) ? "Desativar" : "Ativar";
      adminToggle.setAttribute("aria-pressed", String(!enabledByCard.get(card)));

      function onToggle(event) {
        event.stopPropagation();
        event.preventDefault();
        const previousEnabled = enabledByCard.get(card);
        const nextEnabled = !enabledByCard.get(card);
        enabledByCard.set(card, nextEnabled);
        applyCardState(card, nextEnabled);
        adminToggle.textContent = nextEnabled ? "Desativar" : "Ativar";
        adminToggle.setAttribute("aria-pressed", String(!nextEnabled));
        buildCourseListFromCards();
        ensureSelectedPlayable();
        writeEnabled(card, index, nextEnabled).catch(function () {
          showSyncIssue("Falha ao salvar no banco. Verifique API local e credenciais do Turso.");
          enabledByCard.set(card, previousEnabled);
          applyCardState(card, previousEnabled);
          adminToggle.textContent = previousEnabled ? "Desativar" : "Ativar";
          adminToggle.setAttribute("aria-pressed", String(!previousEnabled));
          buildCourseListFromCards();
          ensureSelectedPlayable();
        });
      }

      adminToggle.addEventListener("click", onToggle);
      adminToggle.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          onToggle(event);
        }
      });
      return adminToggle;
    }

    function renderAdminNote() {
      if (!isAdminMode) {
        if (adminNoteEl) {
          adminNoteEl.remove();
          adminNoteEl = null;
        }
        return;
      }

      if (adminNoteEl) return;

      const title = document.querySelector(".gallery-title");
      if (!title) return;

      adminNoteEl = document.createElement("p");
      adminNoteEl.className = "admin-mode-note";
      adminNoteEl.textContent = "Modo admin ativo: use o botao em cada aula para ativar ou desativar.";
      title.insertAdjacentElement("afterend", adminNoteEl);
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

    function setAdminMode(nextMode) {
      isAdminMode = Boolean(nextMode);

      allCards.forEach(function (card, index) {
        applyCardState(card, enabledByCard.get(card));
        const existingToggle = adminToggleByCard.get(card);

        if (isAdminMode) {
          if (!existingToggle) {
            const toggle = makeAdminToggle(card, index);
            adminToggleByCard.set(card, toggle);
            card.appendChild(toggle);
          }
          return;
        }

        if (existingToggle) {
          existingToggle.remove();
          adminToggleByCard.delete(card);
        }
      });

      renderAdminNote();
    }

    allCards.forEach(function (card) {
      card.addEventListener("click", function (event) {
        if (event.target.closest(".admin-toggle")) return;
        if (!enabledByCard.get(card)) return;
        playFromCard(card, true);
      });
      card.addEventListener("keydown", function (event) {
        if (event.key !== "Enter" && event.key !== " ") return;
        if (!enabledByCard.get(card)) return;
        event.preventDefault();
        playFromCard(card, true);
      });
    });

    buildCourseListFromCards();
    ensureSelectedPlayable();
    loadStatusesFromApi();

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
  })();
</script>
