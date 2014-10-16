/// <reference path="BaseStage.ts"/>

class EnterScoreStage extends BaseStage {
    private _completed: boolean;
    private _score: number;

    private _headerSprite: GameAPI.BudgetBoy.Sprite;
    private _newHighscoreSprite = null;

    private _charTexts = [];

    private _curChar = 0;
    private _curIndex = 0;

    private _whiteSwatch;

    private _validChars = "_abcdefghijklmnopqrstuvwxyz0123456789".toUpperCase().split("");

    constructor(completed: boolean, score: number) {
        super();

        this._completed = completed;
        this._score = score;
    }

    onEnter() {
        super.onEnter();

        graphics.setClearColor(GameAPI.BudgetBoy.SwatchIndex.BLACK);

        var headerImage = this._completed ? graphics.getImage("yourewinner") : graphics.getImage("gameover");

        var swatch = graphics.palette.findSwatch(0xffffff, 0xffffff, 0xffffff);

        this._headerSprite = this.add(new GameAPI.BudgetBoy.Sprite(headerImage, swatch), 0);
        this._headerSprite.x = (graphics.width - headerImage.width) / 2;
        this._headerSprite.y = graphics.height - headerImage.height - 8;

        var font = graphics.getImage("font");

        var text = this.add(new GameAPI.BudgetBoy.Text(font, swatch), 0);
        text.value = "FINAL SCORE: " + this._score;
        text.x = (graphics.width - text.width) / 2;
        text.y = this._headerSprite.y - text.height - 16;

        if (game.isScoreHighscore(this._score)) {
            this.startCoroutine(this.beginEnterInitials(text.y));
        } else {
            this.startCoroutine(waitForInput(() => game.showHighscores()));
        }

        this.startCoroutine(this.flashSwatches);
        this.startCoroutine(this.fadeIn(null));
    }

    onSwatchChanged(swatch: GameAPI.BudgetBoy.SwatchIndex) {
        this._headerSprite.swatchIndex = swatch;

        if (this._newHighscoreSprite) {
            this._newHighscoreSprite.swatch = swatch;
        }
    }

    // States
    
    beginEnterInitials(textY): State {
        var font = graphics.getImage("font");
        this._whiteSwatch = graphics.palette.findSwatch(0xffffff, 0xffffff, 0xffffff);

        var newHighscoreImage = graphics.getImage("newhighscore");

        this._newHighscoreSprite = this.add(new GameAPI.BudgetBoy.Sprite(newHighscoreImage, this.getCurrentSwatch()), 0);
        this._newHighscoreSprite.x = (graphics.width - newHighscoreImage.width) / 2;
        this._newHighscoreSprite.y = textY - newHighscoreImage.height - 16;

        var text = this.add(new GameAPI.BudgetBoy.Text(font, this._whiteSwatch), 0);
        text.value = "ENTER YOUR INITIALS";
        text.x = (graphics.width - text.width) / 2;
        text.y = this._newHighscoreSprite.y - text.height - 8;

        textY = text.y - text.charSize.y - 8;

        var dx = text.charSize.x + 4;
        var x = (graphics.width - dx * 3) / 2 + 2;

        this._charTexts.push(this.add(new GameAPI.BudgetBoy.Text(font, this._whiteSwatch), 0));
        this._charTexts[0].value = "A";
        this._charTexts[0].x = (x += dx) - dx;
        this._charTexts[0].y = textY;

        this._charTexts.push(this.add(new GameAPI.BudgetBoy.Text(font, this._whiteSwatch), 0));
        this._charTexts[1].value = "A";
        this._charTexts[1].x = (x += dx) - dx;
        this._charTexts[1].y = textY;

        this._charTexts.push(this.add(new GameAPI.BudgetBoy.Text(font, this._whiteSwatch), 0));
        this._charTexts[2].value = "A";
        this._charTexts[2].x = (x += dx) - dx;
        this._charTexts[2].y = textY;

        return this.enterInitials;
    }

    enterInitials() : State {
        this._charTexts[this._curChar].swatch = this.getCurrentSwatch();
        this._curIndex = this._validChars.indexOf(this._charTexts[this._curChar].value[0]);

        if (controls.a.justPressed || (this._curChar < 2 && controls.analog.x.justBecamePositive)) {
            this._charTexts[this._curChar].swatch = this._whiteSwatch;
            ++this._curChar;
        }
        else if (this._curChar > 0 && (controls.b.justPressed || controls.analog.x.justBecameNegative)) {
            this._charTexts[this._curChar].swatch = this._whiteSwatch;
            --this._curChar;
        }
        else if (controls.analog.y.justBecameNegative) {
            this._curIndex = (this._curIndex + 1) % this._validChars.length;
            this._charTexts[this._curChar].value = this._validChars[this._curIndex];
        }
        else if (controls.analog.y.justBecamePositive) {
            this._curIndex = (this._curIndex + this._validChars.length - 1) % this._validChars.length;
            this._charTexts[this._curChar].value = this._validChars[this._curIndex];
        }
        else if (controls.start.justPressed) {
            this._curChar = 3;
        }

        if (this._curChar >= 3) {
            return this.fadeOut(() => {
                var initials = "";

                for (var i = 0; i < this._charTexts.length; ++i) {
                    initials += this._charTexts[i].value;
                }

                game.submitAndShowHighscores(new GameAPI.Highscore(initials, this._score));
                return null;
            });
        }

        return this.enterInitials;
    }
}
