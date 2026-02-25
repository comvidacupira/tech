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
    const galleryTitle = document.querySelector(".gallery-title");

    let lessons = [];
    let isAdminMode = false;
    let currentUserRole = "viewer";
    let adminNoteEl = null;
    let syncNoteEl = null;
    let adminFormWrapEl = null;
    let adminFormStatusEl = null;
    let adminFormEl = null;
    let editingLessonId = null;

    function canManageLessons(role) {
      return role === "admin" || role === "editor";
    }

    async function getAuthToken() {
      if (!window.cvAuth || typeof window.cvAuth.getToken !== "function") {
        return null;
      }
      return await window.cvAuth.getToken();
    }

    async function getWriteHeaders() {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("Sessao expirada. Faca login novamente.");
      }
      return {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      };
    }

    function toThumbnail(lesson) {
      if (lesson.thumbnailUrl) return lesson.thumbnailUrl;
      return "https://img.youtube.com/vi/" + lesson.videoId + "/hqdefault.jpg";
    }

    function showSyncIssue(message) {
      if (!galleryTitle) return;
      if (!syncNoteEl) {
        syncNoteEl = document.createElement("p");
        syncNoteEl.className = "admin-sync-note";
        galleryTitle.insertAdjacentElement("afterend", syncNoteEl);
      }
      syncNoteEl.textContent = message;
    }

    function clearSyncIssue() {
      if (!syncNoteEl) return;
      syncNoteEl.remove();
      syncNoteEl = null;
    }

    async function resolveUserRoleFromApi() {
      const token = await getAuthToken();
      if (!token) return "viewer";

      const response = await fetch(apiBase + "/api/auth/me", {
        headers: { Authorization: "Bearer " + token },
      });

      if (response.status === 401) return "viewer";
      if (!response.ok) {
        throw new Error("Falha ao validar permissao do usuario.");
      }

      const payload = await response.json();
      return String(payload.role || "viewer").toLowerCase();
    }

    function renderAdminNote() {
      if (!galleryTitle) return;

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
      adminNoteEl.textContent = "Permissao " + currentUserRole + ": voce pode gerenciar aulas.";
      galleryTitle.insertAdjacentElement("afterend", adminNoteEl);
    }

    function buildCourseList() {
      if (!courseList) return;
      courseList.innerHTML = "";

      const listLessons = isAdminMode
        ? lessons
        : lessons.filter(function (lesson) {
            return lesson.enabled;
          });

      listLessons.forEach(function (lesson) {
        const item = document.createElement("li");
        const strong = document.createElement("strong");
        strong.textContent = lesson.title;
        item.appendChild(strong);
        item.appendChild(document.createTextNode(" - " + lesson.description));
        if (isAdminMode && !lesson.enabled) {
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

      player.src =
        "https://www.youtube.com/embed/" +
        lesson.videoId +
        (autoplay ? "?autoplay=1" : "");
      setCurrentText("Reproduzindo: " + lesson.title + " - " + lesson.description);

      const cards = gallery
        ? Array.from(gallery.querySelectorAll(".js-video-card"))
        : [];
      cards.forEach(function (card) {
        card.classList.toggle(
          "is-active",
          card.dataset.lessonId === lesson.lessonId,
        );
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
      const headers = await getWriteHeaders();
      const response = await fetch(apiBase + "/api/lessons/status", {
        method: "PUT",
        headers: headers,
        body: JSON.stringify({
          course: courseSlug,
          lessonId: lessonId,
          enabled: enabled,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error("Sem permissao para alterar aulas.");
      }

      if (!response.ok) {
        throw new Error("Nao foi possivel salvar no banco.");
      }

      clearSyncIssue();
    }

    async function createLesson(payload) {
      if (!apiBase || !courseSlug) {
        throw new Error("API nao configurada.");
      }
      const headers = await getWriteHeaders();

      const response = await fetch(
        apiBase + "/api/courses/" + encodeURIComponent(courseSlug) + "/lessons",
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify(payload),
        },
      );

      if (response.status === 401 || response.status === 403) {
        throw new Error("Sem permissao para cadastrar aulas.");
      }

      if (response.status === 409) {
        throw new Error("Conflito de aula: ajuste titulo ou posicao.");
      }

      if (!response.ok) {
        throw new Error("Nao foi possivel cadastrar aula.");
      }

      const payloadResponse = await response.json();
      return payloadResponse.lesson || null;
    }

    async function updateLesson(lessonId, payload) {
      if (!apiBase || !courseSlug) {
        throw new Error("API nao configurada.");
      }
      const headers = await getWriteHeaders();

      const response = await fetch(
        apiBase +
          "/api/courses/" +
          encodeURIComponent(courseSlug) +
          "/lessons/" +
          encodeURIComponent(lessonId),
        {
          method: "PUT",
          headers: headers,
          body: JSON.stringify(payload),
        },
      );

      if (response.status === 401 || response.status === 403) {
        throw new Error("Sem permissao para editar aulas.");
      }

      if (response.status === 409) {
        throw new Error("Conflito de aula: ajuste titulo ou posicao.");
      }

      if (response.status === 404) {
        throw new Error("Aula nao encontrada para edicao.");
      }

      if (!response.ok) {
        throw new Error("Nao foi possivel editar aula.");
      }
    }

    async function deleteLesson(lessonId) {
      if (!apiBase || !courseSlug) {
        throw new Error("API nao configurada.");
      }
      const token = await getAuthToken();
      if (!token) {
        throw new Error("Sessao expirada. Faca login novamente.");
      }

      const response = await fetch(
        apiBase +
          "/api/courses/" +
          encodeURIComponent(courseSlug) +
          "/lessons/" +
          encodeURIComponent(lessonId),
        {
          method: "DELETE",
          headers: { Authorization: "Bearer " + token },
        },
      );

      if (response.status === 401 || response.status === 403) {
        throw new Error("Sem permissao para excluir aulas.");
      }

      if (response.status === 404) {
        throw new Error("Aula nao encontrada para exclusao.");
      }

      if (!response.ok) {
        throw new Error("Nao foi possivel excluir aula.");
      }
    }

    function setAdminFormStatus(message, tone) {
      if (!adminFormStatusEl) return;
      adminFormStatusEl.textContent = message || "";
      adminFormStatusEl.classList.remove("is-error", "is-success");
      if (tone === "error") {
        adminFormStatusEl.classList.add("is-error");
      }
      if (tone === "success") {
        adminFormStatusEl.classList.add("is-success");
      }
    }

    function resetAdminForm() {
      if (!adminFormEl) return;
      adminFormEl.reset();
      editingLessonId = null;
      const enabledField = adminFormEl.querySelector('input[name="enabled"]');
      if (enabledField) enabledField.checked = true;
      const submit = adminFormEl.querySelector(".admin-submit");
      if (submit) submit.textContent = "Cadastrar aula";
      const heading = adminFormWrapEl ? adminFormWrapEl.querySelector("h3") : null;
      if (heading) heading.textContent = "Cadastrar nova aula";
      const cancel = adminFormEl.querySelector(".admin-cancel");
      if (cancel) cancel.hidden = true;
    }

    function fillAdminFormForEdit(lesson) {
      if (!adminFormEl) return;
      editingLessonId = lesson.lessonId;
      adminFormEl.querySelector('input[name="title"]').value = lesson.title;
      adminFormEl.querySelector('textarea[name="description"]').value = lesson.description;
      adminFormEl.querySelector('input[name="videoId"]').value = lesson.videoId;
      adminFormEl.querySelector('input[name="position"]').value = String(lesson.position);
      adminFormEl.querySelector('input[name="enabled"]').checked = Boolean(lesson.enabled);
      const submit = adminFormEl.querySelector(".admin-submit");
      if (submit) submit.textContent = "Salvar edicao";
      const heading = adminFormWrapEl ? adminFormWrapEl.querySelector("h3") : null;
      if (heading) heading.textContent = "Editar aula";
      const cancel = adminFormEl.querySelector(".admin-cancel");
      if (cancel) cancel.hidden = false;
      setAdminFormStatus("Editando aula: " + lesson.title, "");
      adminFormWrapEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function renderGallery() {
      if (!gallery) return;
      gallery.innerHTML = "";

      const galleryLessons = isAdminMode
        ? lessons
        : lessons.filter(function (lesson) {
            return lesson.enabled;
          });

      if (galleryLessons.length === 0) {
        const empty = document.createElement("p");
        empty.className = "summary";
        empty.textContent = isAdminMode
          ? "Nenhuma aula cadastrada para este curso."
          : "Nenhuma aula ativa no momento.";
        gallery.appendChild(empty);
        if (player) player.src = "";
        setCurrentText("Nenhuma aula ativa no momento.");
        return;
      }

      galleryLessons.forEach(function (lesson, index) {
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
            showSyncIssue(
              "Falha ao salvar no banco. Verifique API local e credenciais do Turso.",
            );
          });
        }

        if (isAdminMode) {
          const adminActions = document.createElement("div");
          adminActions.className = "admin-actions";

          const edit = document.createElement("span");
          edit.className = "admin-action admin-edit";
          edit.setAttribute("role", "button");
          edit.setAttribute("tabindex", "0");
          edit.textContent = "Editar";
          edit.addEventListener("click", function (event) {
            event.stopPropagation();
            event.preventDefault();
            fillAdminFormForEdit(lesson);
          });
          edit.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              fillAdminFormForEdit(lesson);
            }
          });

          const remove = document.createElement("span");
          remove.className = "admin-action admin-delete";
          remove.setAttribute("role", "button");
          remove.setAttribute("tabindex", "0");
          remove.textContent = "Excluir";
          remove.addEventListener("click", function (event) {
            event.stopPropagation();
            event.preventDefault();
            if (!window.confirm("Excluir a aula '" + lesson.title + "'?")) return;
            deleteLesson(lesson.lessonId)
              .then(function () {
                if (editingLessonId === lesson.lessonId) {
                  resetAdminForm();
                }
                return loadLessonsFromApi();
              })
              .then(function () {
                setAdminFormStatus("Aula excluida com sucesso.", "success");
              })
              .catch(function (error) {
                const message =
                  error && error.message
                    ? error.message
                    : "Falha ao excluir aula.";
                showSyncIssue(message);
                setAdminFormStatus(message, "error");
              });
          });
          remove.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              remove.click();
            }
          });

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

          adminActions.appendChild(edit);
          adminActions.appendChild(remove);
          adminActions.appendChild(toggle);
          card.appendChild(adminActions);
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

    function renderAdminForm() {
      if (!galleryTitle) return;

      if (!isAdminMode) {
        if (adminFormWrapEl) {
          adminFormWrapEl.remove();
          adminFormWrapEl = null;
          adminFormStatusEl = null;
        }
        return;
      }

      if (adminFormWrapEl) return;

      adminFormWrapEl = document.createElement("section");
      adminFormWrapEl.className = "admin-form-box";

      const heading = document.createElement("h3");
      heading.textContent = "Cadastrar nova aula";
      adminFormWrapEl.appendChild(heading);

      const form = document.createElement("form");
      form.className = "admin-lesson-form";
      adminFormEl = form;
      form.innerHTML = [
        '<label>Titulo<input type="text" name="title" maxlength="120" required></label>',
        '<label>Descricao<textarea name="description" rows="3" maxlength="500" required></textarea></label>',
        '<label>Video do YouTube (ID ou URL)<input type="text" name="videoId" required></label>',
        '<label>Posicao (opcional)<input type="number" name="position" min="1" step="1"></label>',
        '<label class="checkbox-row"><input type="checkbox" name="enabled" checked> Aula ativa</label>',
        '<div class="admin-form-actions"><button type="submit" class="admin-submit">Cadastrar aula</button><button type="button" class="admin-cancel" hidden>Cancelar edicao</button></div>',
      ].join("");

      adminFormStatusEl = document.createElement("p");
      adminFormStatusEl.className = "admin-form-status";

      const cancelEditButton = form.querySelector(".admin-cancel");
      if (cancelEditButton) {
        cancelEditButton.addEventListener("click", function () {
          resetAdminForm();
          setAdminFormStatus("Edicao cancelada.", "");
        });
      }

      form.addEventListener("submit", async function (event) {
        event.preventDefault();
        const formData = new FormData(form);
        const title = String(formData.get("title") || "").trim();
        const description = String(formData.get("description") || "").trim();
        const videoId = String(formData.get("videoId") || "").trim();
        const positionRaw = String(formData.get("position") || "").trim();
        const enabled = formData.get("enabled") === "on";

        const payload = {
          title: title,
          description: description,
          videoId: videoId,
          enabled: enabled,
        };

        if (positionRaw) {
          payload.position = Number(positionRaw);
        } else if (editingLessonId) {
          setAdminFormStatus("Informe uma posicao valida para salvar edicao.", "error");
          return;
        }

        setAdminFormStatus("Salvando...", "");

        try {
          if (editingLessonId) {
            await updateLesson(editingLessonId, payload);
          } else {
            await createLesson(payload);
          }
          await loadLessonsFromApi();
          if (editingLessonId) {
            setAdminFormStatus("Aula editada com sucesso.", "success");
          } else {
            setAdminFormStatus("Aula cadastrada com sucesso.", "success");
          }
          resetAdminForm();
          clearSyncIssue();
        } catch (error) {
          const message = error && error.message ? error.message : "Falha ao cadastrar aula.";
          setAdminFormStatus(message, "error");
          showSyncIssue(message);
        }
      });

      adminFormWrapEl.appendChild(form);
      adminFormWrapEl.appendChild(adminFormStatusEl);
      galleryTitle.insertAdjacentElement("beforebegin", adminFormWrapEl);
    }

    function setAdminMode(nextMode) {
      isAdminMode = Boolean(nextMode);
      renderAdminNote();
      renderAdminForm();
      renderGallery();
      buildCourseList();
      ensureSelectedPlayable();
    }

    async function refreshRoleAndMode() {
      try {
        currentUserRole = await resolveUserRoleFromApi();
      } catch (error) {
        currentUserRole = "viewer";
      }
      setAdminMode(canManageLessons(currentUserRole));
    }

    async function loadLessonsFromApi() {
      if (!apiBase || !courseSlug) {
        setCurrentText("API de aulas nao configurada.");
        return;
      }

      try {
        const response = await fetch(
          apiBase + "/api/courses/" + encodeURIComponent(courseSlug) + "/lessons",
        );
        if (!response.ok) {
          showSyncIssue("Falha ao ler aulas no banco (API/Turso indisponivel).");
          setCurrentText("Nao foi possivel carregar aulas.");
          lessons = [];
          renderGallery();
          buildCourseList();
          return;
        }

        const payload = await response.json();
        lessons = Array.isArray(payload.lessons) ? payload.lessons : [];
        lessons.sort(function (a, b) {
          return Number(a.position) - Number(b.position);
        });

        renderGallery();
        buildCourseList();
        ensureSelectedPlayable();
        clearSyncIssue();
      } catch (error) {
        showSyncIssue("Falha de rede ao buscar aulas. Verifique API local e conexao.");
        setCurrentText("Nao foi possivel carregar aulas.");
        lessons = [];
        renderGallery();
        buildCourseList();
      }
    }

    loadLessonsFromApi();

    if (window.cvAuth && window.cvAuth.ready) {
      window.cvAuth.ready.then(function (auth) {
        if (auth && auth.isSignedIn) {
          refreshRoleAndMode();
          return;
        }

        currentUserRole = "viewer";
        setAdminMode(false);
      });
    }

    window.addEventListener("cv-auth-ready", function (event) {
      const detail = event.detail || {};
      if (detail.isSignedIn) {
        refreshRoleAndMode();
        return;
      }

      currentUserRole = "viewer";
      setAdminMode(false);
    });
  }

  setTimeout(init, 0);
})();
