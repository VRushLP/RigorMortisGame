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
