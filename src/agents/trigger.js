/*
 * All triggers are invisible entities that cause the game engine to
 * act in an unique way.
 */

/*
 * A camera trigger causes the game engine to change its camera focus upon collision.
 */
function CameraTrigger(game, AM, x, y, width, height, focus, type, speedX, speedY) {
    this.entity = new Entity(x, y, width, height);
    this.game = game;
    this.focus = focus;
    this.type = type;
    this.speedX = speedX;
    this.speedY = speedY;
    
    this.entity.intangible = true;
}

CameraTrigger.prototype = { 
    draw: function () {
        //Nothing to do.
    },
    
    update: function () {
        //Nothing to do.
    },
    
    checkListeners: function(agent) {
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
    },
    
    readInput: function (input) {
        if (input === "reset") {
            this.entity.collidable = true;
        }
    }
}

/*
 * A focus trigger is what a camera trigger will ask the game engine to focus its camera on.
 */
function FocusTrigger(game, AM, x, y) {
    this.entity = new Entity(x, y, 1, 1);
}

FocusTrigger.prototype = {
    draw: function () {
        //Nothing to do.
    },
    
    update: function () {
        //Nothing to do.
    }
}


/*
 * A music trigger causes the game engine to change the current song upon collision.
 */
function MusicTrigger(game, AM, x, y, width, height, music) {
    this.entity = new Entity(x, y, width, height);
    this.game = game;
    this.music = music;
    this.entity.intangible = true;
}

MusicTrigger.prototype = { 
    draw: function () {
        //Nothing to do.
    },
    
    update: function () {
        //Nothing to do.
    },
    
    checkListeners: function(agent) {
        if (agent.entity.controllable) {
            //Only change the music if it is not currently the one playing.
            if (this.game.music !== this.music) {
                this.game.switchMusic(this.music);
                this.entity.collidable = false;
            }
        }
    },
    
    readInput: function (input) {
        if (input === "reset") {
            this.entity.collidable = true;
        }
    }
}

/*
 *
 */
function SpawnTrigger(game, AM, x, y, width, height, agent) {
    this.entity = new Entity(x, y, width, height);
    this.game = game;
    this.spawnAgent = agent;
    this.spawnAgent.entity.removeUponReset = true;
    this.entity.intangible = true;
    this.agentSpawned = false;
}

SpawnTrigger.prototype = { 
    draw: function () {
        //Nothing to do.
    },
    
    update: function () {
        //Nothing to do.
    },
    
    checkListeners: function(agent) {
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
    },
    
    readInput: function (input) {
        if (input === "reset") {
            this.entity.collidable = true;
        }
    }
}

/*
 * A music trigger causes the game engine to change the current song upon collision.
 */
function StageTrigger(game, AM, x, y, width, height, stageNumber) {
    this.entity = new Entity(x, y, width, height);
    this.game = game;
    this.stageNumber = stageNumber;
    this.entity.intangible = true;
}

StageTrigger.prototype = { 
    draw: function () {
        //Nothing to do.
    },
    
    update: function () {
        //Nothing to do.
    },
    
    checkListeners: function(agent) {
        if (agent.entity.controllable) {
            //Only change the stage if it is not the current one.
            if (this.game.currentStage !== this.stageNumber) {
                this.entity.collidable = false;
                this.game.loadStage(this.stageNumber);
            }
        }
    },
    
    readInput: function (input) {
        if (input === "reset") {
            this.entity.collidable = true;
        }
    }
}