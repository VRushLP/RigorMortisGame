var BLOCKS_GLOBALS = {
    WIDTH: 50,
    HEIGHT: 50,
    FRAME_DURATION: 1,
}

function Block(game, AM, x, y) {
    this.entity = new Entity(game, x, y, BLOCKS_GLOBALS.WIDTH, BLOCKS_GLOBALS.HEIGHT);
    
    var NormalState = new Animation(AM.getAsset("./img/forest-stage/forest block.png"), BLOCKS_GLOBALS.WIDTH, BLOCKS_GLOBALS.HEIGHT, BLOCKS_GLOBALS.FRAME_DURATION, true);
    NormalState.addFrame(0, 0);
    
    this.entity.addAnimation(NormalState);
    this.entity.setAnimation(0);
}

Block.prototype = { 
    
    draw: function () {
        this.entity.draw();
    },
    
    update: function () {
        //Nothing to do.
    }
}