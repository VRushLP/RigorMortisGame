var RM_GLOBALS = {
    
    //This should be moved into the forest stage eventually.
    FOREST_STAGE : {
        SCROLL_SPEED: 10000,
        KNIGHT_SPAWN_X: 0,
        KNIGHT_SPAWN_Y: 800,
    },
}

//This should eventually be moved into the data for an individual level
var BGM = {
   forest : new Howl({
        urls: ['./snd/bloody_tears.mp3'],
        volume: .1,
        loop: true
    }),

    castle : new Howl({
    urls: ['./snd/awake.mp3'],
    volume: .1,
    loop: true,
    onend: function () {
        awake.pos(17.925); //Skips the intro
        }
    }),
}

var AM = new AssetManager();

AM.queueDownload("./img/knight/knight jump.png");
AM.queueDownload("./img/knight/knight run.png");
AM.queueDownload("./img/knight/knight standing.png");
AM.queueDownload("./img/knight/knight jump flipped.png");
AM.queueDownload("./img/knight/knight run flipped.png");
AM.queueDownload("./img/knight/knight standing flipped.png");
AM.queueDownload("./img/forest-stage/forest sky.png");
AM.queueDownload("./img/forest-stage/forest trees.png");
AM.queueDownload("./img/forest-stage/forest block.png");

AM.queueStageDownload("./txt/forest-stage.txt");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    
    var forestStage = new Stage(ctx, gameEngine, 0, 350);
    forestStage.addBackground(AM.getAsset("./img/forest-stage/forest sky.png"), 0);
    forestStage.addBackground(AM.getAsset("./img/forest-stage/forest trees.png"), RM_GLOBALS.FOREST_STAGE.SCROLL_SPEED);
    forestStage.parseLevelFile(AM.getAsset("./txt/forest-stage.txt").split("\n"), AM);    
    
    var knight = new Knight(gameEngine, AM, forestStage.spawnX, forestStage.spawnY);
    knight.entity.controllable = true;
    knight.entity.moveable = true;
    knight.entity.fallable = true;
    knight.entity.camerable = true;
    knight.entity.respawnable = true;
    forestStage.entityList.push(knight);
    
    gameEngine.addStage(forestStage);

    BGM.forest.play();
    gameEngine.start();
    gameEngine.requestMove(knight.entity, 0, 0); //Reset camera
});