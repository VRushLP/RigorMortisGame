var FOREST_STAGE = 0;
var CASTLE_STAGE = 1;

var CAMERA_MODE = {
    INSTANT: 0,
    PAN: 1,
    PAN_THEN_INSTANT: 2
}

var INPUT_TYPES = {
  NONE: "none",

  RIGHT: "right",
  LEFT: "left",
  DOWN: "down",
  UP: "up",

  NOCLIP: "noclip",
  // TODO Combine attack and space so it's easier to read.
  ATTACK: "attack",
  ATTACK_RELEASED: "attack_released",
  SPACE: "space",
  SPACE_RELEASED: "space_released",
  RESET: "reset",

  RIGHT_RELEASED: "right_released",
  LEFT_RELEASED: "left_released",
  UP_RELEASED: "up_released",
  DOWN_RELEASED: "down_released",
  LEFT_AND_RIGHT_RELEASED: "left_and_right_released",

  DAMAGE: "damage",
  HEAL: "heal",

  ADVANCE: "advance",

}

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

/*********
 * Timer *
 *********/

function EngineTimer() {
    this.gameTime = 0;
    this.maxStep = 0.016;
    this.wallLastTimestamp = 0;
}

EngineTimer.prototype = {

    tick: function () {
        var wallCurrent = Date.now();
        var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
        this.wallLastTimestamp = wallCurrent;

        var gameDelta = Math.min(wallDelta, this.maxStep);
        this.gameTime += gameDelta;
        return gameDelta;
    }
}


/********************
 * GameEngine Start *
 ********************/

function GameEngine() {
    this.ctx = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;

    this.stages = [];
    this.agents = [];
    this.removedAgents = [];

    this.jukebox = new Map();
    this.muted = false;
    this.visible = true;
    this.paused = false;
    this.hasFocus = true;

    this.currentMusic = null;
    this.healthBarVisible = false;
    this.stageReset = false;
    
    this.input_types = INPUT_TYPES;

    this.input_types = INPUT_TYPES;

    //Initially set by main before game start.
    this.playerAgent;
    this.cameraAgent;
    this.currentStage;

    this.DEBUG_MODE = 1;
}


