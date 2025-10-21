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
  }
});