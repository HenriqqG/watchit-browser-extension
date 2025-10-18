chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "getFaceitLiveMatchesData") {
    handleFaceitRequest(msg.entityId)
      .then((data) => sendResponse({ success: true, data }))
      .catch((err) => sendResponse({ success: false, error: err.message || err }));
  }
  return true;
});

async function handleFaceitRequest(entityId) {
  const cookies = await chrome.cookies.getAll({ domain: "faceit.com" });
  const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join("; ");

  const limit = 100;
  let offset = 0;

  const firstResponse = await fetch(`https://www.faceit.com/api/match/v3/match?entityId=${entityId}&entityType=matchmaking&status=LIVE&offset=${offset}&limit=${limit}`, {
    method: "GET",
    headers: {
      "Cookie": cookieHeader,
      "Accept": "application/json"
    }
  });

  if (!firstResponse.ok) {
    const text = await firstResponse.text().catch(() => "<sem corpo>");
    throw new Error(`Erro na requisição Faceit (${firstResponse.status}): ${text}`);
  }

  const firstData = await firstResponse.json();
  const totalPages = firstData.totalPages;

  if (totalPages > 1) {
    const requests = [];
    for (let page = 1; page < totalPages; page++) {
      const pageOffset = page * limit;
      requests.push(
        fetch(`https://www.faceit.com/api/match/v3/match?entityId=${entityId}&entityType=matchmaking&status=LIVE&offset=${pageOffset}&limit=${limit}`, {
          method: "GET",
          headers: {
            "Cookie": cookieHeader,
            "Accept": "application/json"
          }
        }).then(res => {
          if (!res.ok) {
            return res.text().then(text => {
              throw new Error(`Erro na requisição Faceit (${res.status}): ${text}`);
            });
          }
          return res.json();
        })
      );
    }

    const results = await Promise.all(requests);

    results.forEach(r => firstData.payload.push(...r.payload));
  }

  return firstData;
}