GameEngine.prototype = {

    camera: {
        x: 0,
        y: 0,
        speedX: 1,
        speedY: 1,
        mode: CAMERA_MODE.INSTANT,
        frozen: false
    },

    init: function (ctx) {
        this.ctx = ctx;
        this.surfaceWidth = this.ctx.canvas.width;
        this.surfaceHeight = this.ctx.canvas.height;
        this.startInput();
        this.timer = new EngineTimer();
    },

    addAgent : function (agent) {
        this.agents.push(agent);
    },

    addStage : function (stage) {
        this.stages.push(stage);
    },

    loadStage : function (stageNumber) {
        this.currentStage = stageNumber;
        this.agents = [];
        this.removedAgents = [];
        this.agents = this.stages[this.currentStage].entityList;

        this.playerAgent.entity.x = this.stages[this.currentStage].spawnX;
        this.playerAgent.entity.y = this.stages[this.currentStage].spawnY;

        this.playerAgent.readInput(this.input_types.RESET);
        this.agents.push(this.playerAgent);

        this.switchMusic(this.stages[this.currentStage].stageMusic);
        this.stageReset = true;
    },

    resetStage : function () {
        //Re-add removed agents to the game.
        for (var i = 0; i < this.removedAgents.length; i++) {
            if (typeof this.removedAgents[i].readInput === 'function') {
                this.removedAgents[i].readInput(this.input_types.RESET);
            }
            this.agents.push(this.removedAgents[i]);
        }
        this.removedAgents = [];

        //Reset all agents.
        for (var i = 0; i < this.agents.length; i++) {
            if (typeof this.agents[i].readInput === 'function') {
                this.agents[i].readInput(this.input_types.RESET);
            }

            if (this.agents[i].entity.removeUponReset) {
                this.agents[i].entity.removeFromWorld = true;
            }
            this.agents[i].entity.x = this.agents[i].entity.originX;
            this.agents[i].entity.y = this.agents[i].entity.originY;
        }

        //Reset the player's position.
        this.playerAgent.entity.x = this.stages[this.currentStage].spawnX;
        this.playerAgent.entity.y = this.stages[this.currentStage].spawnY;

        //Reset the camera.
        this.camera.frozen = true;
        this.cameraAgent = this.playerAgent;
        this.camera.mode = CAMERA_MODE.INSTANT;
        this.camera.frozen = false;

        //Request to switch to the stage music.
        this.switchMusic(this.stages[this.currentStage].stageMusic);
        this.stageReset = true;
    },

    switchMusic: function (newMusic) {
        if (!this.jukebox.has(newMusic._src)) {
            this.jukebox.set(newMusic._src, newMusic);
        }

        if (this.music !== null && typeof(this.music) !== "undefined") {
            if (this.music === newMusic) return; //Do not restart if the song is already playing.
            else this.jukebox.get(this.music._src).stop();
        }
        this.music = this.jukebox.get(newMusic._src);
        this.jukebox.get(newMusic._src).play();
    },

     /*****************
     * Input Handling *
     ******************/

    startInput : function () {
        var that = this;

        this.ctx.canvas.addEventListener("keydown", function (e) {
            //switch statement is /slightly/ more efficient
            switch (e.which) {
                case 68: //D
                    that.pressRight = true;
                    break;
                case 83: //S
                    that.pressDown = true;
                    break;
                case 65: //A
                    that.pressLeft = true;
                    break;
                case 87: //W
                    that.pressUp = true;
                    break;
                case 78: //N
                    that.pressN = true;
                    break;
                case 32: //SPACE
                    that.pressSpace = true;
                    break;
                //DEBUG ONLY, allows you to ping your location to the console.
                case 66: //B
                    console.log("Current Location: " + that.playerAgent.entity.x +", " + that.playerAgent.entity.y);
                    break;
            }
            e.preventDefault();
        }, false);

        this.ctx.canvas.addEventListener("keyup", function (e) {
            //switch statement is /slightly/ more efficient
            switch (e.which) {
                case 68: //D
                    that.pressRight = false;
                    break;
                case 83: //S
                    that.pressDown = false;
                    break;
                case 65: //A
                    that.pressLeft = false;
                    break;
                case 87: //W
                    that.pressUp = false;
                    break;
                case 78: //N
                    that.pressN = false;
                    break;
                case 32: //SPACE
                    that.pressSpace = false;
                    break;
                case 77: //M;
                    Howler.mute(that.muted = !that.muted);
                    break;
                case 80: //P
                    that.paused = !that.paused;
                    break;
                default:
                    console.log(e.which);
            }
            //console.log(e.which);
            e.preventDefault();
        }, false);

        // "blur" is the name for the event when focus is lost.
        // https://developer.mozilla.org/en-US/docs/Web/Events/blur
        this.ctx.canvas.addEventListener("blur", function() {
            that.hasFocus = false;
        })

        // the event for when focus is gained.
        // https://developer.mozilla.org/en-US/docs/Web/Events/focus
        this.ctx.canvas.addEventListener("focus", function() {
            that.hasFocus = true;
        })

        // visibilitychange is an event on the document, not any particular element of the document
        // "The visibilitychange event is fired when the content of a tab has become visible or has been hidden."
        // This applies to both tab changes and when the browser itself is minimized.
        // https://developer.mozilla.org/en-US/docs/Web/Events/visibilitychange
        document.addEventListener("visibilitychange", function() {
            if (document.visibilityState === 'visible') {
                that.visible = true;
                if (that.music !== 'undefined') {
                    that.music.play()
                }

            } else if (document.visibilityState === 'hidden') {
                that.visible = false;
                if (that.music !== 'undefined') {
                    that.music.pause()
                }
            }
        })
    },


    /*********************
     * GameEngine Upkeep *
     *********************/

    //Entities should check for input when updated here
    update : function () {
        //Iterate backwards to avoid splice errors.
        for (var i = this.agents.length - 1; i >= 0; i--) {
            //If the stage has changed or been reset, then we need to restart the current update loop.
            if (this.stageReset) {
                this.stageReset = false;
                break;
            }
            //If the agent has been flagged for removal, do so; otherwise, update it.
            if (this.agents[i].entity.removeFromWorld) {
                var removedAgent = this.agents.splice(i, 1)[0];
                //Save the removed agent for when the level restarts.
                //If the agent was only temporary, then let it get dereferenced and die.
                if (!removedAgent.entity.temporary) {
                    this.removedAgents.push(removedAgent);
                    removedAgent.entity.removeFromWorld = false;
                }

                //If the removed agent was the player, then respawn them.
                if (removedAgent === this.playerAgent) {
                    this.respawnPlayer();
                }
            } else {
                this.agents[i].update();
            }
        }

        this.updateCamera();
        this.checkPlayerRespawn();
    },

    /**
      * Move the camera to the current position of the focused agent.
      */
    updateCamera: function () {
        //If the camera is frozen, do not update it.
        if (this.camera.frozen) return;

        var entity = this.cameraAgent.entity;
        var cameraAgentX = (this.surfaceWidth / 2) - entity.x - (entity.width / 2);
        var cameraAgentY = entity.y - (entity.height / 2) - (this.surfaceHeight / 2);

        //If the camera is in instant mode, keep it locked on the agent.
        if (this.camera.mode === CAMERA_MODE.INSTANT) {
            this.camera.x = cameraAgentX;
            this.camera.y = cameraAgentY;
        }

        //If the camera is in pan mode, move it towards the agent based on the camera speed.
        if (this.camera.mode === CAMERA_MODE.PAN || this.camera.mode === CAMERA_MODE.PAN_THEN_INSTANT) {
            //If the agent is close enough, snap the camera to it.
            if (Math.abs(cameraAgentX - this.camera.x) <= this.camera.speedX) {
                    this.camera.x = cameraAgentX;
            //Otherwise, move the camera to the left or right, depending on where the agent is.
            } else if (cameraAgentX > this.camera.x) {
                this.camera.x += this.camera.speedX;
            } else {
                this.camera.x -= this.camera.speedX;
            }

            //Use the same logic for moving the camera on the Y axis.
            if (Math.abs(cameraAgentY - this.camera.Y) <= this.camera.speedY) {
                    this.camera.y = cameraAgentY;
            } else if (cameraAgentY > this.camera.y) {
                this.camera.y += this.camera.speedY;
            } else {
                this.camera.y -= this.camera.speedY;
            }
        }

        if (this.camera.mode === CAMERA_MODE.PAN_THEN_INSTANT) {
            if (Math.abs(this.camera.x - cameraAgentX) <= this.camera.speedX &&
                Math.abs(this.camera.y - cameraAgentY) <= this.camera.speedY) {
                this.camera.mode = CAMERA_MODE.INSTANT;
            }
        }

        //Stay in the default X position unless the camera agent is at least half the screen
        //away from the left side of the stage.
        if (entity.x <= (this.surfaceWidth / 2) - (entity.width / 2)) {
            this.camera.x = 0;
        }
    },

    /**
      * Check if the player needs to be respawned, and if so, move them.
      * Currently only checks to see if the player has fallen off the stage.
      */
    checkPlayerRespawn: function () {
        var entity = this.playerAgent.entity;

        if (entity.respawnable && entity.y > this.stages[this.currentStage].stageHeight + 100) {
            this.respawnPlayer();
        }
        this.updateCamera();
    },

    respawnPlayer: function () {
        this.resetStage();
    },




    /************************
     * Movement & Collision *
     ************************/

    /**
     * Move an entity by a requested amount after checking for collision.
     * If a collision is detected, move the entity in a way that a collision does not occur.
     */
    requestMove: function (agent, amountX, amountY) {
        if (!agent.entity.moveable) return;

        //Find the nearest collision and move the entity accordingly.
        var collisionResults = this.findNearestCollision(agent, amountX, amountY);
        agent.entity.x += collisionResults.amountX;
        agent.entity.y += collisionResults.amountY;

        //If we collided, request both agents to check their listeners against each other.
        if (collisionResults.agent !== undefined) {
            if (typeof agent.checkListeners === 'function') {
                agent.checkListeners(collisionResults.agent);
            }
            if (typeof collisionResults.agent.checkListeners === 'function') {
                collisionResults.agent.checkListeners(agent);
            }
        }

        //Prevent unit from moving off left side of screen.
        if (agent.entity.x < 0) agent.entity.x = 0;
    },

    /**
      * Returns the nearest agent that the given one will collide with,
      * along with the distance that can be travelled before the collision will occur.
      */
    findNearestCollision: function (agent, amountX, amountY) {
        var nearestAgent = undefined;
        //Calculate the new sides of the moving entity.
        var entity = agent.entity;
        var newLeft = entity.x + amountX;
        var newRight = newLeft + entity.width;
        var newTop = entity.y + amountY;
        var newBottom = newTop + entity.height;

        for (var i = 0; i < this.agents.length; i++) {
            //Skip collision checking if given agent is not collidable.
            if (!entity.collidable) break;

            var other = this.agents[i].entity;
            //Prevent an entity from colliding with itself.
            if (other === entity) continue;
            //Skip if this entity is collidable.
            if (!other.collidable) continue;

            //Skip if this entity is prespecified to not collide with the moving entity.
            var nonColliderDetected = false;
            if (typeof(entity.nonColliders) !== 'undefined' && entity.nonColliders.length > 0) {
                for (var j = 0; j < entity.nonColliders.length; j++) {
                    if (other === entity.nonColliders[j]) nonColliderDetected = true;
                }
            }
            if (nonColliderDetected) continue;

            var xMoveValid = true;
            var yMoveValid = true;
            var adjustedX = 0;
            var adjustedY = 0;

            //For each side, check if it will be in the same plane as the other entity.
            //If so, determine how far the entity can move before it would be.
            if (other.x <= newLeft && newLeft <= other.x + other.width) {
                if (amountX !== 0) {
                    adjustedX = other.x - entity.x + other.width + 1;
                }
                xMoveValid = false;
            }
            if (other.x <= newRight && newRight <= other.x + other.width) {
                if (amountX !== 0) {
                    adjustedX = other.x - entity.x - entity.width - 1;
                }
                xMoveValid = false;
            }
            if (other.y <= newTop && newTop <= other.y + other.height) {
                if (amountY !== 0) {
                    adjustedY = other.y - entity.y + other.height + 1;
                }
                yMoveValid = false;
            }
            if (other.y <= newBottom && newBottom <= other.y + other.height) {
                if (amountY !== 0) {
                    adjustedY = other.y - entity.y - entity.height - 1;
                }
                yMoveValid = false;
            }

            //Check if other entity would exist vertically inside of this one.
            if (newTop <= other.y && other.y + other.height <= newBottom) {
                adjustedY = 0;
                yMoveValid = false;
            }

            //Check if this entity would exist vertically inside of the other one.
            if (other.y <= newTop && newBottom <= other.y + other.height) {
                adjustedY = 0;
                yMoveValid = false;
            }

            //Check if other entity would exist horizontally inside of this one.
            if (newLeft <= other.x && other.x + other.width <= newRight) {
                adjustedX = 0;
                xMoveValid = false;
            }

            //Check if this entity would exist vertically inside of the other one.
            if (other.x <= newLeft && newRight <= other.x + other.width) {
                adjustedX = 0;
                xMoveValid = false;
            }

            //Collision detected.
            if (!xMoveValid && !yMoveValid) {

                //Temporary fix to allow platforms to move the player.
                if(other.controllable && other.moveable && !agent.entity.intangible) {
                    this.requestMove(this.agents[i], amountX, amountY);
                    if (agent.entity.pushesOnly) {
                       continue;
                    }
                }

                if (typeof this.agents[i].checkListeners === 'function') {
                    this.agents[i].checkListeners(agent);
                }
                if (typeof agent.checkListeners === 'function') {
                    agent.checkListeners(this.agents[i]);
                }

                //Temporary fix to allow intangible objects, like camera triggers, to activate,
                //but not affect the player's movement. Not optimized, as this will activate at any time
                //the player may have collided with it, even if another entity is closer and blocks them.
                if (typeof(other.intangible) !== undefined && other.intangible) {
                    continue;
                }

                //Determine if the colliding entity is the nearest one, and thus the one we should respond to.
                //Then, determine if this collision is any nearer than previous ones, in respect to X and Y.
                if (Math.abs(adjustedX) + Math.abs(adjustedY) <= Math.abs(amountX) + Math.abs(amountY)) {
                    nearestAgent = this.agents[i];
                }
                if (Math.abs(adjustedX) < Math.abs(amountX)) {
                    amountX = adjustedX;
                }

                if (Math.abs(adjustedY) < Math.abs(amountY)) {
                    amountY = adjustedY;
                }
            }
        }

        return {
            agent:nearestAgent,
            amountX:amountX,
            amountY:amountY
        }

    },

    /**
     * Return an array of agents that are colliding with the bottom of the given entity.
     */
    getBottomCollisions: function (agent) {
        var entity = agent.entity;

        var bottomCollisions = [];
        if (!entity.collidable) return bottomCollisions;

        for (var i = 0; i < this.agents.length; i++) {

            var other = this.agents[i].entity;
            if (other === entity) continue; //Prevent an entity from detecting itself.

            //Intangible entities are only for events like triggers, and should not register here.
            if (typeof(other.intangible) !== undefined && other.intangible) continue;
            //An entity must be collidable to count as a collision.
            if (!other.collidable) continue;

            var belowEntity = false;
            //Check if the left side of this entity is within the same plane as the other.
            if (entity.x >= other.x && entity.x <= other.x + other.width) {
                belowEntity = true;
            }
            //Check the right side.
            if (entity.x + entity.width >= other.x && entity.x + entity.width <= other.x + other.width) {
                belowEntity = true;
            }

            //If the entity is in the same vertical plane, check if its bottom is a pixel above the other entity.
            //If both are true, then the entity is directly on top of the other, and then call listeners.
            if (belowEntity) {
                if (entity.y + entity.height >= other.y - 1 && entity.y + entity.height <= other.y + other.height) {
                    bottomCollisions.push(this.agents[i]);

                    if (typeof this.agents[i].checkListeners === 'function') {
                        this.agents[i].checkListeners(agent);
                    }
                    if (typeof agent.checkListeners === 'function') {
                        agent.checkListeners(this.agents[i]);
                    }
                }
            }
        }
        return bottomCollisions;
    },

    /**
     * Return an array of agents that are colliding with the top of the given entity.
     */
    getTopCollisions: function (agent) {
        var entity = agent.entity;

        var topCollisions = [];
        if (!entity.collidable) return topCollisions;

        for (var i = 0; i < this.agents.length; i++) {

            var other = this.agents[i].entity;
            if (other === entity) continue; //Prevent the entity from detecting itself.

            //Intangible entities are only for events like triggers, and should not register here.
            if (typeof(other.intangible) !== undefined && other.intangible) continue;
            //An entity must be collidable to count as a collision.
            if (!other.collidable) continue;

            var aboveEntity = false;
            //Check if the top side of this entity is within the same plane as the other.
            if (entity.x >= other.x && entity.x <= other.x + other.width) {
                aboveEntity = true;
            }
            //Check the bottom side.
            if (entity.x + entity.width >= other.x && entity.x + entity.width <= other.x + other.width) {
                aboveEntity = true;
            }

            if (entity.x <= other.x && entity.x + entity.width >= other.x + other.width) {
                aboveEntity = true;
            }

            if (entity.x >= other.x && entity.x + entity.width <= other.x + other.width) {
                aboveEntity = true;
            }

            //If the entity is in the same horizontal plane, check if its top is a pixel below the other entity.
            //If both are true, then the entity is directly below the other, and then call listeners.
            if (aboveEntity) {
                if (entity.y >= other.y && entity.y <= other.y + other.height + 1) {
                    topCollisions.push(this.agents[i]);

                    if (typeof this.agents[i].checkListeners === 'function') {
                        this.agents[i].checkListeners(agent);
                    }
                    if (typeof agent.checkListeners === 'function') {
                        agent.checkListeners(this.agents[i]);
                    }
                }
            }
        }
        return topCollisions;
    },

    requestInputSend: function (agent, input, modifier) {
        if (typeof agent.readInput === 'function') {
            agent.readInput(input, modifier);
        }
    }
}



