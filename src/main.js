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

var BGM = {
   forestLevel : new Howl({
        src: ['./snd/bloody_tears.mp3'],
        volume: .1,
        loop: true
   }),

   forestBoss: new Howl({
       src: ['./snd/stronger_monsters.mp3'],
       volume: .1,
       loop: true,
       onend: function () {
           BGM.forestBoss.seek(10.322); //Skips the intro
       }
   }),

   townBoss: new Howl({
       src: ['./snd/cornered.mp3'],
       volume: .1,
       loop: true,
       onend: function () {
           BGM.townBoss.seek(7.27); //Skips the intro
       }
   }),

    castleLevel : new Howl({
        src: ['./snd/awake.mp3'],
        volume: .1,
        loop: true,
        onend: function () {
            BGM.castleLevel.seek(17.93); //Skips the intro
        }
    }),

    hellBossFinal: new Howl({
        src: ['./snd/megalovania.mp3'],
        volume: .15,
        loop: true,
        onend: function () {
            BGM.hellBossFinal.seek(1.966);
        }
    }),
    
    victoryFanfare: new Howl({
        src: ['./snd/fanfare.mp3'],
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
AM.queueDownload("./img/enemy/arrow.png");
AM.queueDownload("./img/enemy/wisp.png");
AM.queueDownload("./img/enemy/death anim.png");
AM.queueDownload("./img/enemy/forest boss/forest boss spike 50px.png");
AM.queueDownload("./img/enemy/forest boss/forest boss spike 100px.png");
AM.queueDownload("./img/enemy/forest boss/forest boss spike 150px.png");
AM.queueDownload("./img/enemy/forest boss/forest boss platform.png");
AM.queueDownload("./img/enemy/forest boss/forest boss weak point.png");
AM.queueDownload("./img/enemy/forest boss/forest boss background.png");
AM.queueDownload("./img/enemy/forest boss/forest boss statue idle.png");
AM.queueDownload("./img/enemy/forest boss/forest boss statue active.png");
AM.queueDownload("./img/other/victory screen.png");
AM.queueDownload("./img/other/title screen.png");

AM.queueStageDownload("./txt/forest-stage.txt");
AM.queueStageDownload("./txt/castle-stage.txt");

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

    var graveyard = new backgroundObject(gameEngine, AM, 3101, 1671, "./img/enemy/forest boss/forest boss background.png");
    forestStage.entityList.push(graveyard);
    var forestBossStatueIdle = new backgroundObject(gameEngine, AM, 3351, 1701, "./img/enemy/forest boss/forest boss statue idle.png");
    var forestBossStatueActive = new backgroundObject(gameEngine, AM, 3351, 1701, "./img/enemy/forest boss/forest boss statue active.png");
    forestStage.entityList.push(forestBossStatueIdle);

    forestStage.parseLevelFile(AM.getAsset("./txt/forest-stage.txt").split("\n"), AM);

    var knight = new Knight(gameEngine, AM, forestStage.spawnX, forestStage.spawnY);
    knight.entity.controllable = true;
    knight.entity.moveable = true;
    knight.entity.camerable = true;
    knight.entity.respawnable = true;
    
    var firstPlatform = new Platform(gameEngine, AM, 2650, 650, 4, 1, STAGE_TYPE.FOREST);
    firstPlatform.addMovePattern(350, 2, 0, 0);
    firstPlatform.addMovePattern(350, -2, 0, 0);
    forestStage.entityList.push(firstPlatform);

    var secondPlatform = new Platform(gameEngine, AM, 3200, 1300, 4, 1, STAGE_TYPE.FOREST);
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

    var bossActivateTrigger = new EntitySwitchTrigger(gameEngine, 3149, 2000, 1100, 100, forestBossStatueActive, forestBossStatueIdle);
    forestStage.entityList.push(bossActivateTrigger);
    
    for (var i = 0; i < 3; i ++) {
        var exitBlock = new Block(gameEngine, AM, 4251, 2101 + i * 50);
        forestBoss.exitAgents.push(exitBlock);
        forestStage.entityList.push(exitBlock);
    }
    
    var castleStageTrigger = new StageTrigger(gameEngine, AM, 4550, 2101, 50, 148, 1);
    forestStage.entityList.push(castleStageTrigger);
    
    var castleStage = new Stage(gameEngine, STAGE_TYPE.CASTLE, BGM.castleLevel);
    castleStage.parseLevelFile(AM.getAsset("./txt/castle-stage.txt").split("\n"), AM);
    
    var testPlatform = new Platform(gameEngine, AM, 650, 1200, 2, 1, STAGE_TYPE.FOREST);
    var testPlatform2 = new Platform(gameEngine, AM, 650, 1200, 2, 1, STAGE_TYPE.FOREST);
    var testPlatform3 = new Platform(gameEngine, AM, 650, 1200, 2, 1, STAGE_TYPE.FOREST);
    var testPlatform4 = new Platform(gameEngine, AM, 650, 1200, 2, 1, STAGE_TYPE.FOREST);
    var testCirclePath = Platform.getCircularPath(100, 40, 2);
    var testPlatformArray = [testPlatform, testPlatform2, testPlatform3, testPlatform4];
    Platform.addPlatformsToPath(testCirclePath, testPlatformArray);
    castleStage.entityList.push(testPlatform);
    castleStage.entityList.push(testPlatform2);
    castleStage.entityList.push(testPlatform3);
    castleStage.entityList.push(testPlatform4);
    
    gameEngine.addStage(forestStage);
    gameEngine.addStage(castleStage);

    gameEngine.playerAgent = knight;
    gameEngine.cameraAgent = knight;

    var titleScreen = new TitleScreen(gameEngine, AM, 0, 1664);
    titleScreen.entity.removeUponReset = true;
    forestStage.entityList.push(titleScreen);

    canvas.addEventListener('focus', function (event) {
        gameEngine.healthBarVisible = true;
        var agents = gameEngine.agents;
        for (var i = 0; i < agents.length; i++) {
            if (agents[i] === titleScreen) {
                agents.splice(i, 1);
                break;
            }
        }
    }, false);
    
    
    
    
    //var victoryCameraFocus = new FocusTrigger(gameEngine, AM, 7639, 1361);
    //var victoryMusicTrigger = new MusicTrigger(gameEngine, AM, 4550, 2101, 50, 148, BGM.victoryFanfare);
    
    //var victoryScreen = new VictoryScreen(gameEngine, AM, 7000, 1000);
    //forestStage.entityList.push(victoryScreen);
    
    //var victoryCameraTrigger = new CameraTrigger(gameEngine, AM, 4550, 2101, 50, 148, victoryCameraFocus, CAMERA_MODE.INSTANT);
    //forestStage.entityList.push(victoryCameraTrigger);    
    //forestStage.entityList.push(victoryMusicTrigger);

    gameEngine.start();
});
