var RM_GLOBALS = {
    
    FOREST_STAGE : {
        SCROLL_SPEED: 10000,
        KNIGHT_SPAWN_X: 0,
        KNIGHT_SPAWN_Y: 0,
    },
}

var AM = new AssetManager();

AM.queueDownload("./img/agents/mushroomdude.png");
AM.queueDownload("./img/knight/knight jump.png");
AM.queueDownload("./img/knight/knight run.png");
AM.queueDownload("./img/knight/knight standing.png");
AM.queueDownload("./img/knight/knight jump flipped.png");
AM.queueDownload("./img/knight/knight run flipped.png");
AM.queueDownload("./img/knight/knight standing flipped.png");
AM.queueDownload("./img/forest-stage/forest sky.png");
AM.queueDownload("./img/forest-stage/forest trees.png");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    
    var knight = new Knight(gameEngine, AM, RM_GLOBALS.FOREST_STAGE.KNIGHT_SPAWN_X, RM_GLOBALS.FOREST_STAGE.KNIGHT_SPAWN_Y);
    gameEngine.addAgent(knight);
    knight.entity.controllable = true;
    knight.entity.moveable = true;
    knight.entity.fallable = true;
    knight.entity.camerable = true;
    knight.entity.respawnable = true;
    
    var mushroomWall = new MushroomDude(gameEngine, AM, 500, 50);
    gameEngine.addAgent(mushroomWall);
    
    var mushroomFloor = new MushroomDude(gameEngine, AM, 0, 500);
    gameEngine.addAgent(mushroomFloor);
    
    var mushroomFloor2 = new MushroomDude(gameEngine, AM, 400, 650);
    gameEngine.addAgent(mushroomFloor2);
    
    var forestStage = new Stage(ctx, 0, 350);
    forestStage.addBackground(AM.getAsset("./img/forest-stage/forest sky.png"), 0);
    forestStage.addBackground(AM.getAsset("./img/forest-stage/forest trees.png"), RM_GLOBALS.FOREST_STAGE.SCROLL_SPEED);
    gameEngine.addStage(forestStage);
    
    
    for (var i = 0; i < 10; i++) {
        if(i === 3 || i === 5 || i === 8) continue;
        var mushroomLoopFloor = new MushroomDude(gameEngine, AM, 190 * i + 590, 650);
        gameEngine.addAgent(mushroomLoopFloor);
    }
    
    gameEngine.start();
});