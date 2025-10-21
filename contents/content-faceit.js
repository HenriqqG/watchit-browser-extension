let currentRoomId = null;
let fetchedRoomId = null;

const newPlayerMap = new Map();

function processRoomData(idRoom) {
  console.warn(`[WatchIT] Nova sala detectada: ${idRoom}. Buscando dados...`);

  fetchedRoomId = idRoom;

  chrome.runtime.sendMessage({
    action: "getRoomData",
    idRoom: idRoom,
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("[WatchIT] Erro de comunicação com Service Worker:", chrome.runtime.lastError.message);
      fetchedRoomId = null;
      return;
    }
    const matchData = response.data;
    if (matchData) {
      Object.entries(matchData.teams).map(([factionKey, team]) => {
        team.roster.forEach(player => {
          newPlayerMap.set(player.nickname, player.player_id);
        });
      });
      injectPlayerButtons();
    }
  });
}

function injectPlayerButtons() {
  const tables = document.querySelectorAll(".styles__Table-sc-213bc3ad-2");

  tables.forEach((table, index) => {
    if (table.dataset.watchitDataInjected === "true") return;

    table.querySelectorAll("tbody tr").forEach((row) => {
      const currentTd = row.querySelector("td");
      if (!currentTd) return;

      const newTd = currentTd.nextElementSibling;
      const watchItButton = newTd ? newTd.querySelector(".watchit-button") : null;

      if (!newTd || !watchItButton) return;

      watchItButton.textContent = "+ WatchIT";
      watchItButton.hidden = false;
      newTd.classList.add("watchit-ready");

      Object.assign(watchItButton.style, {
        backgroundColor: "#0f0f0f",
        color: "rgb(167, 167, 167)",
        border: "none",
        borderRadius: "4px",
        padding: "6px 10px",
        fontSize: "14px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        display: "inline-flex",
        alignItems: "center",
        boxShadow: "0 0 0 1px rgba(255, 123, 0, 0.1)",
      });

      watchItButton.addEventListener("mouseenter", () => {
        watchItButton.style.backgroundColor = "#1a1a1a";
        watchItButton.style.color = "#ffa24d";
        watchItButton.style.boxShadow = "0 0 8px rgba(255, 123, 0, 0.4), inset 0 0 4px rgba(255, 123, 0, 0.3)";
        watchItButton.style.transform = "translateY(-1px);";
      });
      watchItButton.addEventListener("mouseleave", () => {
        watchItButton.style.backgroundColor = "#0f0f0f";
        watchItButton.style.color = "rgb(167, 167, 167)";
        watchItButton.style.boxShadow = "0 0 0 1px rgba(255, 123, 0, 0.1)";
      });

      watchItButton.onclick = () => {
        const clickedPlayerName = currentTd.textContent.trim();
        const playerId = newPlayerMap.get(clickedPlayerName);

        if (!playerId) {
          console.error("WatchIT: ID do jogador não encontrado (erro assíncrono).");
          return;
        }

        chrome.runtime.sendMessage({
          action: "relayWatchPlayer",
          player_id: playerId
        });

        watchItButton.textContent = "Watched";
        watchItButton.disabled = true;
        watchItButton.style.cursor = "default";
      };
    });

    table.dataset.watchitDataInjected = "true";
  });
}

const observer = new MutationObserver(() => {
  const pathName = window.location.pathname;
  const regex = /^\/[a-z]{2}\/cs2\/room\/([^/]+)\/scoreboard$/;

  if (!regex.test(pathName)) {
    currentRoomId = null;
    fetchedRoomId = null;
    newPlayerMap.clear();
    return;
  }

  const match = pathName.match(regex);
  const idRoom = match ? match[1] : null;
  if (!idRoom) return;

  const tables = document.querySelectorAll(".styles__Table-sc-213bc3ad-2");

  if (tables.length > 0 && idRoom !== fetchedRoomId) {
    if (idRoom !== currentRoomId) {
      currentRoomId = idRoom;
      processRoomData(idRoom);
    }
  }
  if (tables.length === 0) return;

  tables.forEach((table, index) => {
    if (table.dataset.watchitPatched === "true") return;
    table.dataset.watchitPatched = "true";

    const newTh = document.createElement("th");
    newTh.className = "styles__Head-sc-213bc3ad-3 kkKWoR watchit-header";
    newTh.textContent = "";

    const firstTH = table.querySelector("thead tr:first-child th:first-child");
    if (firstTH) firstTH.after(newTh);

    table.querySelectorAll("tbody tr").forEach((row) => {
      const firstTd = row.querySelector("td:first-child");
      if (!firstTd) return;

      const newTd = document.createElement("td");

      const watchItButton = document.createElement("button");
      watchItButton.className = "watchit-button";
      watchItButton.hidden = true;
      newTd.appendChild(watchItButton);

      newTd.className = `styles__Cell-sc-213bc3ad-6 watchit-cell ${index === 0 ? "fRHaFk" : "bXdVfj"}`;
      firstTd.after(newTd);
    });
  });
});

observer.observe(document.body, { childList: true, subtree: true });
