chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "forwardToFrontend") {
    window.postMessage(
      {
        direction: "FROM_EXTENSION",
        type: "addToWatchITList",
        payload: msg,
      },
      "*"
    );
    sendResponse({ success: true });
  }
});