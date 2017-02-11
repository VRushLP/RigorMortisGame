/*
 * All triggers are invisible entities that cause the game engine to
 * act in an unique way.
 */
function AbstractTrigger(game, x, y, width, height) {
    this.entity = new Entity(x, y, width, height);
    this.game = game;
    this.entity.intangible = true;
}

AbstractTrigger.prototype = {    
    update: function () {
        //Nothing to do.
    }
}
