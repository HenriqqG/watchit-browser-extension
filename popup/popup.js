document.addEventListener("DOMContentLoaded", async () => {
  const twitterIcon = document.getElementById("twitterIcon");
  const watchITLogo = document.getElementById("watchITLogo");
  twitterIcon.addEventListener("click", () => {
    chrome.tabs.create({ url: "https://x.com/GagnoHenriqq"});
  });
  watchITLogo.addEventListener("click", () => {
    chrome.tabs.create({ url: "https://watchit.gg/"});
  });
});