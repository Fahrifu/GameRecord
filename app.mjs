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

function renderGames() {
    const container = document.getElementById("gameList");
    container.innerHTML = "";

    games.forEach(game => {
        const gameDiv = document.createElement("div");
        gameDiv.classList.add("game-record");

        gameDiv.innerHTML = `
        <h2>${game.title}</h2>
        <p><strong>Year:</strong> ${game.year}</p>
        <p><strong>Designer:</strong> ${game.designer}</p>
        <p><strong>Play Count:</strong> ${game.playCount}</p>
        <p><strong>Rating:</strong>
            <input type="range" min="0" max="10" value="${game.personalRating}" disabled>
            <span>${game.personalRating}</span> 
        </p>
        <button disabled>Delete</button>
        <hr />
    `;

    container.appendChild(gameDiv);
    });
}

renderGames();

