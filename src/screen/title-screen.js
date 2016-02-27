function TitleScreen(game, AM, x, y) {
    this.entity = new Entity(game, x, y, 1280, 720);
    this.entity.collidable = false;
    this.canvas;
    
    var titleScreen = new Animation(AM.getAsset("./img/other/title screen.png"), 1280, 720, 0.05, true);
    titleScreen.addFrame(0, 0);
    
    this.entity.addAnimation(titleScreen);
}

TitleScreen.prototype = {
    update: function () {

    },
}