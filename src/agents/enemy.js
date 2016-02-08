var ENEMY_GLOBALS = {
    WIDTH: 50,
    HEIGHT: 50,
    FRAME_DURATION: 1,
}

function Enemy(game, AM, x, y) {
    this.entity = new Entity(game, x, y, ENEMY_GLOBALS.WIDTH, ENEMY_GLOBALS.HEIGHT);

    var NormalState = new Animation(AM.getAsset("./img/forest-stage/forest block.png"), ENEMY_GLOBALS.WIDTH, ENEMY_GLOBALS.HEIGHT, ENEMY_GLOBALS.FRAME_DURATION, true);
    NormalState.addFrame(0, 0);

    this.entity.addAnimation(NormalState);
    this.entity.setAnimation(0);
}

Enemy.prototype = {

    draw: function () {
        this.entity.draw();
    },

    update: function () {
    }
}

function Skeleton(game, AM, x, y) {
    Enemy.call(game, AM, x, y);
}

Skeleton.prototype = Enemy.prototype;