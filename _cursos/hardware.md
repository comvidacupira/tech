---
layout: course
title: Curso de Hardware
course_name: Hardware
summary: Fundamentos de componentes, montagem e manutencao basica.
order: 1
image: /assets/images/hardware.jpg
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
  <p id="lesson-current" class="video-current">Reproduzindo: Aula 1 - Introducao ao hardware.</p>
</div>

<h3 class="gallery-title">Galeria de aulas</h3>
<hr class="gallery-divider" />

<div class="video-gallery" id="video-gallery">
  <button class="video-card js-video-card is-active" type="button" data-video-id="IldPMbfLb1E" data-title="Aula 1" data-description="Introducao ao hardware.">
    <img src="https://img.youtube.com/vi/IldPMbfLb1E/hqdefault.jpg" alt="Aula 1 - Introducao ao hardware" />
    <h3>Aula 1</h3>
    <p>Introducao ao hardware.</p>
  </button>

  <button class="video-card js-video-card" type="button" data-video-id="IldPMbfLb1E" data-title="Aula 2" data-description="Componentes principais do computador.">
    <img src="https://img.youtube.com/vi/IldPMbfLb1E/hqdefault.jpg" alt="Aula 2 - Componentes principais" />
    <h3>Aula 2</h3>
    <p>Componentes principais do computador.</p>
  </button>

  <button class="video-card js-video-card" type="button" data-video-id="IldPMbfLb1E" data-title="Aula 3" data-description="Placa-mae, processador e memoria RAM.">
    <img src="https://img.youtube.com/vi/IldPMbfLb1E/hqdefault.jpg" alt="Aula 3 - Placa-mae, processador e memoria RAM" />
    <h3>Aula 3</h3>
    <p>Placa-mae, processador e memoria RAM.</p>
  </button>

  <button class="video-card js-video-card" type="button" data-video-id="IldPMbfLb1E" data-title="Aula 4" data-description="Armazenamento HD e SSD.">
    <img src="https://img.youtube.com/vi/IldPMbfLb1E/hqdefault.jpg" alt="Aula 4 - Armazenamento HD e SSD" />
    <h3>Aula 4</h3>
    <p>Armazenamento HD e SSD.</p>
  </button>

  <button class="video-card js-video-card" type="button" data-video-id="IldPMbfLb1E" data-title="Aula 5" data-description="Fontes de alimentacao e gabinete.">
    <img src="https://img.youtube.com/vi/IldPMbfLb1E/hqdefault.jpg" alt="Aula 5 - Fontes de alimentacao e gabinete" />
    <h3>Aula 5</h3>
    <p>Fontes de alimentacao e gabinete.</p>
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
