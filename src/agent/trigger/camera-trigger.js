/*
 * A camera trigger causes the game engine to change its camera focus upon collision.
 */
function CameraTrigger(game, x, y, width, height, focus, type, speedX, speedY) {
    AbstractTrigger.call(this, game, x, y, width, height);
    this.focus = focus;
    this.type = type;
    this.speedX = speedX;
    this.speedY = speedY;
}

CameraTrigger.prototype = Object.create(AbstractTrigger.prototype);

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
    if (input === this.input_types.RESET) {
        this.entity.collidable = true;
    }
}
