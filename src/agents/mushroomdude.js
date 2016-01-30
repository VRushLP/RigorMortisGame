var REST_ANIMATION = 0;
var WALKING_ANIMATION = 1;
var JUMPING_ANIMATION = 2;
var TERMINAL_VELOCITY = 15;
var JUMP_VELOCITY = 10;

function MushroomDude(game, AM, x, y) {
    this.entity = new Entity(game, x , y, 189, 220);
    this.velocity = 0;
    
    this.TEST_FALLS = false;

    var MushroomRest = new Animation(AM.getAsset("./img/agents/mushroomdude.png"), 189, 220, 0.10, true);
    MushroomRest.addFrame(0, 480);
    
    this.entity.addAnimation(MushroomRest);
}

MushroomDude.prototype.draw = function () {
    this.entity.draw();
}

MushroomDude.prototype.update = function() {
    
}