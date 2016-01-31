var ENTITY_WIDTH = 50;
var ENTITY_HEIGHT = 50;

function ForestBlock(game, AM, x, y) {
    this.entity = new Entity(game, x , y, ENTITY_WIDTH, ENTITY_HEIGHT);
    
    var NormalState = new Animation(AM.getAsset("./img/forest-stage/forest block.png"), 50, 50, 0.10, true);
    NormalState.addFrame(0, 0);
    
    this.entity.addAnimation(NormalState);
    this.entity.setAnimation(0);
}

ForestBlock.prototype = { 
    
    draw: function () {
        this.entity.draw();
    },
    
    update: function () {
        //Nothing to do.
    }
}