/// <reference path="../../../TypeScript/GameAPI.d.ts"/>
/// <reference path="../../../TypeScript/GameAPI.BudgetBoy.d.ts"/>

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

function defaultEqualityTest(a: any, b: any): boolean {
    return a.equals(b);
}

function arrayContains<T>(arr: Array<T>, value: T, test?: (a: T, b: T) => boolean): boolean {
    test = test || defaultEqualityTest;

    for (var i = 0; i < arr.length; ++i) {
        if (test(arr[i], value)) return true;
    }

    return false;
}

class SmashBlox {
    private _demo: GameAPI.Demo = null;

    onLoadResources(volume: GameAPI.ResourceCollection) {
        this._demo = volume.get("GameAPI.Demo", "attract");
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
}

declare var game: any;
game = new SmashBlox();
