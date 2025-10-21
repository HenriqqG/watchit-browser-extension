/**
 * Busca dados do scoreboard da sala de partida na API da FACEIT.
 * @param {string} roomId O ID da sala da partida.
 * @returns {Promise<Object>} Os dados do scoreboard.
 */
export async function fetchRoomScoreboard(roomId) {
    const url = `https://faceit-blocklist-extender-node-homolog.fly.dev/bextension/room/${roomId}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erro ao buscar dados da sala: Status ${response.status}`);
        }

        const data = await response.json();
        return { success: true, data: data };

    } catch (error) {
        console.error("Erro na chamada à API da FACEIT:", error.message);
        return { success: false, error: error.message };
    }
}