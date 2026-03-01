(function () {
  const playerFrame = document.querySelector(".video-player-frame");
  const current = document.getElementById("lesson-current");
  const cards = Array.from(document.querySelectorAll(".js-video-card"));
  const courseList = document.getElementById("course-list");

  if (!cards.length) return;

  function getYouTubeId(url) {
    if (!url) return "";

    const shortMatch = url.match(/youtu\.be\/([^?&/]+)/i);
    if (shortMatch && shortMatch[1]) return shortMatch[1];

    const embedMatch = url.match(/youtube\.com\/embed\/([^?&/]+)/i);
    if (embedMatch && embedMatch[1]) return embedMatch[1];

    const watchMatch = url.match(/[?&]v=([^?&/]+)/i);
    if (watchMatch && watchMatch[1]) return watchMatch[1];

    return "";
  }

  function toGooglePreview(url) {
    if (!url) return "";

    const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
    if (fileMatch && fileMatch[1]) {
      return "https://drive.google.com/file/d/" + fileMatch[1] + "/preview";
    }

    const docMatch = url.match(/docs\.google\.com\/document\/d\/([^/]+)/i);
    if (docMatch && docMatch[1]) {
      return "https://docs.google.com/document/d/" + docMatch[1] + "/preview";
    }

    const sheetMatch = url.match(/docs\.google\.com\/spreadsheets\/d\/([^/]+)/i);
    if (sheetMatch && sheetMatch[1]) {
      return "https://docs.google.com/spreadsheets/d/" + sheetMatch[1] + "/preview";
    }

    const slidesMatch = url.match(/docs\.google\.com\/presentation\/d\/([^/]+)/i);
    if (slidesMatch && slidesMatch[1]) {
      return "https://docs.google.com/presentation/d/" + slidesMatch[1] + "/embed?start=false&loop=false&delayms=3000";
    }

    return url;
  }

  function getCardData(card) {
    const title = card.dataset.title || "Aula";
    const description = card.dataset.description || "";
    const resourceUrl = card.dataset.resourceUrl || "";
    const videoId = card.dataset.videoId || "";
    const videoUrl = card.dataset.videoUrl || "";
    const rawType = (card.dataset.resourceType || "").toLowerCase();
    let type = rawType;

    if (!type) {
      type = videoId || videoUrl ? "youtube" : "link";
    }

    return {
      title: title,
      description: description,
      type: type,
      resourceUrl: resourceUrl,
      videoId: videoId,
      videoUrl: videoUrl
    };
  }

  function renderYouTube(data) {
    const videoId = data.videoId || getYouTubeId(data.videoUrl) || getYouTubeId(data.resourceUrl);
    if (!videoId) return false;

    playerFrame.innerHTML =
      '<iframe id="lesson-player" src="https://www.youtube.com/embed/' +
      videoId +
      '?autoplay=1" title="Player da aula" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>';
    return true;
  }

  function renderEmbed(data) {
    if (!data.resourceUrl) return false;
    const embedUrl = toGooglePreview(data.resourceUrl);

    playerFrame.innerHTML =
      '<iframe id="lesson-player" src="' +
      embedUrl +
      '" title="Visualizador de recurso" allow="autoplay; clipboard-write" allowfullscreen></iframe>';
    return true;
  }

  function renderLink(data) {
    if (!data.resourceUrl) return false;

    playerFrame.innerHTML =
      '<div class="resource-link-box"><p>Este recurso abre em nova aba.</p><a class="resource-link-btn" href="' +
      data.resourceUrl +
      '" target="_blank" rel="noopener noreferrer">Abrir recurso</a></div>';
    return true;
  }

  function renderFromCard(card) {
    const data = getCardData(card);
    let rendered = false;

    if (data.type === "youtube") {
      rendered = renderYouTube(data);
    } else if (
      data.type === "embed" ||
      data.type === "drive" ||
      data.type === "slides" ||
      data.type === "document"
    ) {
      rendered = renderEmbed(data);
    } else {
      rendered = renderLink(data);
    }

    if (!rendered) {
      playerFrame.innerHTML = '<div class="resource-link-box"><p>Recurso indisponivel.</p></div>';
    }

    current.textContent = "Selecionado: " + data.title + " - " + data.description;

    cards.forEach(function (c) {
      c.classList.remove("is-active");
    });
    card.classList.add("is-active");
  }

  function buildCourseListFromCards() {
    if (!courseList) return;
    courseList.innerHTML = "";

    cards.forEach(function (card) {
      const data = getCardData(card);
      const item = document.createElement("li");
      const strong = document.createElement("strong");
      const detail = document.createElement("span");

      strong.textContent = data.title;
      detail.textContent = " - " + data.description + " [" + data.type + "]";

      item.appendChild(strong);
      item.appendChild(detail);
      courseList.appendChild(item);
    });
  }

  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      renderFromCard(card);
    });
  });

  const initialCard = cards.find(function (card) {
    return card.classList.contains("is-active");
  }) || cards[0];

  renderFromCard(initialCard);
  buildCourseListFromCards();
})();
