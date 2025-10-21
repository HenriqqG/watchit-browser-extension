window.addEventListener("message", (event) => {
    if (event.source !== window) return;

    if (!event.data || event.data.direction !== "FROM_PAGE") return;

    else if (event.data.action === "getFaceitLiveMatchesData") {
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
        });
    }
});

window.addEventListener("message", (event) => {
    if (event.data === "EXT_CHECK") {
        window.postMessage({ type: "EXT_RESPONSE" }, "*");
    }
});