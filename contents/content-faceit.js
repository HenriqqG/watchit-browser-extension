const observer = new MutationObserver(() => {
  const pathName = window.location.pathname;
  const regex = /^\/[a-z]{2}\/cs2\/room\/([^/]+)\/scoreboard$/;
  if (!regex.test(pathName)) return;

  const tables = document.querySelectorAll(".styles__Table-sc-213bc3ad-2");
  if (tables.length === 0) return;

  if (!document.getElementById("watchit-extension-root")) {
    const shadowHost = document.createElement("div");
    shadowHost.id = "watchit-extension-root";
    document.body.appendChild(shadowHost);

    const shadow = shadowHost.attachShadow({ mode: "open" });
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = chrome.runtime.getURL("injected-style.css");
    shadow.appendChild(link);
  }

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
      newTd.className = `styles__Cell-sc-213bc3ad-6 watchit-cell ${
        index === 0 ? "fRHaFk" : "bXdVfj"
      }`;
      newTd.textContent = "— WatchIT —";
      firstTd.after(newTd);
    });
  });
});

observer.observe(document.body, { childList: true, subtree: true });
