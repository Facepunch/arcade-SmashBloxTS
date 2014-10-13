class GameEntity extends GameAPI.BudgetBoy.Entity {
    getStage(): GameStage {
        return <GameStage> this.stage;
    }
}
