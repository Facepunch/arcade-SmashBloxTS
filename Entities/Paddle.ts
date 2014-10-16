/// <reference path="GameEntity.ts"/>

class Paddle extends GameEntity {
    private _midImage: GameAPI.BudgetBoy.Image;

    private _leftEndSprite: GameAPI.BudgetBoy.Sprite;
    private _rightEndSprite: GameAPI.BudgetBoy.Sprite;
    private _midSprites: GameAPI.BudgetBoy.Sprite[];

    private _swatch: GameAPI.BudgetBoy.SwatchIndex;

    private _size: number;
    private _sizeChanged: boolean;

    private _moveSpeed: number;

    constructor(size: number, moveSpeed: number) {
        super();

        this.setSize(size);
        this._moveSpeed = moveSpeed;

        this._midSprites = [];
    }

    getSize(): number {
        return this._size;
    }

    setSize(size: number) {
        this._size = size;
        this._sizeChanged = true;
    }

    resize() {
        this._sizeChanged = false;

        this.localBounds = new GameAPI.RectF(-this._size * 4 - 2, 2, this._size * 4 + 2, 0);

        this.setSpriteOffset(this._leftEndSprite, new GameAPI.Vector2i(-this.getSize() * 4 - this._leftEndSprite.width, -2));
        this.setSpriteOffset(this._rightEndSprite, new GameAPI.Vector2i(this.getSize() * 4, -2));

        for (var i = 0; i < this._midSprites.length; i++) {
            this.remove(this._midSprites[i]);
        }

        this._midSprites = [];

        for (var i = 0; i < this.getSize(); i++) {
            var midSprite = this.add(new GameAPI.BudgetBoy.Sprite(this._midImage, this._swatch), new GameAPI.Vector2i(-this.getSize() * 4 + i * 8, -2));
            this._midSprites.push(midSprite);
        }
    }

    getNextX() {
        var dx = controls.cursorPosition.x - this.x;
        var maxDx = this._moveSpeed * this.stage.timestep;

        if (dx < -maxDx) dx = -maxDx;
        else if (dx > maxDx) dx = maxDx;

        var margin = 8 + this.getSize() * 4;

        var p = this.x + dx;

        if (p < margin) p = margin;
        if (p > graphics.width - margin) p = graphics.width - margin;

        return p;
    }

    onUpdate(dt: number) {
        this.x = this.getNextX();
    }

    onLoadGraphics() {
        var endImage = graphics.getImage("paddle", "end");
        this._midImage = graphics.getImage("paddle", "mid");

        this._swatch = graphics.palette.findSwatch(0xffffff, 0xffffff, 0xffffff);

        this._leftEndSprite = this.add(new GameAPI.BudgetBoy.Sprite(endImage, this._swatch));
        this._rightEndSprite = this.add(new GameAPI.BudgetBoy.Sprite(endImage, this._swatch));

        this._rightEndSprite.flipX = true;
    }

    onRender() {
        if (this._sizeChanged) this.resize();
    }
}
