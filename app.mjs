import Game from "./models/Game.mjs";

const GAME_PREFIX = "game_"
let sortKey = "";


let games = getAllGames();
renderGames();
bindUIEvents();

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

function deleteGame(title) {
    localStorage.removeItem(`${GAME_PREFIX}${title}`);
    games = games.filter(g => g.title !== title);
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
            renderGames();
            bindUIEvents();
        } catch (err) {
            console.error("Failed", err);
        }
    };
    reader.readAsText(file);
})

function renderGames() {
    const container = document.getElementById("gameList");
    container.innerHTML = "";

    [...games]
    .sort((a, b) => sortGamesBy(a, b, sortKey))
    .forEach(game => {
        const gameDiv = document.createElement("div");
        gameDiv.classList.add("game-record");

        gameDiv.innerHTML = `
        <h2>${game.title}</h2>
        <p><strong>Year:</strong> ${game.year}</p>
        <p><strong>Designer:</strong> ${game.designer}</p>
        <p><strong>Play Count:</strong> 
        <input type="number" class="playCountInput" min="0" value="${game.playCount}" data-title="${game.title}">
        </p>
        <p><strong>Rating:</strong>
            <input type="range" min="0" max="10" value="${game.personalRating}" class="ratingSlider" data-title="${game.title}">
            <span class="ratingValue">${game.personalRating}</span> 
        </p>
        <button class="editBtn" data-title="${game.title}">Edit</button>
        <button class="deleteBtn" data-title="${game.title}">Delete</button>
        <hr />
    `;

    container.appendChild(gameDiv);
    });
}

function enableEditMode(title) {
    const game = games.find(g => g.title === title);
    if (!game) return;

    const container = document.getElementById("gameList");
    const editForm = document.createElement("form");
    editForm.classList.add("editForm");

    editForm.innerHTML = `
    <h2>Edit: ${game.title}</h2>
    <input type="text" name="designer" value="${game.designer}" required />
    <input type="text" name="artist" value="${game.artist}" required />
    <input type="text" name="publisher" value="${game.publisher}" required />
    <input type="number" name="year" value="${game.year}" required />
    <input type="text" name="players" value="${game.players}" required />
    <input type="text" name="time" value="${game.time}" required />
    <input type="text" name="difficulty" value="${game.difficulty}" required />
    <input type="url" name="url" value="${game.url}" required />
    <input type="number" name="playCount" value="${game.playCount}" required />
    <input type="range" name="personalRating" min="0" max="10" value="${game.personalRating}" />
    <span id="editRatingPreview">${game.personalRating}</span>/10
    <br />
    <button type="submit">Save</button>
    <button type="button" id="cancelEdit">Cancel</button>
    `;

    container.innerHTML = "";
    container.appendChild(editForm);

    editForm.personalRating.addEventListener("input", e => {
        document.getElementById("editRatingPreview").textContent = e.target.value;
    });

    document.getElementById("cancelEdit").addEventListener("click", () => {
        renderGames();
        bindUIEvents();
    });

    editForm.addEventListener("submit", e => {
        e.preventDefault();
        const formData = new FormData(editForm);
        const updatedData = Object.fromEntries(formData.entries());

        game.designer = updatedData.designer;
        game.artist = updatedData.artist;
        game.publisher = updatedData.publisher;
        game.year = parseInt(updatedData.year);
        game.players = updatedData.players;
        game.time = updatedData.time;
        game.difficulty = updatedData.difficulty;
        game.url = updatedData.url;
        game.playCount = parseInt(updatedData.playCount);
        game.personalRating = parseInt(updatedData.personalRating);

        saveGame(game);
        renderGames();
        bindUIEvents;

    });
}

function sortGamesBy(a, b, key) {
    if (!key) return 0;

    if (key === "players") {
        const getMin = str => parseInt(str);
        return getMin(a.players) - getMin(b.players);
    }

    if (key === "difficulty") {
        const scale = { Light: 1, "Medium": 2, "Medium-Heavy": 3, Heavy: 4};
        return (scale[a.difficulty] || 0) - (scale[b.difficulty] || 0);
    }

    return (a[key] || 0) - (b[key] || 0);
}

function bindUIEvents() {
    document.querySelectorAll(".ratingSlider").forEach(slider => {
        slider.addEventListener("input", (e) => {
            const title = e.target.dataset.title;
            const newRating = parseInt(e.target.value);
            const game = games.find(g => g.title === title);
            if (game) {
                game.personalRating = newRating;
                saveGame(game);
                e.target.nextElementSibling.textContent = newRating;
            }
        });
    });

    document.querySelectorAll(".playCountInput").forEach(input => {
        input.addEventListener("input", (e) => {
            const title = e.target.dataset.title;
            const newCount = parseInt(e.target.value);
            const game = games.find(g => g.title === title);
            if (game) {
                game.playCount = newCount;
                saveGame(game);
            }
        });
    });

    document.querySelectorAll(".deleteBtn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const title = e.target.dataset.title;
            if (confirm(`Delete: "${title}" from your collection?`)) {
                deleteGame(title);
                renderGames();
                bindUIEvents();
            }
        });
    });

    document.querySelectorAll(".editBtn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const title = e.target.dataset.title;
            enableEditMode(title);
        });
    });
}

document.querySelector("input[name='personalRating']").addEventListener("input", e => {
    document.getElementById("ratingPreview").textContent = e.target.value;
});

document.getElementById("addGameForm").addEventListener("submit", e => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const newGameData = Object.fromEntries(formData.entries());

    newGameData.year = parseInt(newGameData.year);
    newGameData.playCount = parseInt(newGameData.playCount);
    newGameData.personalRating = parseInt(newGameData.personalRating);

    // Check for Duplicates
    if (games.some(g => g.title === newGameData.title)) {
        alert("A game with this title already exists.");
        return;
    }

    const newGame = new Game(newGameData);

    saveGame(newGame);
    games.push(newGame);

    renderGames();
    bindUIEvents();

    form.reset()
    document.getElementById("ratingPreview").textContent = "5";
});

document.getElementById("sortGames").addEventListener("change", (e) => {
    sortKey = e.target.value;
    renderGames();
    bindUIEvents();
});


document.getElementById("exportBtn").addEventListener("click", () => {
    const allGames = getAllGames();
    const json = JSON.stringify(allGames, null, 2);

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "GameRecord.json";
    a.click();

    URL.revokeObjectURL(url);
})
