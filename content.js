function sendRuntimeMessage(msg) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(msg, (response) => {
      resolve(response);
    });
  });
}

window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (!event.data || event.data.direction !== "FROM_PAGE") return;

  chrome.runtime.sendMessage({
      action: event.data.action,
      entityId: event.data.entityId,
      requestId: event.data.requestId
    }, (response) => {
      window.postMessage({
        direction: "FROM_EXTENSION",
        requestId: event.data.requestId,
        payload: response
      }, "*");
    }
  );
});

window.addEventListener("message", (event) => {
  if (event.data === "EXT_CHECK") {
    window.postMessage({ type: "EXT_RESPONSE" }, "*");
  }
});