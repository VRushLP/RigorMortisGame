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

    update: function () {
        //Nothing to do.
    }
}

/*
 * Invisiblock is to be used for invisible walls/platforms of variable length.
 */
function Invisiblock(game, AM, x, y, width, height) {
    this.entity = new Entity(game, x, y, width, height);
}

Invisiblock.prototype = {
    draw: function () {
        //Nothing to do.
    },

    update: function () {
        //Nothing to do.
    }
}

function backgroundObject(game, AM, x, y, imgSource) {

    this.image = AM.getAsset(imgSource);
    this.entity = new Entity(game, x, y, this.image.width, this.image.height);
    this.entity.collidable = false;

    var normalState = new Animation(this.image, this.image.width, this.image.height, BLOCKS_GLOBALS.FRAME_DURATION, true);
    normalState.addFrame(0, 0);

    this.entity.addAnimation(normalState);
    this.entity.setAnimation(0);

}

backgroundObject.prototype = {
    update: function() {

    }
}