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
    let isAdminMode = false;
    let adminNoteEl = null;
    const adminToggleByCard = new Map();

    function cardId(card, index) {
      const raw = (card.dataset.title || "aula-" + (index + 1)).toLowerCase().trim();
      return raw.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    }

    function storageKey(card, index) {
      return "cv_lesson_enabled:" + window.location.pathname + ":" + cardId(card, index);
    }

    function readEnabled(card, index) {
      const saved = localStorage.getItem(storageKey(card, index));
      if (saved === "true") return true;
      if (saved === "false") return false;
      return card.dataset.enabled !== "false";
    }

    function writeEnabled(card, index, enabled) {
      localStorage.setItem(storageKey(card, index), String(enabled));
    }

    const enabledByCard = new Map();

    function applyCardState(card, enabled) {
      card.dataset.enabled = String(enabled);
      card.classList.toggle("is-disabled", !enabled);
      card.classList.toggle("is-admin-mode", isAdminMode);
      card.setAttribute("aria-disabled", String(!enabled));
    }

    allCards.forEach(function (card, index) {
      const enabled = readEnabled(card, index);
      enabledByCard.set(card, enabled);
      applyCardState(card, enabled);
    });

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
      const adminToggle = document.createElement("button");
      adminToggle.type = "button";
      adminToggle.className = "admin-toggle";
      adminToggle.textContent = enabledByCard.get(card) ? "Desativar" : "Ativar";
      adminToggle.addEventListener("click", function (event) {
        event.stopPropagation();
        const nextEnabled = !enabledByCard.get(card);
        enabledByCard.set(card, nextEnabled);
        applyCardState(card, nextEnabled);
        writeEnabled(card, index, nextEnabled);
        adminToggle.textContent = nextEnabled ? "Desativar" : "Ativar";
        buildCourseListFromCards();
        ensureSelectedPlayable();
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
    });

    buildCourseListFromCards();
    ensureSelectedPlayable();

    if (window.cvAuth && window.cvAuth.ready) {
      window.cvAuth.ready.then(function (auth) {
        setAdminMode(auth && auth.isSignedIn);
      });
    }

    window.addEventListener("cv-auth-ready", function (event) {
      const detail = event.detail || {};
      setAdminMode(detail.isSignedIn);
    });
  })();
</script>
