---
layout: course
title: Curso de Windows
course_name: Windows
summary: Uso do sistema, organizacao de arquivos e configuracoes essenciais.
order: 2
image: /assets/images/windows.jpg
---

## Aulas

1. Aula 01 - O que e Windows e como navegar no sistema.
2. Aula 02 - Como criar, mover e organizar pastas.
3. Aula 03 - Atalhos e configuracoes uteis para o dia a dia.

## Links sugeridos

- Aula 01: [Conhecendo o Windows e Interface Metro](https://www.youtube.com/watch?v=IldPMbfLb1E&list=PLQQLNsOZKaFsQwNXBLQ2o3D3VqjHIDRYn)
- Aula 02: [Adicionar link do video](https://www.youtube.com/)
- Aula 03: [Adicionar link do video](https://www.youtube.com/)

## Galeria de videos

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
  <p id="lesson-current" class="video-current">Reproduzindo: Aula 1 - Conhecendo o Windows.</p>
</div>

<div class="video-gallery" id="video-gallery">
  <button class="video-card js-video-card is-active" type="button" data-video-id="IldPMbfLb1E" data-title="Aula 1" data-description="Conhecendo o Windows.">
    <img src="https://img.youtube.com/vi/IldPMbfLb1E/hqdefault.jpg" alt="Aula 1 - Conhecendo o Windows" />
    <h3>Aula 1</h3>
    <p>Conhecendo o Windows.</p>
  </button>

  <button class="video-card js-video-card" type="button" data-video-id="IldPMbfLb1E" data-title="Aula 2" data-description="Explorando a area de trabalho.">
    <img src="https://img.youtube.com/vi/IldPMbfLb1E/hqdefault.jpg" alt="Aula 2 - Area de trabalho" />
    <h3>Aula 2</h3>
    <p>Explorando a area de trabalho.</p>
  </button>

  <button class="video-card js-video-card" type="button" data-video-id="IldPMbfLb1E" data-title="Aula 3" data-description="Como criar e organizar pastas.">
    <img src="https://img.youtube.com/vi/IldPMbfLb1E/hqdefault.jpg" alt="Aula 3 - Pastas e arquivos" />
    <h3>Aula 3</h3>
    <p>Como criar e organizar pastas.</p>
  </button>

  <button class="video-card js-video-card" type="button" data-video-id="IldPMbfLb1E" data-title="Aula 4" data-description="Configuracoes basicas do sistema.">
    <img src="https://img.youtube.com/vi/IldPMbfLb1E/hqdefault.jpg" alt="Aula 4 - Configuracoes basicas" />
    <h3>Aula 4</h3>
    <p>Configuracoes basicas do sistema.</p>
  </button>

  <button class="video-card js-video-card" type="button" data-video-id="IldPMbfLb1E" data-title="Aula 5" data-description="Atalhos uteis para produtividade.">
    <img src="https://img.youtube.com/vi/IldPMbfLb1E/hqdefault.jpg" alt="Aula 5 - Atalhos" />
    <h3>Aula 5</h3>
    <p>Atalhos uteis para produtividade.</p>
  </button>

  <button class="video-card js-video-card" type="button" data-video-id="IldPMbfLb1E" data-title="Aula 6" data-description="Usando o menu iniciar de forma pratica.">
    <img src="https://img.youtube.com/vi/IldPMbfLb1E/hqdefault.jpg" alt="Aula 6 - Menu iniciar" />
    <h3>Aula 6</h3>
    <p>Usando o menu iniciar de forma pratica.</p>
  </button>

  <button class="video-card js-video-card" type="button" data-video-id="IldPMbfLb1E" data-title="Aula 7" data-description="Pesquisa de apps, arquivos e configuracoes.">
    <img src="https://img.youtube.com/vi/IldPMbfLb1E/hqdefault.jpg" alt="Aula 7 - Pesquisa" />
    <h3>Aula 7</h3>
    <p>Pesquisa de apps, arquivos e configuracoes.</p>
  </button>

  <button class="video-card js-video-card" type="button" data-video-id="IldPMbfLb1E" data-title="Aula 8" data-description="Central de notificacoes e ajustes rapidos.">
    <img src="https://img.youtube.com/vi/IldPMbfLb1E/hqdefault.jpg" alt="Aula 8 - Central de notificacoes" />
    <h3>Aula 8</h3>
    <p>Central de notificacoes e ajustes rapidos.</p>
  </button>

  <button class="video-card js-video-card" type="button" data-video-id="IldPMbfLb1E" data-title="Aula 9" data-description="Personalizando tema e plano de fundo.">
    <img src="https://img.youtube.com/vi/IldPMbfLb1E/hqdefault.jpg" alt="Aula 9 - Personalizacao" />
    <h3>Aula 9</h3>
    <p>Personalizando tema e plano de fundo.</p>
  </button>

  <button class="video-card js-video-card" type="button" data-video-id="IldPMbfLb1E" data-title="Aula 10" data-description="Revisao dos principais recursos do Windows.">
    <img src="https://img.youtube.com/vi/IldPMbfLb1E/hqdefault.jpg" alt="Aula 10 - Revisao" />
    <h3>Aula 10</h3>
    <p>Revisao dos principais recursos do Windows.</p>
  </button>
</div>

<script>
  (function () {
    const player = document.getElementById("lesson-player");
    const current = document.getElementById("lesson-current");
    const cards = document.querySelectorAll(".js-video-card");

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
  })();
</script>
