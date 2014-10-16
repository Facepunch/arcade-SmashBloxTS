/// <reference path="BaseStage.ts"/>

class HighscoreEntry extends GameAPI.BudgetBoy.Entity {
    rank: number;
    highscore: GameAPI.Highscore;

    private _rankText: GameAPI.BudgetBoy.Text;
    private _nameText: GameAPI.BudgetBoy.Text;
    private _scoreText: GameAPI.BudgetBoy.Text;

    constructor(rank, highscore) {
        super();

        this.rank = rank;
        this.highscore = highscore;
    }

    getSwatch(): GameAPI.BudgetBoy.SwatchIndex {
        return this._rankText.swatchIndex;
    }

    setSwatch(swatch: GameAPI.BudgetBoy.SwatchIndex) {
        this._rankText.swatchIndex = swatch;
        this._nameText.swatchIndex = swatch;
        this._scoreText.swatchIndex = swatch;
    }

    onLoadGraphics() {
        var font = graphics.getImage("font");
        var swatch = graphics.palette.findSwatch(0xffffff, 0xffffff, 0xffffff);

        var width = graphics.width * 0.6;

        this.localBounds = new GameAPI.RectF(0, 0, width, font.height / 16);

        this._rankText = new GameAPI.BudgetBoy.Text(font, swatch);
        this._rankText.value = this.rank.toString();

        this.add(this._rankText, GameAPI.Vector2i.UNIT_X.mul(-3 * this._rankText.charSize.x - this._rankText.width).div(2));

        this._nameText = new GameAPI.BudgetBoy.Text(font, swatch), GameAPI.Vector2i.UNIT_X.mul(5 * this._rankText.charSize.x);
        this._nameText.value = this.highscore.initials;

        this.add(this._nameText);

        this._scoreText = new GameAPI.BudgetBoy.Text(font, swatch);
        this._scoreText.value = this.highscore.score.toString();

        this.add(this._scoreText, GameAPI.Vector2i.UNIT_X.mul(Math.floor(width - this._scoreText.width)));
    }
}

class HighscoreStage extends BaseStage {
    private _highscore: GameAPI.Highscore;

    private _title: GameAPI.BudgetBoy.Sprite;

    private _entries: HighscoreEntry[];
    private _newEntry: HighscoreEntry;

    constructor(score?: GameAPI.Highscore) {
        super();

        this._highscore = score;
    }

    onEnter() {
        super.onEnter();

        graphics.setClearColor(GameAPI.BudgetBoy.SwatchIndex.BLACK);

        var titleImage = graphics.getImage("highscores");

        this._title = this.add(new GameAPI.BudgetBoy.Sprite(titleImage, this.getCurrentSwatch()), 0);
        this._title.x = (graphics.width - titleImage.width) / 2;
        this._title.y = graphics.height - titleImage.height - 4;

        var scoreCount = 10;

        this._entries = [];

        var i;

        for (i = 0; i < scoreCount; ++i) {
            if (i >= game.highscoreCount) break;

            var highscoreEntry = this.add(new HighscoreEntry(i + 1, game.getHighscore(i)), 0);
            highscoreEntry.position = new GameAPI.Vector2f(graphics.width * 0.2, graphics.height - 20 - (i + 1) * 12);

            this._entries.push(highscoreEntry);
        }

        if (this._highscore) {
            for (i = 0; i < this._entries.length; ++i) {
                if (this._entries[i].highscore.equals(this._highscore)) {
                    this._newEntry = this._entries[i];
                    break;
                }
            }
        }

        this.startCoroutine(this.flashSwatches);
        this.startCoroutine(this.fadeIn(waitForInput((input) => this.fadeOut(() => game.reset()))));
    }

    onSwatchChanged(swatch: GameAPI.BudgetBoy.SwatchIndex) {
        this._title.swatchIndex = swatch;

        if (this._newEntry) {
            this._newEntry.setSwatch(swatch);
        }
    }
}
