document.getElementById("fetch").addEventListener("click", async () => {
  const entityId = document.getElementById("matchId").value;

  chrome.runtime.sendMessage(
    { action: "getFaceitMatchData", entityId },
    (response) => {
      if (response.success) {
        console.log("Match data:", response.data);
        // aqui você pode enviar para seu servidor, se quiser
      } else {
        console.error("Erro:", response.error);
      }
    }
  );
});