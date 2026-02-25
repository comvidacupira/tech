(function () {
  const key = window.CLERK_PUBLISHABLE_KEY;
  const authControls = document.getElementById("auth-controls");
  const ready = createAuthReadyPromise();

  window.cvAuth = { ready: ready };

  function createAuthReadyPromise() {
    return new Promise(function (resolve) {
      if (!key) {
        renderInfo("Auth indisponivel");
        resolveAuth(false, null);
        return;
      }

      const script = document.createElement("script");
      script.async = true;
      script.crossOrigin = "anonymous";
      script.src = buildClerkScriptUrl(key);

      script.onload = function () {
        initClerk(resolve);
      };

      script.onerror = function () {
        renderInfo("Falha ao carregar auth");
        resolveAuth(false, null);
      };

      document.head.appendChild(script);

      function resolveAuth(isSignedIn, user) {
        const detail = { isSignedIn: isSignedIn, user: user };
        resolve(detail);
        window.dispatchEvent(new CustomEvent("cv-auth-ready", { detail: detail }));
      }

      async function initClerk(done) {
        try {
          const clerk = await resolveClerkClient();
          await clerk.load();

          if (clerk.user) {
            renderSignedIn(clerk);
            resolveAuth(true, clerk.user);
            return;
          }

          renderSignedOut(clerk);
          resolveAuth(false, null);
        } catch (error) {
          const message = readErrorMessage(error);
          console.error("[ClerkAuth] init error:", error);
          renderInfo("Erro no auth: " + message);
          resolveAuth(false, null);
        }
      }
    });
  }

  async function resolveClerkClient() {
    if (!window.Clerk) {
      throw new Error("SDK do Clerk carregou sem objeto global Clerk.");
    }

    if (typeof window.Clerk.load === "function") {
      window.Clerk.publishableKey = key;
      return window.Clerk;
    }

    if (typeof window.Clerk === "function") {
      return new window.Clerk(key);
    }

    throw new Error("Formato de SDK do Clerk nao reconhecido.");
  }

  function buildClerkScriptUrl(publishableKey) {
    const frontendApi = decodeFrontendApi(publishableKey);
    if (!frontendApi) {
      throw new Error("Nao foi possivel extrair o frontend API da publishable key.");
    }
    return "https://" + frontendApi + "/npm/@clerk/clerk-js@latest/dist/clerk.browser.js";
  }

  function decodeFrontendApi(publishableKey) {
    try {
      const parts = String(publishableKey).split("_");
      if (parts.length < 3) return null;
      const encoded = parts.slice(2).join("_").replace(/\$/g, "");
      return atob(encoded);
    } catch (error) {
      return null;
    }
  }

  function readErrorMessage(error) {
    if (!error) return "desconhecido";
    if (typeof error === "string") return error;
    if (error.errors && error.errors.length > 0) {
      const first = error.errors[0];
      if (first && first.longMessage) return first.longMessage;
      if (first && first.message) return first.message;
    }
    if (error.message) return error.message;
    return "desconhecido";
  }

  function renderSignedOut(clerk) {
    if (!authControls) return;

    authControls.innerHTML = "";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "auth-button";
    button.textContent = "Entrar";
    button.addEventListener("click", function () {
      clerk.openSignIn();
    });
    authControls.appendChild(button);
  }

  function renderSignedIn(clerk) {
    if (!authControls) return;

    authControls.innerHTML = "";
    const name = document.createElement("span");
    const user = clerk.user;
    const label = user && (user.firstName || user.username || "Admin");
    name.className = "auth-user";
    name.textContent = label;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "auth-button";
    button.textContent = "Sair";
    button.addEventListener("click", async function () {
      await clerk.signOut();
      window.location.reload();
    });

    authControls.appendChild(name);
    authControls.appendChild(button);
  }

  function renderInfo(text) {
    if (!authControls) return;
    authControls.innerHTML = "";
    const info = document.createElement("span");
    info.className = "auth-info";
    info.textContent = text;
    authControls.appendChild(info);
  }
})();
