/*
 * All triggers are invisible entities that cause the game engine to
 * act in an unique way.
 */
function Trigger(game, x, y, width, height) {
    this.entity = new Entity(x, y, width, height);
    this.game = game;
    this.entity.intangible = true;
}

Trigger.prototype = {
    draw: function () {
        //Nothing to do.
    },
    
    update: function () {
        //Nothing to do.
    }
}

/*
 * A camera trigger causes the game engine to change its camera focus upon collision.
 */
function CameraTrigger(game, x, y, width, height, focus, type, speedX, speedY) {
    Trigger.call(this, game, x, y, width, height);
    this.focus = focus;
    this.type = type;
    this.speedX = speedX;
    this.speedY = speedY;
}

CameraTrigger.prototype = Object.create(Trigger.prototype);

CameraTrigger.prototype.checkListeners = function(agent) {
    if (agent.entity.controllable) {
        var game = this.game;
        //If the game is already focusing on this trigger's focus, return.
        if (game.cameraAgent === this.focus) return;

        game.camera.frozen = true;
        game.camera.mode = this.type;
        game.cameraAgent = this.focus;
        game.camera.speedX = this.speedX;
        game.camera.speedY = this.speedY;
        game.camera.frozen = false;
        this.entity.collidable = false;
    }
}
    
CameraTrigger.prototype.readInput = function(input) {
    if (input === "reset") {
        this.entity.collidable = true;
    }
}


/*
 * A focus trigger is what a camera trigger will ask the game engine to focus its camera on.
 */
function FocusTrigger(game, x, y) {
    Trigger.call(this, game, x, y, 1, 1);
}

FocusTrigger.prototype = Object.create(Trigger.prototype);


/*
 * A music trigger causes the game engine to change the current song upon collision.
 */
function MusicTrigger(game, x, y, width, height, music) {
    Trigger.call(this, game, x, y, width, height);
    this.music = music;
}

MusicTrigger.prototype = Object.create(Trigger.prototype);
    
MusicTrigger.prototype.checkListeners = function(agent) {
    if (agent.entity.controllable) {
        //Only change the music if it is not currently the one playing.
        if (this.game.music !== this.music) {
            this.game.switchMusic(this.music);
            this.entity.collidable = false;
        }
    }
}

MusicTrigger.prototype.readInput = function(input) {
    if (input === "reset") {
        this.entity.collidable = true;
    }
}

/*
 *
 */
function SpawnTrigger(game, x, y, width, height, agent) {
    Trigger.call(this, game, x, y, width, height);
    this.spawnAgent = agent;
    this.spawnAgent.entity.removeUponReset = true;
    this.agentSpawned = false;
}

SpawnTrigger.prototype = Object.create(Trigger.prototype);


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

/*
 * A music trigger causes the game engine to change the current song upon collision.
 */
function StageTrigger(game, x, y, width, height, stageNumber) {
    Trigger.call(this, game, x, y, width, height);
    this.stageNumber = stageNumber;
}

StageTrigger.prototype = Object.create(Trigger.prototype);
    
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
    if (input === "reset") {
        this.entity.collidable = true;
    }
}


function EntitySwitchTrigger(game, x, y, width, height, entities) {
    Trigger.call(this, game, x, y, width, height);
    this.entities = entities;
    this.currentEntity = 0;
}

EntitySwitchTrigger.prototype = Object.create(Trigger.prototype);

EntitySwitchTrigger.prototype.checkListeners = function (agent) {
    if (agent.entity.controllable) 
    {
        this.entity.collidable = false;
        this.readInput("advance");
    }
}

EntitySwitchTrigger.prototype.readInput = function(input) {
    if (input === "reset") {
        this.entity.collidable = true;
        var index = this.game.agents.indexOf(this.entities[this.currentEntity]);
        if (index > -1) {
            this.game.agents[index] = this.entities[0];
            //Swap entities back on reset
        }
        this.currentEntity = 0;
    }

    //Advance the current entity present.
    if (input === "advance") {
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
