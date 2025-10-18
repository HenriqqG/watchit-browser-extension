function sendRuntimeMessage(msg) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(msg, (response) => {
      resolve(response);
    });
  });
}

window.addEventListener("message", async (event) => {
  if (event.source !== window 
    || event.origin !== "https://watchit-cs.netlify.app") return;

  const message = event.data;
  if (message && message.direction === "FROM_PAGE" && message.action === "getFaceitLiveMatchesData") {
    const requestId = message.requestId;

    const response = await sendRuntimeMessage({
      action: "getFaceitLiveMatchesData",
      entityId: message.entityId
    });

    window.postMessage({
      direction: "FROM_EXTENSION",
      requestId,
      payload: response
    }, "*");
  }
});
