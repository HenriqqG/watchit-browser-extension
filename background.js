chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getFaceitLiveMatchesData") {
    (async () => {
      try {
        const cookies = await chrome.cookies.getAll({ domain: "faceit.com" });
        const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join("; ");

        const url = `https://www.faceit.com/api/match/v3/match?entityId=${message.entityId}&entityType=matchmaking&status=LIVE&offset=0&limit=20`;

        const res = await fetch(url, {
          headers: {
            "accept": "application/json, text/plain, */*",
            "cookie": cookieHeader,
            "faceit-referer": "web-next"
          },
          credentials: "include"
        });

        const data = await res.json();
        sendResponse({ success: true, data });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    })();

    return true;
  }
});