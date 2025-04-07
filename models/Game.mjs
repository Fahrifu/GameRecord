export default class Game {
    constructor({
        title,
        designer,
        artist,
        publisher,
        year,
        players,
        time,
        difficulty,
        url,
        playCount,
        personalRating
    }) {
        this.title = title;
        this.designer = designer;
        this.artist = artist;
        this.publisher = publisher;
        this.year = year;
        this.players = players;
        this.time = time;
        this.difficulty = difficulty;
        this.url = url;
        this.playCount = playCount;
        this.personalRating = personalRating;
    }

    getSummary() {
        return `${this.title} (${this.year}) - ${this.players}, ${this.time}, Rating: ${this.personalRating}/10`;
    }
}