import Game from "./models/Game.mjs";

const GAME_PREFIX = "game_"
let games = [];

function saveGame(game) {
    const key = `${GAME_PREFIX}${game.title}`;
    localStorage.setItem(key, JSON.stringify(game));
}

function getAllGames() {
    const result = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(GAME_PREFIX)) {
            const data = JSON.parse(localStorage.getItem(key));
            result.push(new Game(data));
        }
    }
    return result;
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

    games = getAllGames();
}

games = getAllGames();
console.log("Loaded Games:", games);

document.getElementById("importSource").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
        try {
            importGamesFromJSON(event.target.result);
            console.log("Import Verified: ", games);
        } catch (err) {
            console.error("Failed", err);
        }
    };
    reader.readAsText(file);
})



