/// <reference path="GameEntity.ts"/>

class Ball extends GameEntity {
    private _paddleHit: GameAPI.BudgetBoy.Sound;
    private _blockHit: GameAPI.BudgetBoy.Sound;
    private _velocity: GameAPI.Vector2f;
    private _alive: boolean;

    onLoadAudio() {
        this._paddleHit = audio.getSound("bounce2");
        this._blockHit = audio.getSound("bounce");
    }

    onLoadGraphics() {
        var img = graphics.getImage("ball");
        var swatch = graphics.palette.findSwatch(0xffffff, 0xffffff, 0xffffff);

        this.add(new GameAPI.BudgetBoy.Sprite(img, swatch), new GameAPI.Vector2i(-2, -2));

        this.calculateBounds();
    }

    setVelocity(velocity: GameAPI.Vector2f) {
        this._velocity = velocity;
    }

    setAlive(alive: boolean) {
        this._alive = alive;
    }

    bounce(normal: GameAPI.Vector2f, scale: number) {
        var dot = this._velocity.dot(normal);

        if (dot >= 0) return;

        this._velocity = this._velocity.sub(normal.mul(dot).mul(1 + scale));
    }

    onUpdate() {
        if (!this._alive) return;

        this.position = this.position.add(this._velocity.mul(this.stage.timestep));
        this.updateCollision();
    }

    updateCollision() {
        if (this.x < 8.0) {
            this.x = 8.0;
            this.bounce(GameAPI.Vector2f.UNIT_X, 1.0);
            audio.play(this._paddleHit, this.panValue, 1.0, 1.0);
        }
        else if (this.x > graphics.width - 8.0) {
            this.x = graphics.width - 8.0;
            this.bounce(new GameAPI.Vector2f(-1, 0), 1.0);
            audio.play(this._paddleHit, this.panValue, 1.0, 1.0);
        }

        if (this.y > graphics.height - 20.0) {
            this.y = graphics.height - 20.0;
            this.bounce(new GameAPI.Vector2f(0, -1.0), 1.0);
            audio.play(this._paddleHit, this.panValue, 1.0, 1.0);
        }

        if (this.bounds.intersects(this.getStage().getPaddle().bounds)) {
            this.bounce(GameAPI.Vector2f.UNIT_Y, 1.0);

            this.getStage().onPaddleHit();

            audio.play(this._paddleHit, this.panValue, 1.0, 1.0);
        }

        var collisionResult = this.getStage().getBlocks().checkForCollision(this);

        if (collisionResult.hit) {
            if (collisionResult.getNormal().x > 0) {
                this.bounce(GameAPI.Vector2f.UNIT_X, 1.0);
            }
            else if (collisionResult.getNormal().x < 0) {
                this.bounce(new GameAPI.Vector2f(-1, 0), 1.0);
            }

            if (collisionResult.getNormal().y > 0) {
                this.bounce(GameAPI.Vector2f.UNIT_Y, 1.0);
            }
            else if (collisionResult.getNormal().y < 0) {
                this.bounce(new GameAPI.Vector2f(0, -1), 1.0);
            }

            audio.play(this._blockHit, this.panValue, 1.0, 1.0 - Math.log(collisionResult.phase) / Math.LN10 / 2.0);
        }
    }
}
