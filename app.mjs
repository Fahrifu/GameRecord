import Game from "./models/Game.mjs";

const GAME_PREFIX = "game_"

function saveGame(game) {
    const key = `${GAME_PREFIX}${game.title}`;
    localStorage.setItem(key, JSON.stringify(game));
}

function getAllGames() {
    const games = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(GAME_PREFIX)) {
            const data = JSON.parse(localStorage.getItem(key));
            games.push(new Game(data));
        }
    }
    return games;
}

function exportGamesAsJSON() {
    const games = getAllGames();
    return JSON.parse(games, null, 2);
}

function importGamesFromJSON(jsonStr) {
    const data = JSON.parse(jsonStr) 
    if (!Array.isArray(data)) throw new Error("Invalid JSON format");

    data.forEach(obj => {
        const game = new Game(obj);
        saveGame(game);
    });
}

