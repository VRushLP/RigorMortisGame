function HealthPotion(game, AM, x, y) {
    this.entity = new Entity(x, y, 50, 50);
    this.game = game;
    this.input_types = game.input_types;

    var potionFrame = new Animation(AM.getAsset("./img/enemy/potion.png"), 50, 50, 0.17, true);
    potionFrame.addFrame(0, 0);
    this.entity.animationList.push(potionFrame);
}

HealthPotion.prototype = {

    update : function(){
        // Nothing to do.
    },

    checkListeners: function (agent) {
        if (agent.entity.controllable) {
            this.game.requestInputSend(agent, this.input_types.HEAL);
            this.entity.removeFromWorld = true;
        }
    }
}
