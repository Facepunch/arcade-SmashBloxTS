/// <reference path="BaseStage.ts"/>

/// <reference path="../Entities/Ball.ts"/>
/// <reference path="../Entities/Paddle.ts"/>
/// <reference path="../Entities/BlockGrid.ts"/>

class GameStage extends BaseStage {
    private _ball: Ball;
    private _paddle: Paddle;
    private _blocks: BlockGrid;

    private _score: number;
    private _combo: number;
    private _lives: number;

    private _scoreText: GameAPI.BudgetBoy.Text;
    private _livesText: GameAPI.BudgetBoy.Text;

    onEnter() {
        super.onEnter();

        graphics.setClearColor(GameAPI.BudgetBoy.SwatchIndex.BLACK);

        this._ball = this.add(new Ball(), 1);
        this._paddle = this.add(new Paddle(4, 200), 0);
        this._blocks = this.add(new BlockGrid(12, 8), 0);

        this._paddle.x = graphics.width / 2;
        this._paddle.y = 8;

        this._blocks.x = 4;
        this._blocks.y = graphics.height - 68 - 12;

        var font = graphics.getImage("font");
        var white = graphics.palette.findSwatch(0xffffff, 0xffffff, 0xffffff);

        this._scoreText = this.add(new GameAPI.BudgetBoy.Text(font, white), 1);
        this._scoreText.x = 4;
        this._scoreText.y = graphics.height - 12;

        this._livesText = this.add(new GameAPI.BudgetBoy.Text(font, white), 1);
        this._livesText.y = graphics.height - 12;

        this.setScore(0);
        this.setLives(3);

        for (var y = 0; y < this._blocks.getRows(); ++y) {
            for (var x = 0; x < this._blocks.getColumns(); ++x) {
                if ((x + (y / 2) * 3 + 1) % 6 <= 1) continue;

                this._blocks.setPhase(x, y, 1 + (y % this._blocks.getPhases()));
            }
        }

        this._ball.isVisible = false;

        this.startCoroutine(this.particleSpam);
        this.startCoroutine(this.fadeIn(this.newBall));
    }

    getBlocks(): BlockGrid {
        return this._blocks;
    }

    getPaddle(): Paddle {
        return this._paddle;
    }

    setScore(score: number) {
        this._score = score;
        this._scoreText.value = "SCORE " + score;
    }

    addScore(delta: number) {
        this.setScore(this._score + delta);
    }

    setLives(lives: number) {
        this._lives = lives;
        this._livesText.value = lives + " LIVES";
        this._livesText.x = graphics.width - this._livesText.width - 4;
    }

    onBlockHit() {
        this.addScore(++this._combo);
    }

    onPaddleHit() {
        this._combo = 0;
    }

    // States

    particleSpam(): State {
        if (this._ball.isVisible) {
            this.addParticle(this._ball.position,
                new GameAPI.Vector2f(Math.random() * 16.0 - 8.0, Math.random() * 16.0 - 8.0), Math.random() * 0.25 + 0.25);
        }

        return wait(1 / 30, this.particleSpam);
    }

    newBall(): State {
        this._ball.x = this._paddle.getNextX();
        this._ball.y = this._paddle.y + 8;
        this._ball.isVisible = true;

        this._ball.setVelocity(GameAPI.Vector2f.ZERO);
        this._ball.setAlive(true);

        this._combo = 0;

        return this.serving;
    }

    serving(): State {
        this._ball.x = this._paddle.getNextX();

        if (controls.a.justPressed) {
            this._ball.setVelocity(new GameAPI.Vector2f(this._paddle.getNextX() > this._paddle.x ? 1.0 : -1.0, 1.5).mul(96.0));
            return this.playing;
        }

        return this.serving;
    }

    lostBall(): State {
        audio.play(audio.getSound("miss"), 0.0, 1.0, 1.0);

        var canContinue = this._lives > 0;

        if (canContinue) {
            this.setLives(this._lives - 1);

            this._ball.setVelocity(GameAPI.Vector2f.ZERO);
            this._ball.isVisible = false;
            this._ball.setAlive(false);
        }

        return wait(0.5, () => {
            if (canContinue) {
                return this.newBall;
            } else {
                return this.gameOver;
            }
        });
    }

    playing(): State {
        if (this._ball.y < 4.0) {
            return this.lostBall;
        } else {
            return this.playing;
        }
    }

    gameOver(): State {
        return this.fadeOut(() => game.enterHighscore(false, this._score));
    }
}
