/*
 * Spawn triggers will create an agent, often upon collision with the player character.
 */
function SpawnTrigger(game, x, y, width, height, agent) {
    AbstractTrigger.call(this, game, x, y, width, height);
    this.spawnAgent = agent;
    this.spawnAgent.entity.removeUponReset = true;
    this.agentSpawned = false;
}

SpawnTrigger.prototype = Object.create(AbstractTrigger.prototype);


SpawnTrigger.prototype.checkListeners = function(agent) {
    if (agent.entity.controllable) {
        if (!this.agentSpawned) {
            this.game.agents.push(this.spawnAgent);
        } else {
            var removedAgents = this.game.removedAgents;
            for (var i = 0; i < removedAgents.length; i++) {
                if (removedAgents[i] === this.spawnAgent) {
                    this.game.agents.push(removedAgents[i]);
                    removedAgents.splice(i, 1);
                    break;
                }
            }
        }
        this.entity.collidable = false;
        this.agentSpawned = true;
    }
}

SpawnTrigger.prototype.readInput = function(input) {
    if (input === "reset") {
        this.entity.collidable = true;
    }
}
