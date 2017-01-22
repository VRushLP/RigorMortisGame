/*
 * A focus trigger is what a camera trigger will ask the game engine to focus its camera on.
 * Focus triggers are unique in that they do not have any listeners nor do they make any requests of the game engine.
 */
function FocusTrigger(game, x, y) {
    Trigger.call(this, game, x, y, 1, 1);
}

FocusTrigger.prototype = Object.create(Trigger.prototype);
