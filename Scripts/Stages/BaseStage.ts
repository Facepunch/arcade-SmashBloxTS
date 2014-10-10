var FADE_FRAME_COUNT: number = 6;
var FADE_DURATION: number = 0.25;

var SWATCH_RGBS: number[] = [
    0x0000FC, 0x0078F8, 0x3CBCFC, 0x0078F8, 0x0000FC,
    0x940084, 0xD800CC, 0xF878F8, 0xD800CC, 0x940084,
    0xA81000, 0xF83800, 0xF87858, 0xF83800, 0xA81000,
    0x503000, 0xAC7C00, 0xF8B800, 0xAC7C00, 0x503000,
    0x007800, 0x00B800, 0xB8F818, 0x00B800, 0x007800
];

var swatches: GameAPI.BudgetBoy.Swatch[] = null;

class Particle {
    position: GameAPI.Vector2f;
    velocity: GameAPI.Vector2f;
    lifetime: number;

    constructor(position: GameAPI.Vector2f, velocity: GameAPI.Vector2f, lifetime: number) {
        this.position = position;
        this.velocity = velocity;
        this.lifetime = lifetime;
    }

    update(dt: number) {
        this.position = this.position.add(this.velocity.mul(dt));
        this.lifetime -= dt;
    }

    shouldRemove(): boolean { return this.lifetime <= 0; }
};

interface State extends Function { }

class BaseStage extends GameAPI.BudgetBoy.Stage {
    private _fadeTiles: GameAPI.BudgetBoy.Tilemap;
    private _curFadeVal: number;

    private _swatchIndex: number;

    private _particles: Particle[];
    private _coroutines: State[];

    private __stage: GameAPI.BudgetBoy.Stage;

    onEnter() {
        if (swatches == null) {
            swatches = [];
            for (var i = 0; i < SWATCH_RGBS.length; ++i) {
                var clr = SWATCH_RGBS[i];
                swatches[i] = graphics.palette.findSwatch(clr, clr, clr);
            }
        }

        this._particles = [];
        this._coroutines = [];

        this._swatchIndex = 0;

        var tileSize = new GameAPI.Vector2i(40, 40);
        this._fadeTiles = this.add(new GameAPI.BudgetBoy.Tilemap(tileSize, graphics.size.divVec(tileSize)), Number.MAX_VALUE);
    }

    setFadeTiles(val: number) {
        var iVal = Math.round(Math.max(0.0, Math.min(1.0, val)) * FADE_FRAME_COUNT);

        if (iVal == this._curFadeVal) return;

        this._curFadeVal = iVal;

        var image = graphics.getImage("transition", iVal.toString());
        var swatch = graphics.palette.findSwatch(0x000000, 0x000000, 0x000000);

        for (var r = 0; r < this._fadeTiles.rows; ++r) {
            for (var c = 0; c < this._fadeTiles.columns; ++c) {
                this._fadeTiles.setTile(c, r, image, swatch);
            }
        }
    }

    fadeIn(after: State): State {
        var totalFrames = Math.max(1, Math.round(FADE_DURATION * game.updateRate));
        var currFrame = 0;

        this.setFadeTiles(1.0);

        var fade: (self: BaseStage) => State = (self) => {
            if (currFrame >= totalFrames) return after;
            this.setFadeTiles(1 - ++currFrame / totalFrames);
            return fade;
        };

        return fade;
    }

    fadeOut(after: State): State {
        var totalFrames = Math.max(1, Math.round(FADE_DURATION * game.updateRate));
        var currFrame = 0;

        this.setFadeTiles(1.0);

        var fade: (self: BaseStage) => State = (self) => {
            if (currFrame >= totalFrames) return after;
            this.setFadeTiles(++currFrame / totalFrames);
            return fade;
        };

        return fade;
    }

    waitForInput(after: (input: GameAPI.Control) => State): State {
        var wait: (self: BaseStage) => State = (self) => {
            if (controls.a.justPressed) return after(controls.a);
            if (controls.b.justPressed) return after(controls.b);
            if (controls.start.justPressed) return after(controls.start);
            if (controls.select.justPressed) return after(controls.select);
            if (!controls.analog.isZero) return after(controls.analog);

            return wait;
        };

        return wait;
    }

    wait(delay: number, after: State): State {
        var initTime = game.time;

        var wait: (self: BaseStage) => State = (self) => {
            if ((game.time - initTime) >= delay) return after;
            return wait;
        };

        return wait;
    }

    flashSwatches(): State {
        this.nextSwatch();
        return this.wait(1 / 16, this.flashSwatches);
    }

    nextSwatch() {
        this._swatchIndex = (this._swatchIndex + 1) % swatches.length;
        this.onSwatchChanged(this.getCurrentSwatch());
    }

    onSwatchChanged(swatch: GameAPI.BudgetBoy.Swatch) { }

    getCurrentSwatch(): GameAPI.BudgetBoy.Swatch {
        return swatches[this._swatchIndex];
    }

    addParticle(position: GameAPI.Vector2f, velocity: GameAPI.Vector2f, lifetime: number) {
        this._particles.push(new Particle(position, velocity, lifetime));
    }

    startCoroutine(initialState: State) {
        this._coroutines.push(initialState);
    }

    updateCoroutines() {
        for (var i = this._coroutines.length - 1; i >= 0; --i) {
            if (!(this._coroutines[i] = this._coroutines[i].call(this))) {
                this._coroutines.splice(i, 1);
            }
        }
    }

    onUpdate() {
        this.updateCoroutines();

        var indices = [];

        for (var i = 0; i < this._particles.length; i++) {
            this._particles[i].update(this.timestep);

            if (this._particles[i].shouldRemove()) {
                indices.push(i);
            }
        }

        for (var i = 0; i < indices.length; i++) {
            this._particles.splice(indices[i], 1);
        }
    }

    onRender() {
        for (var i = 0; i < this._particles.length; i++) {
            var position = this._particles[i].position;
            graphics.drawPoint(0, 1, new GameAPI.Vector2i(position.x, position.y));
        }

        this._fadeTiles.render(graphics);
    }
}
