---
layout: course
title: Curso de Internet
course_name: Internet
summary: Navegacao segura, pesquisa eficiente e ferramentas online.
order: 4
image: /assets/images/internet.jpg
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
  <p id="lesson-current" class="video-current">Reproduzindo: Aula 1 - O que e internet.</p>
</div>

<h3 class="gallery-title">Galeria de aulas</h3>
<hr class="gallery-divider" />

<div class="video-gallery" id="video-gallery">
  <button class="video-card js-video-card is-active" type="button" data-video-id="IldPMbfLb1E" data-title="Aula 1" data-description="O que e internet e como funciona.">
    <img src="https://img.youtube.com/vi/IldPMbfLb1E/hqdefault.jpg" alt="Aula 1 - O que e internet" />
    <h3>Aula 1</h3>
    <p>O que e internet e como funciona.</p>
  </button>

  <button class="video-card js-video-card" type="button" data-video-id="IldPMbfLb1E" data-title="Aula 2" data-description="Navegadores e abas no dia a dia.">
    <img src="https://img.youtube.com/vi/IldPMbfLb1E/hqdefault.jpg" alt="Aula 2 - Navegadores e abas" />
    <h3>Aula 2</h3>
    <p>Navegadores e abas no dia a dia.</p>
  </button>

  <button class="video-card js-video-card" type="button" data-video-id="IldPMbfLb1E" data-title="Aula 3" data-description="Pesquisa eficiente no Google.">
    <img src="https://img.youtube.com/vi/IldPMbfLb1E/hqdefault.jpg" alt="Aula 3 - Pesquisa eficiente" />
    <h3>Aula 3</h3>
    <p>Pesquisa eficiente no Google.</p>
  </button>

  <button class="video-card js-video-card" type="button" data-video-id="IldPMbfLb1E" data-title="Aula 4" data-description="Criacao e uso de email.">
    <img src="https://img.youtube.com/vi/IldPMbfLb1E/hqdefault.jpg" alt="Aula 4 - Criacao e uso de email" />
    <h3>Aula 4</h3>
    <p>Criacao e uso de email.</p>
  </button>

  <button class="video-card js-video-card" type="button" data-video-id="IldPMbfLb1E" data-title="Aula 5" data-description="Seguranca digital e golpes comuns.">
    <img src="https://img.youtube.com/vi/IldPMbfLb1E/hqdefault.jpg" alt="Aula 5 - Seguranca digital" />
    <h3>Aula 5</h3>
    <p>Seguranca digital e golpes comuns.</p>
  </button>
</div>

<script>
  (function () {
    const player = document.getElementById("lesson-player");
    const current = document.getElementById("lesson-current");
    const cards = document.querySelectorAll(".js-video-card");
    const courseList = document.getElementById("course-list");

    function buildCourseListFromCards() {
      if (!courseList) return;
      courseList.innerHTML = "";

      cards.forEach(function (card) {
        const title = card.dataset.title || "Aula";
        const description = card.dataset.description || "";

        const item = document.createElement("li");
        item.innerHTML = "<strong>" + title + "</strong> - " + description;
        courseList.appendChild(item);
      });
    }

    function playFromCard(card) {
      const videoId = card.dataset.videoId;
      const title = card.dataset.title;
      const description = card.dataset.description;

      player.src = "https://www.youtube.com/embed/" + videoId + "?autoplay=1";
      current.textContent = "Reproduzindo: " + title + " - " + description;

      cards.forEach(function (c) {
        c.classList.remove("is-active");
      });
      card.classList.add("is-active");
    }

    cards.forEach(function (card) {
      card.addEventListener("click", function () {
        playFromCard(card);
      });
    });

    buildCourseListFromCards();
  })();
</script>