//These functions intentionally kept seperate:
GameEngine.prototype.start = function () {
    console.log("starting game");
    this.loadStage(FOREST_STAGE);
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

//Only entities that respond to inputs should check for input.
GameEngine.prototype.loop = function () {
    if (this.visible && this.hasFocus && !this.paused) {
      for(var i = 0; i < this.agents.length; i++) {
          if(this.agents[i].entity.controllable === true) {
              if(this.pressRight && !this.pressLeft) this.agents[i].readInput(this.input_types.RIGHT);
              if(this.pressDown) this.agents[i].readInput(this.input_types.DOWN);
              if(this.pressUp) this.agents[i].readInput(this.input_types.UP);
              if(this.pressLeft && !this.pressRight) this.agents[i].readInput(this.input_types.LEFT);
              if(this.pressLeft && this.pressRight) this.agents[i].readInput(this.input_types.NONE);
              if(this.pressN) this.agents[i].readInput(this.input_types.NOCLIP);
              if(this.pressSpace) this.agents[i].readInput(this.input_types.SPACE);

              if(this.pressRight && this.pressLeft) {
                  this.agents[i].readInput(this.input_types.LEFT_RELEASED);
                  this.agents[i].readInput(this.input_types.RIGHT_RELEASED);
              } else if (!this.pressRight && !this.pressLeft) {
                  this.agents[i].readInput(this.input_types.LEFT_AND_RIGHT_RELEASED)
              }
              if(!this.pressUp) this.agents[i].readInput(this.input_types.UP_RELEASED);
              if(!this.pressLeft) this.agents[i].readInput(this.input_types.LEFT_RELEASED);
              if(!this.pressRight) this.agents[i].readInput(this.input_types.RIGHT_RELEASED);
              if(!this.pressSpace) this.agents[i].readInput(this.input_types.SPACE_RELEASED);

              if(!this.pressLeft && !this.pressRight && !this.pressDown && !this.pressUp && !this.pressSpace) {
                  this.agents[i].readInput(this.input_types.NONE);
              } 
          }
      }

      this.clockTick = this.timer.tick();
      this.update();
      this.draw();
    } else {
        // Deal with being paused here
    }
}

GameEngine.prototype.drawRoundedRect = function(x, y, w, h) {
    var r = 10;
    this.ctx.beginPath();
    this.ctx.moveTo(x+r, y);
    this.ctx.lineTo(x+w-r, y);
    this.ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    this.ctx.lineTo(x+w, y+h-r);
    this.ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    this.ctx.lineTo(x+r, y+h);
    this.ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    this.ctx.lineTo(x, y+r);
    this.ctx.quadraticCurveTo(x, y, x+r, y);
    this.ctx.fill();
}

GameEngine.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.surfaceWidth, this.surfaceHeight);
    this.ctx.save();
    this.stages[this.currentStage].drawBackground(this.camera.x);
    for (var i = 0; i < this.agents.length; i++) {
        //Currently none do, but agents may override their entity's draw.
        if (this.isOnScreen(this.agents[i].entity)) {
            if (typeof this.agents[i].draw === 'function') {
                this.agents[i].draw(this, this.camera.x, this.camera.y);
            } else {
                this.agents[i].entity.draw(this, this.camera.x, this.camera.y);
            }
        }
    }

    this.drawHealthBar();
    this.ctx.restore();
}

