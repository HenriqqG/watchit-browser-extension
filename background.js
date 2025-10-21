import { fetchRoomScoreboard } from './utils/api.js';

async function ensureOffscreen() {
  const hasDoc = await chrome.offscreen.hasDocument?.();
  if (hasDoc) return;

  await chrome.offscreen.createDocument({
    url: chrome.runtime.getURL('offscreen/offscreen.html'),
    reasons: ['BLOBS', 'IFRAME_SCRIPTING'],
    justification: 'Secure fetch Faceit data'
  });

  await new Promise((resolve) => setTimeout(resolve, 100));
}

let pendingPlayers = [];

chrome.runtime.onStartup.addListener(async () => {
  const stored = await chrome.storage.local.get("pendingPlayers");
  pendingPlayers = stored.pendingPlayers || [];
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "getFaceitLiveMatchesData") {
    (async () => {
      try {
        await ensureOffscreen();

        const response = await new Promise((resolve) => {
          chrome.runtime.sendMessage(
            { action: "fetchFaceitData", entityId: msg.entityId },
            (data) => resolve(data)
          );
        });

        sendResponse(response);
      } catch (err) {
        console.error("Erro background:", err);
        sendResponse({ success: false, error: err.message });
      }
    })();

    return true;
  } else if (msg.action === "getRoomData") {
    (async () => {
      try {
        const roomData = await fetchRoomScoreboard(msg.idRoom);
        sendResponse(roomData);
      }
      catch (err) {
        console.error("Erro background:", err);
        sendResponse({ success: false, error: err.message });
      }
    })();

    return true;
  } else if (msg.action === "relayWatchPlayer") {
    const player_id = msg.player_id;
    chrome.tabs.query({},
      async (tabs) => {
        const targetTab = tabs.find((t) => t.url?.includes("watchit-cs.netlify.app") || t.url?.includes("localhost:5173"));
        if (targetTab?.id) {
          chrome.tabs.sendMessage(targetTab.id, { action: "forwardToFrontend", player_id },
            (response) => {
              if (chrome.runtime.lastError) {
                if (chrome.runtime.lastError.message.includes("The message port closed")) {
                  console.warn("Aba ainda carregando ou sem listener, ignorando.");
                } else {
                  console.error("Erro ao enviar ao WatchIT:", chrome.runtime.lastError.message);
                }
                sendResponse({ success: false });
                return;
              }
              sendResponse({ success: true });
            });
        } else {
          if (!pendingPlayers.includes(player_id)) {
            pendingPlayers.push(player_id);
            await chrome.storage.local.set({ pendingPlayers });
            console.warn("WatchIT fechado. Jogador adicionado à fila.");
          }
          sendResponse({ success: false, queued: true });
        }
      });
    return true;
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" &&
    (tab.url?.includes("watchit-cs.netlify.app") ||
      tab.url?.includes("localhost:5173"))) {

    console.log("[Background] WatchIT aberto, verificando fila...");

    const stored = await chrome.storage.local.get("pendingPlayers");
    const queue = stored.pendingPlayers || [];

    if (queue.length > 0) {
      console.log(`[Background] Enviando ${queue.length} jogador(es) pendente(s)...`);

      for (const player_id of queue) {
        chrome.tabs.sendMessage(tabId, {
          action: "forwardToFrontend",
          player_id,
        });
      }

      pendingPlayers = [];
      await chrome.storage.local.set({ pendingPlayers: [] });
      console.log("[Background] Fila limpa após entrega ao WatchIT.");
    }
  }
});