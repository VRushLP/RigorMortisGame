function EntitySwitchTrigger(game, x, y, width, height, entities) {
    AbstractTrigger.call(this, game, x, y, width, height);
    this.entities = entities;
    this.currentEntity = 0;
}

EntitySwitchTrigger.prototype = Object.create(AbstractTrigger.prototype);

EntitySwitchTrigger.prototype.checkListeners = function (agent) {
    if (agent.entity.controllable)
    {
        this.entity.collidable = false;
        this.readInput(this.input_types.ADVANCE);
    }
}

EntitySwitchTrigger.prototype.readInput = function(input) {
    if (input === this.input_types.RESET) {
        this.entity.collidable = true;
        var index = this.game.agents.indexOf(this.entities[this.currentEntity]);
        if (index > -1) {
            this.game.agents[index] = this.entities[0];
            //Swap entities back on reset
        }
        this.currentEntity = 0;
    }

    //Advance the current entity present.
    if (input === this.input_types.ADVANCE) {
        if (this.currentEntity + 1 >= this.entities.length) {
            return;
        }
        var index = this.game.agents.indexOf(this.entities[this.currentEntity]);
        if (index > -1) {
            this.game.agents[index] = this.entities[++this.currentEntity];
            //Swap entities
        }
    }
}
