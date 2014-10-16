/// <reference path="../../TypeScript/GameAPI.ts"/>

/// <reference path="Stages/AttractStage.ts"/>
/// <reference path="Stages/GameStage.ts"/>
/// <reference path="Stages/EnterScoreStage.ts"/>
/// <reference path="Stages/HighscoreStage.ts"/>

function setupGameInfo(info: GameAPI.GameInfo) {
    info.api = "GameAPI.BudgetBoy";

    info.title = "Smash Blox";
    info.authorName = "James King";
    info.authorContact = "james.king@facepunchstudios.com";
    info.description = "Like Breakout but cheaper!";

    info.updateRate = 60;
}

function setupGraphicsInfo(info: GameAPI.GraphicsInfo) {
    info.width = 200;
    info.height = 160;
}

class SmashBlox {
    private _demo: GameAPI.Demo = null;

    private _countdownImages: GameAPI.BudgetBoy.Image[];
    private _countdownSprite: GameAPI.BudgetBoy.Sprite;

    onLoadResources(volume: GameAPI.ResourceCollection) {
        this._demo = volume.get("GameAPI.Demo", "attract");

        this._countdownImages = [];
        for (var i = 1; i <= 10; ++i) {
            this._countdownImages.push(graphics.getImage("countdown", i.toString()));
        }

        var swatch = graphics.palette.findSwatch(0x000000, 0xffffff, 0x000000);

        this._countdownSprite = new GameAPI.BudgetBoy.Sprite(this._countdownImages[0], swatch);
        this._countdownSprite.position = graphics.size.sub(this._countdownSprite.size).div(2);
    }

    onLoadPalette(palette: GameAPI.BudgetBoy.PaletteBuilder) {
        palette.add(0x0000FC, 0x0078F8, 0x3CBCFC);
        palette.add(0x940084, 0xD800CC, 0xF878F8);
        palette.add(0xA81000, 0xF83800, 0xF87858);
        palette.add(0x503000, 0xAC7C00, 0xF8B800);
        palette.add(0x007800, 0x00B800, 0xB8F818);
    }

    onReset() {
        game.setStage(new AttractStage(this._demo));
    }

    start() {
        game.setStage(new GameStage());
    }

    enterHighscore(completed, score) {
        game.setStage(new EnterScoreStage(completed, score));
    }

    showHighscores() {
        game.setStage(new HighscoreStage());
    }

    submitAndShowHighscores(highscore) {
        game.submitHighscore(highscore);
        game.setStage(new HighscoreStage(highscore));
    }

    onSetupInitialScores() {
        game.addInitialScore(new GameAPI.Highscore("AAA", 100));
        game.addInitialScore(new GameAPI.Highscore("RLY", 90));
        game.addInitialScore(new GameAPI.Highscore("LAY", 80));
        game.addInitialScore(new GameAPI.Highscore("BUC", 70));
        game.addInitialScore(new GameAPI.Highscore("ROB", 60));
        game.addInitialScore(new GameAPI.Highscore("ZKS", 50));
        game.addInitialScore(new GameAPI.Highscore("IAN", 40));
        game.addInitialScore(new GameAPI.Highscore("GAR", 30));
        game.addInitialScore(new GameAPI.Highscore("JON", 20));
        game.addInitialScore(new GameAPI.Highscore("IVN", 10));
    }

    onRenderPauseScreen(timeUntilReset: number) {
        game.renderPausedFrame();

        var index = Math.max(0, Math.min(9, Math.floor(timeUntilReset)));
        this._countdownSprite.image = this._countdownImages[index];
        this._countdownSprite.render(graphics);
    }
}

game = new SmashBlox();
