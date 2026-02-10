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

## Aula 01 - Video com login e progresso salvo

<div class="auth-box">
  <p class="auth-title">Acesso do aluno</p>
  <div class="auth-grid">
    <input id="auth-email" type="email" placeholder="Email" />
    <input id="auth-password" type="password" placeholder="Senha" />
  </div>
  <div class="auth-actions">
    <button id="btn-signup" type="button">Criar conta</button>
    <button id="btn-login" type="button">Entrar</button>
    <button id="btn-logout" type="button">Sair</button>
  </div>
  <p id="auth-status" class="auth-status">Nao autenticado.</p>
</div>

<div class="video-shell">
  <div id="yt-player"></div>
  <p id="video-progress" class="video-progress">Progresso: 0%</p>
</div>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
  (function () {
    const SUPABASE_URL = "https://vocnttduiluwlgibpdoa.supabase.co";
    const SUPABASE_ANON_KEY = "sb_publishable_SnuL1tK7GVuqR6dynvUaqQ_iFPdrplF";
    const COURSE_SLUG = "windows";
    const LESSON_ID = "aula-01";
    const VIDEO_ID = "IldPMbfLb1E";

    if (
      SUPABASE_URL === "COLE_AQUI_SUPABASE_URL" ||
      SUPABASE_ANON_KEY === "COLE_AQUI_SUPABASE_ANON_KEY"
    ) {
      document.getElementById("auth-status").textContent =
        "Configure SUPABASE_URL e SUPABASE_ANON_KEY no arquivo windows.md.";
      return;
    }

    const supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );

    const emailInput = document.getElementById("auth-email");
    const passwordInput = document.getElementById("auth-password");
    const statusEl = document.getElementById("auth-status");
    const progressEl = document.getElementById("video-progress");
    const signUpBtn = document.getElementById("btn-signup");
    const loginBtn = document.getElementById("btn-login");
    const logoutBtn = document.getElementById("btn-logout");

    let player = null;
    let currentUser = null;
    let saveInterval = null;
    let furthestSeconds = 0;

    function setStatus(message) {
      statusEl.textContent = message;
    }

    function setProgressText(current, duration) {
      if (!duration || duration <= 0) {
        progressEl.textContent = "Progresso: 0%";
        return;
      }
      const percent = Math.min(100, Math.round((current / duration) * 100));
      progressEl.textContent = "Progresso: " + percent + "%";
    }

    async function saveProgress() {
      if (!player || !currentUser) return;

      const current = Math.floor(player.getCurrentTime() || 0);
      const duration = Math.floor(player.getDuration() || 0);

      furthestSeconds = Math.max(furthestSeconds, current);
      setProgressText(furthestSeconds, duration);

      const completed = duration > 0 ? furthestSeconds / duration >= 0.9 : false;

      const { error } = await supabaseClient.from("video_progress").upsert(
        {
          user_id: currentUser.id,
          course_slug: COURSE_SLUG,
          lesson_id: LESSON_ID,
          video_id: VIDEO_ID,
          watched_seconds: furthestSeconds,
          duration_seconds: duration,
          last_position_seconds: current,
          completed: completed,
        },
        { onConflict: "user_id,course_slug,lesson_id" }
      );

      if (error) {
        console.error(error);
      }
    }

    async function loadProgress() {
      if (!currentUser || !player) return;

      const { data, error } = await supabaseClient
        .from("video_progress")
        .select("watched_seconds,last_position_seconds,duration_seconds")
        .eq("user_id", currentUser.id)
        .eq("course_slug", COURSE_SLUG)
        .eq("lesson_id", LESSON_ID)
        .maybeSingle();

      if (error) {
        console.error(error);
        return;
      }

      if (!data) {
        setProgressText(0, Math.floor(player.getDuration() || 0));
        return;
      }

      furthestSeconds = Math.floor(data.watched_seconds || 0);
      const seekTo = Math.floor(data.last_position_seconds || 0);
      if (seekTo > 0) player.seekTo(seekTo, true);

      const duration = Math.floor(
        data.duration_seconds || player.getDuration() || 0
      );
      setProgressText(furthestSeconds, duration);
    }

    function clearSessionUI() {
      furthestSeconds = 0;
      setProgressText(0, Math.floor(player?.getDuration?.() || 0));
    }

    async function refreshUser() {
      const { data } = await supabaseClient.auth.getUser();
      currentUser = data.user || null;
      if (currentUser) {
        setStatus("Logado como: " + currentUser.email);
        await loadProgress();
      } else {
        setStatus("Nao autenticado.");
        clearSessionUI();
      }
    }

    signUpBtn.addEventListener("click", async function () {
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();
      if (!email || !password) {
        setStatus("Informe email e senha.");
        return;
      }
      if (password.length < 6) {
        setStatus("A senha deve ter pelo menos 6 caracteres.");
        return;
      }

      const { data, error } = await supabaseClient.auth.signUp({ email, password });
      if (error) {
        setStatus("Erro ao criar conta: " + error.message);
        return;
      }
      if (data.session) {
        setStatus("Conta criada e login realizado.");
        await refreshUser();
        return;
      }
      setStatus("Conta criada. Verifique seu email para confirmar a conta.");
    });

    loginBtn.addEventListener("click", async function () {
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();
      if (!email || !password) {
        setStatus("Informe email e senha.");
        return;
      }

      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        if ((error.message || "").toLowerCase().includes("invalid login credentials")) {
          setStatus(
            "Login invalido. Verifique email/senha ou confirme o email da conta no Supabase."
          );
          return;
        }
        setStatus("Erro no login: " + error.message);
        return;
      }
      await refreshUser();
    });

    logoutBtn.addEventListener("click", async function () {
      await supabaseClient.auth.signOut();
      await refreshUser();
    });

    supabaseClient.auth.onAuthStateChange(async function () {
      await refreshUser();
    });

    window.onYouTubeIframeAPIReady = function () {
      player = new YT.Player("yt-player", {
        videoId: VIDEO_ID,
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onReady: async function () {
            await refreshUser();
          },
          onStateChange: function (event) {
            if (event.data === YT.PlayerState.PLAYING) {
              if (saveInterval) clearInterval(saveInterval);
              saveInterval = setInterval(saveProgress, 5000);
            }
            if (
              event.data === YT.PlayerState.PAUSED ||
              event.data === YT.PlayerState.ENDED
            ) {
              if (saveInterval) clearInterval(saveInterval);
              saveInterval = null;
              saveProgress();
            }
          },
        },
      });
    };

    const ytApiScript = document.createElement("script");
    ytApiScript.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(ytApiScript);
  })();
</script>
