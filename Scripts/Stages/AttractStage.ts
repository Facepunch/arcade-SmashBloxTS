/// <reference path="BaseStage.ts"/>

class AttractStage extends BaseStage {
    private _demo: GameAPI.Demo;
    private _frame: number;

    private _title: GameAPI.BudgetBoy.Sprite;
    private _insertCoin: GameAPI.BudgetBoy.Sprite;

    private _showScores: boolean;

    constructor(demo: GameAPI.Demo) {
        super();

        this._demo = demo;
        this._demo.isLooping = true;

        this._frame = 0;
    }

    onEnter() {
        super.onEnter();

        var text = graphics.getImage("title");

        this._title = this.add(new GameAPI.BudgetBoy.Sprite(text, this.getCurrentSwatch()), 0);
        this._title.position = graphics.size.sub(this._title.size).div(2).sub(GameAPI.Vector2i.UNIT_Y.mul(8));

        text = graphics.getImage("insertcoin");

        var swatch = graphics.palette.findSwatch(0xffffff, 0xffffff, 0xffffff);

        this._insertCoin = this.add(new GameAPI.BudgetBoy.Sprite(text, swatch), 0);
        this._insertCoin.position = graphics.size.sub(this._insertCoin.size).div(2).sub(GameAPI.Vector2i.UNIT_Y.mul(graphics.height / 4));

        this.startCoroutine(this.flashSwatches);
        this.startCoroutine(this.insertCoinFlash);

        this.startCoroutine(this.fadeIn(waitForInput((input) => this.fadeOut(() => {
            if (input == controls.b || input == controls.select) {
                return game.showHighscores();
            } else {
                return game.start();
            }
        }))));
    }

    insertCoinFlash(): State {
        this._insertCoin.isVisible = !this._insertCoin.isVisible;
        return wait(1 / 2, this.insertCoinFlash);
    }

    onUpdate() {
        super.onUpdate();

        ++this._frame;
    }

    onSwatchChanged(swatch: GameAPI.BudgetBoy.Swatch) {
        this._title.swatch = swatch;
    }

    onRender() {
        this._demo.render(graphics, audio, this._frame, 0.25);

        super.onRender();
    }
}
