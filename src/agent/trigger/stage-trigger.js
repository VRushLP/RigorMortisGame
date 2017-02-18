/*
 * A stage trigger will change the current stage of the game.
 */
function StageTrigger(game, x, y, width, height, stageNumber) {
    AbstractTrigger.call(this, game, x, y, width, height);
    this.stageNumber = stageNumber;
}

StageTrigger.prototype = Object.create(AbstractTrigger.prototype);

StageTrigger.prototype.checkListeners = function(agent) {
    if (agent.entity.controllable) {
        //Only change the stage if it is not the current one.
        if (this.game.currentStage !== this.stageNumber) {
            this.entity.collidable = false;
            this.game.loadStage(this.stageNumber);
        }
    }
}

StageTrigger.prototype.readInput = function (input) {
    if (input === this.input_types.RESET) {
        this.entity.collidable = true;
    }
}
