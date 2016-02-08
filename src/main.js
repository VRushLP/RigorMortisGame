var RM_GLOBALS = {
    
    //This should be moved into the forest stage eventually.
    FOREST_STAGE: {
        SKY_SCROLL_SPEED: 100000,
        TREE_SCROLL_SPEED: 10000,
        KNIGHT_SPAWN_X: 0,
        KNIGHT_SPAWN_Y: 800,
    },
}

//This should eventually be moved into the data for an individual level
//Perhaps these could be passed in to levels as we make them and then we can call <StageVar>.playBGM() ?
//One area of concern is that the way these currently loaded in to the page. It's probably embedded music in the page queueing and finishing that causes the burst of slowdown.
//I don't mind the magic numbers so much here, since I think they're only used here and they have particular timestamps, but we could make them globals if enough people hate them.
var BGM = {
   forestLevel : new Howl({
        urls: ['./snd/bloody_tears.mp3'],
        volume: .1,
        loop: true
   }),

   townBoss: new Howl({
       urls: ['./snd/cornered.mp3'],
       volume: .1,
       loop: true,
       onend: function () {
           BGM.townBoss.pos(7.27); //Skips the intro
       }
   }),

    castleLevel : new Howl({
    urls: ['./snd/awake.mp3'],
    volume: .1,
    loop: true,
    onend: function () {
        BGM.castleLevel.pos(17.93); //Skips the intro
        }
    }),

    hellBossFinal: new Howl({
        urls: ['./snd/megalovania.mp3'],
        volume: .15,
        loop: true,
        onend: function () {
            BGM.hellBossFinal.pos(1.966);
        }
    }),
}

var AM = new AssetManager();

AM.queueDownload("./img/knight/knight jump draft.png");
AM.queueDownload("./img/knight/knight run draft.png");
AM.queueDownload("./img/knight/knight standing.png");
AM.queueDownload("./img/knight/knight jump draft flipped.png");
AM.queueDownload("./img/knight/knight run draft flipped.png");
AM.queueDownload("./img/knight/knight standing flipped.png");
AM.queueDownload("./img/forest-stage/forest sky.png");
AM.queueDownload("./img/forest-stage/forest trees.png");
AM.queueDownload("./img/forest-stage/forest block.png");
AM.queueDownload("./img/enemy/skeletonChaser mockup.png")

AM.queueStageDownload("./txt/forest-stage.txt");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    
    var forestStage = new Stage(ctx, gameEngine, RM_GLOBALS.FOREST_STAGE.KNIGHT_SPAWN_X, RM_GLOBALS.FOREST_STAGE.KNIGHT_SPAWN_Y);
    forestStage.addBackground(AM.getAsset("./img/forest-stage/forest sky.png"), RM_GLOBALS.FOREST_STAGE.SKY_SCROLL_SPEED);
    forestStage.addBackground(AM.getAsset("./img/forest-stage/forest trees.png"), RM_GLOBALS.FOREST_STAGE.TREE_SCROLL_SPEED);
    forestStage.parseLevelFile(AM.getAsset("./txt/forest-stage.txt").split("\n"), AM);    
    
    var knight = new Knight(gameEngine, AM, forestStage.spawnX, forestStage.spawnY);
    knight.entity.controllable = true;
    knight.entity.moveable = true;
    knight.entity.fallable = true;
    knight.entity.camerable = true;
    knight.entity.respawnable = true;
    forestStage.entityList.push(knight);
    
    var platform = new Platform(gameEngine, AM, 50, 1800, 3, 1);
    platform.addMovePattern(400, 1, 0, 0);
    platform.addMovePattern(0, 0, 200, -1);
    platform.addMovePattern(400, -1, 0, 0);
    forestStage.entityList.push(platform);
    platform.addMovePattern(0, 0, 200, 1);
    
    var skeleton = new Skeleton(gameEngine, AM, 350, 2040);
    forestStage.entityList.push(skeleton);
    
    gameEngine.addStage(forestStage);

    //BGM.forestLevel.play();
    //BGM.castleLevel.play();
    //BGM.townBoss.play();
    BGM.hellBossFinal.play();

    gameEngine.start();
    gameEngine.requestMove(knight, RM_GLOBALS.FOREST_STAGE.KNIGHT_SPAWN_X, RM_GLOBALS.FOREST_STAGE.KNIGHT_SPAWN_Y); //Reset camera
});