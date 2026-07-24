// ============================================
// LOGIQUE DU COFFRE À MOTS
// ============================================

const screens = {
  who: document.getElementById("screen-who"),
  code: document.getElementById("screen-code"),
  main: document.getElementById("screen-main"),
};

function showScreen(name) {
  Object.values(screens).forEach((s) => s.classList.remove("active"));
  screens[name].classList.add("active");
}

let pendingPlayerKey = null; // joueur en train d'entrer son code
let currentPlayerKey = null; // joueur connecté

function otherKey(key) {
  return key === "j1" ? "j2" : "j1";
}

// --- Écran 1 : choix du joueur ---
const playerButtons = document.querySelectorAll(".player-btn");
playerButtons.forEach((btn) => {
  const key = btn.dataset.player;
  btn.textContent = CONFIG.players[key].name;
  btn.addEventListener("click", () => {
    pendingPlayerKey = key;
    document.getElementById("code-eyebrow").textContent = CONFIG.players[key].name;
    document.getElementById("code-input").value = "";
    document.getElementById("code-error").textContent = "";
    showScreen("code");
    setTimeout(() => document.getElementById("code-input").focus(), 50);
  });
});

// --- Écran 2 : code secret ---
document.getElementById("back-to-who").addEventListener("click", () => {
  pendingPlayerKey = null;
  showScreen("who");
});

function tryCode() {
  const input = document.getElementById("code-input").value.trim();
  const expected = CONFIG.players[pendingPlayerKey].code;
  if (input === expected) {
    currentPlayerKey = pendingPlayerKey;
    enterMain();
  } else {
    document.getElementById("code-error").textContent = "Code incorrect.";
  }
}

document.getElementById("submit-code").addEventListener("click", tryCode);
document.getElementById("code-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") tryCode();
});

// --- Écran 3 : tableau de bord ---
document.getElementById("logout").addEventListener("click", () => {
  currentPlayerKey = null;
  pendingPlayerKey = null;
  showScreen("who");
});

function enterMain() {
  const me = CONFIG.players[currentPlayerKey];
  const other = CONFIG.players[otherKey(currentPlayerKey)];

  document.getElementById("main-eyebrow").textContent = me.name;
  document.getElementById("main-title").textContent = "Bonjour, " + me.name;
  document.getElementById("add-hint").textContent = "Pour la liste de " + other.name + ".";
  document.getElementById("word-input").value = "";
  document.getElementById("add-confirm").textContent = "";
  document.getElementById("load-error").textContent = "";

  showScreen("main");
  refreshLockState();
  startCountdownLoop();
}

// --- Ajouter un mot pour l'autre joueur ---
document.getElementById("add-word").addEventListener("click", addWord);
document.getElementById("word-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") addWord();
});

async function addWord() {
  const input = document.getElementById("word-input");
  const word = input.value.trim();
  const confirmEl = document.getElementById("add-confirm");
  const errorEl = document.getElementById("load-error");
  if (!word) return;

  const btn = document.getElementById("add-word");
  btn.disabled = true;
  confirmEl.textContent = "";
  errorEl.textContent = "";

  try {
    const data = await fetchBin();
    const target = otherKey(currentPlayerKey);
    if (!data[target]) data[target] = { words: [] };
    if (!Array.isArray(data[target].words)) data[target].words = [];
    data[target].words.push(word);
    await saveBin(data);
    input.value = "";
    confirmEl.textContent = "Mot ajouté au coffre de " + CONFIG.players[target].name + " ✨";
  } catch (err) {
    errorEl.textContent = "Impossible d'ajouter le mot. Vérifie la configuration JSONBin (voir INSTRUCTIONS.md).";
    console.error(err);
  } finally {
    btn.disabled = false;
  }
}

// --- Voir ses mots (verrouillé en dehors de la fenêtre horaire) ---
// La fenêtre peut être "de nuit" (ex: 18h -> 7h), donc on gère le passage à minuit.
function isUnlocked() {
  const h = new Date().getHours();
  const start = CONFIG.revealStartHour;
  const end = CONFIG.revealEndHour;
  if (start <= end) {
    return h >= start && h < end;
  }
  return h >= start || h < end;
}

// Prochain instant où l'état bascule (déverrouillage ou reverrouillage, selon ce qui vient en premier).
function nextTransitionTime() {
  const now = new Date();
  const candidates = [];
  [CONFIG.revealStartHour, CONFIG.revealEndHour].forEach((h) => {
    for (let dayOffset = 0; dayOffset <= 1; dayOffset++) {
      const d = new Date(now);
      d.setDate(d.getDate() + dayOffset);
      d.setHours(h, 0, 0, 0);
      if (d > now) candidates.push(d);
    }
  });
  candidates.sort((a, b) => a - b);
  return candidates[0];
}

let countdownTimer = null;

function startCountdownLoop() {
  if (countdownTimer) clearInterval(countdownTimer);
  updateCountdown();
  countdownTimer = setInterval(updateCountdown, 30 * 1000);
}

function updateCountdown() {
  const unlocked = isUnlocked();
  const lockedView = document.getElementById("locked-view");
  const unlockedView = document.getElementById("unlocked-view");

  const diffMs = nextTransitionTime() - new Date();
  const h = Math.floor(diffMs / 3600000);
  const m = Math.floor((diffMs % 3600000) / 60000);
  const timeLeft = h + "h " + String(m).padStart(2, "0") + "min";

  if (unlocked) {
    lockedView.classList.add("hidden");
    unlockedView.classList.remove("hidden");
    document.getElementById("relock-info").textContent =
      "Se reverrouille dans " + timeLeft + " (à " + CONFIG.revealEndHour + "h).";
    loadMyWords();
  } else {
    lockedView.classList.remove("hidden");
    unlockedView.classList.add("hidden");
    document.getElementById("countdown").textContent = "Débloqué dans " + timeLeft;
  }
}

async function loadMyWords() {
  const listEl = document.getElementById("word-list");
  const emptyEl = document.getElementById("word-list-empty");
  const errorEl = document.getElementById("load-error");
  try {
    const data = await fetchBin();
    const mine = (data[currentPlayerKey] && data[currentPlayerKey].words) || [];
    listEl.innerHTML = "";
    if (mine.length === 0) {
      emptyEl.classList.remove("hidden");
    } else {
      emptyEl.classList.add("hidden");
      mine.forEach((w) => {
        const li = document.createElement("li");
        li.textContent = w;
        listEl.appendChild(li);
      });
    }
    errorEl.textContent = "";
  } catch (err) {
    errorEl.textContent = "Impossible de charger tes mots. Vérifie la configuration JSONBin (voir INSTRUCTIONS.md).";
    console.error(err);
  }
}

// --- Communication avec JSONBin.io ---
async function fetchBin() {
  const res = await fetch(
    "https://api.jsonbin.io/v3/b/" + CONFIG.jsonbin.binId + "/latest",
    { headers: { "X-Master-Key": CONFIG.jsonbin.masterKey } }
  );
  if (!res.ok) throw new Error("Lecture du coffre impossible (" + res.status + ")");
  const json = await res.json();
  return json.record;
}

async function saveBin(data) {
  const res = await fetch("https://api.jsonbin.io/v3/b/" + CONFIG.jsonbin.binId, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": CONFIG.jsonbin.masterKey,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Écriture dans le coffre impossible (" + res.status + ")");
}
