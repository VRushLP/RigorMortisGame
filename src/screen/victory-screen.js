function VictoryScreen(game, AM, x, y) {
    this.entity = new Entity(x, y, 1280, 720);
    this.entity.collidable = false;   
    
    var victoryScreen = new Animation(AM.getAsset("./img/other/victory screen.png"), 1280, 720, 0.05, true);
    victoryScreen.addFrame(0, 0);
    
    this.entity.addAnimation(victoryScreen);
}

VictoryScreen.prototype = {
    update: function () {
        //Nothing to do
    }
}