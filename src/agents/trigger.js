/*
 * All triggers are invisible entities that cause the game engine to
 * act in an unique way.
 */

/*
 * A camera trigger causes the game engine to change its camera focus upon collision.
 */
function CameraTrigger(game, AM, x, y, width, height, focus, type, speedX, speedY) {
    this.entity = new Entity(game, x, y, width, height);
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
            var game = this.entity.game;
            //If the game is already focusing on this trigger's focus, return.
            if (game.cameraAgent === this.focus) return;
    
            game.camera.frozen = true;
            game.camera.mode = this.type;
            game.cameraAgent = this.focus;
            game.camera.speedX = this.speedX;
            game.camera.speedY = this.speedY;
            game.camera.frozen = false;
        }
    }
}

/*
 * A focus trigger is what a camera trigger will ask the game engine to focus its camera on.
 */
function FocusTrigger(game, AM, x, y) {
    this.entity = new Entity(game, x, y, 1, 1);
}

FocusTrigger.prototype = {
    draw: function () {
        //Nothing to do.
    },
    
    update: function () {
        //Nothing to do.
    }
}