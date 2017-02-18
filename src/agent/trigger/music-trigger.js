/*
 * A music trigger causes the game engine to change the current song upon collision.
 */
function MusicTrigger(game, x, y, width, height, music) {
    AbstractTrigger.call(this, game, x, y, width, height);
    this.music = music;
}

MusicTrigger.prototype = Object.create(AbstractTrigger.prototype);

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
    if (input === this.input_types.RESET) {
        this.entity.collidable = true;
    }
}