GameEngine.prototype.drawHealthBar = function () {
    if (!this.healthBarVisible) return;

    var percent = this.playerAgent.health / KNIGHT_ATTR.STARTING_HEALTH;
    this.ctx.fillStyle = "#2C5D63";
    this.drawRoundedRect(10, 10, 520, 50);
    this.ctx.fillStyle = "black";
    this.drawRoundedRect(20, 20, 500, 30);
    if (percent > 0.4) {
        this.ctx.fillStyle = "#A9C52F";
    } else {
        this.ctx.fillStyle = "red";
    }
    this.drawRoundedRect(20, 20, 500 * percent, 30);
}

/**
  * Return true if the current entity is on screen.
 */
GameEngine.prototype.isOnScreen = function (entity) {
    var onCamera = true;

    if(this.camera.x === 0) {
        //Camera is in default state.
        if(entity.x + entity.width < 0) onCamera = false;
        if(entity.x > this.surfaceWidth) onCamera = false;
    } else {
        if(entity.x + entity.width < (-1 * this.camera.x)) onCamera = false;
        if(entity.x > (-1 * this.cameraX) + this.surfaceWidth) onCamera = false;
    }

    if(entity.y + entity.height < this.camera.y) onCamera = false;
    if(entity.y > this.camera.y + this.surfaceHeight) onCamera = false;

    return onCamera;
}
