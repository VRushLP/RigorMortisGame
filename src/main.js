var AM = new AssetManager();

var RM_GLOBALS = {

    //This should be moved into the forest stage eventually.
    FOREST_STAGE: {
        SKY_SCROLL_SPEED: 100000,
        TREE_SCROLL_SPEED: 10000,
        KNIGHT_SPAWN_X: 0,
        KNIGHT_SPAWN_Y: 800,
    },
};

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

   forestBoss: new Howl({
       urls: ['./snd/stronger_monsters.mp3'],
       volume: .1,
       loop: true,
       //onend: function () {
       //    BGM.forestBoss.pos(10.322); //Skips the intro
       //}
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
    
    victoryFanfare: new Howl({
        urls: ['./snd/fanfare.mp3'],
        volume: .15,
        loop: false,
    })
};

AM.queueDownload("./img/knight/knight jump.png");
AM.queueDownload("./img/knight/knight run.png");
AM.queueDownload("./img/knight/knight standing.png");
AM.queueDownload("./img/knight/knight jump flipped.png");
AM.queueDownload("./img/knight/knight run flipped.png");
AM.queueDownload("./img/knight/knight standing flipped.png");
AM.queueDownload("./img/knight/knight attack.png");
AM.queueDownload("./img/knight/knight attack flipped.png");
AM.queueDownload("./img/forest-stage/forest sky.png");
AM.queueDownload("./img/forest-stage/forest trees.png");
AM.queueDownload("./img/forest-stage/forest block.png");
AM.queueDownload("./img/castle-stage/castle block.png");
AM.queueDownload("./img/enemy/chaser.png");
AM.queueDownload("./img/enemy/archer.png");
AM.queueDownload("./img/enemy/wisp.png");
AM.queueDownload("./img/enemy/forest boss/forest boss spike 50px.png");
AM.queueDownload("./img/enemy/forest boss/forest boss spike 100px.png");
AM.queueDownload("./img/enemy/forest boss/forest boss spike 150px.png");
AM.queueDownload("./img/enemy/forest boss/forest boss platform.png");
AM.queueDownload("./img/enemy/forest boss/forest boss weak point.png");
AM.queueDownload("./img/other/victory screen.png");
AM.queueDownload("./img/other/title screen.png");

AM.queueStageDownload("./txt/forest-stage.txt");

/*
Download all the elements and add entities to the game.
*/
AM.downloadAll(function () {
    console.log("Initializing world");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
    var gameEngine = new GameEngine();
    gameEngine.init(ctx);

    var forestStage = new Stage(gameEngine, STAGE_TYPE.FOREST, BGM.forestLevel);
    forestStage.addBackground(AM.getAsset("./img/forest-stage/forest sky.png"), RM_GLOBALS.FOREST_STAGE.SKY_SCROLL_SPEED);
    forestStage.addBackground(AM.getAsset("./img/forest-stage/forest trees.png"), RM_GLOBALS.FOREST_STAGE.TREE_SCROLL_SPEED);
    forestStage.parseLevelFile(AM.getAsset("./txt/forest-stage.txt").split("\n"), AM);

    var knight = new Knight(gameEngine, AM, forestStage.spawnX, forestStage.spawnY);
    knight.entity.controllable = true;
    knight.entity.moveable = true;
    knight.entity.camerable = true;
    knight.entity.respawnable = true;
    forestStage.entityList.push(knight);
    
    var firstPlatform = new Platform(gameEngine, AM, 2650, 650, 4, 1);
    firstPlatform.addMovePattern(350, 2, 0, 0);
    firstPlatform.addMovePattern(350, -2, 0, 0);
    forestStage.entityList.push(firstPlatform);

    var secondPlatform = new Platform(gameEngine, AM, 3200, 1300, 4, 1);
    secondPlatform.addMovePattern(450, -3, 0, 0);
    secondPlatform.addMovePattern(450, 3, 0, 0);
    forestStage.entityList.push(secondPlatform);
    
    var bossCameraFocus = new FocusTrigger(gameEngine, AM, 3660, 1940);
    var bossCameraTrigger = new CameraTrigger(gameEngine, AM, 3149, 1701, 50, 148, bossCameraFocus, CAMERA_MODE.PAN, 3, 3);
    var bossMusicTrigger = new MusicTrigger(gameEngine, AM, 3149, 1701, 50, 148, BGM.forestBoss);

    var newInvisiwall = new Invisiblock(gameEngine, AM, 3051, 1701, 50, 148);
    var spawnTrigger = new SpawnTrigger(gameEngine, AM, 3149, 1701, 50, 148, newInvisiwall);

    forestStage.entityList.push(bossCameraTrigger);
    forestStage.entityList.push(bossMusicTrigger);
    forestStage.entityList.push(spawnTrigger);
    
    var forestBoss = new ForestBoss(gameEngine, AM, 3101, 2250, forestStage);
    var bossSpawnTrigger = new SpawnTrigger(gameEngine, AM, 3149, 1701, 50, 148, forestBoss);
    forestStage.entityList.push(bossSpawnTrigger);
    
    for (var i = 0; i < 3; i ++) {
        var exitBlock = new Block(gameEngine, AM, 4251, 2101 + i * 50);
        forestBoss.exitAgents.push(exitBlock);
        forestStage.entityList.push(exitBlock);
    }
    
    var victoryCameraFocus = new FocusTrigger(gameEngine, AM, 7639, 1361);
    var victoryMusicTrigger = new MusicTrigger(gameEngine, AM, 4550, 2101, 50, 148, BGM.victoryFanfare);
    
    var victoryScreen = new VictoryScreen(gameEngine, AM, 7000, 1000);
    forestStage.entityList.push(victoryScreen);
    
    var victoryCameraTrigger = new CameraTrigger(gameEngine, AM, 4550, 2101, 50, 148, victoryCameraFocus, CAMERA_MODE.INSTANT);
    forestStage.entityList.push(victoryCameraTrigger);    
    forestStage.entityList.push(victoryMusicTrigger);
    
    gameEngine.addStage(forestStage);

    gameEngine.playerAgent = knight;
    gameEngine.cameraAgent = knight;

    var titleScreen = new TitleScreen(gameEngine, AM, 0, 1664);
    forestStage.entityList.push(titleScreen);

    canvas.addEventListener('focus', function (event) {
        gameEngine.agents.splice(gameEngine.agents.indexOf(titleScreen, 1));
    }, false);

    gameEngine.start();
});
