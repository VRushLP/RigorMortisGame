var AM = new AssetManager();

AM.queueDownload("./img/knight/knight jump draft.png");
AM.queueDownload("./img/knight/knight jump draft flipped.png");
AM.queueDownload("./img/knight/knight run draft.png");
AM.queueDownload("./img/knight/knight run draft flipped.png");
AM.queueDownload("./img/knight/knight standing.png");
AM.queueDownload("./img/knight/knight standing flipped.png");
AM.queueDownload("./img/knight/knight attack draft.png");
AM.queueDownload("./img/knight/knight attack draft flipped.png");
AM.queueDownload("./img/knight/knight hit draft.png");
AM.queueDownload("./img/knight/knight hit draft flipped.png");

AM.queueDownload("./img/forest-stage/forest ground block.png");
AM.queueDownload("./img/forest-stage/ground block.png");
AM.queueDownload("./img/forest-stage/tree outer door.png");
AM.queueDownload("./img/forest-stage/tree tile.png");
AM.queueDownload("./img/forest-stage/tree tile inner.png");
AM.queueDownload("./img/forest-stage/forest sky.png");
AM.queueDownload("./img/forest-stage/forest trees.png");

AM.queueDownload("./img/enemy/skeletonChaser mockup.png");
AM.queueDownload("./img/enemy/skeletonArcher mockup.png");
AM.queueDownload("./img/enemy/wispChaser mockup.png");

AM.queueStageDownload("./txt/forest-stage.txt");

/*
Download all the elements and add entities to the game.
*/
AM.downloadAll(function () {
    console.log("Initializing world");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
 
//     var simpleLevelPlan = [
// "|                                                                     |             |",
// "|                                                                     |             |",
// "|                                                                     |             |",
// "|                                                                     |             |",
// "|                                       !                             |             |",
// "|                                   xxxxxxxxxxxxxxxx   xxxx     xxxx  |             |",
// "|                         !             |1100000000|                  |             |",
// "|                        xxx  xx        |0000000000|       xx         |    &        |",
// "|                          |            |0000000000|              xxxx|             |",
// "|                    *     |      xxx   |000000xxxx|                  |             |",
// "|                    xxx   |            |0000000000|         xxx                    |",
// "|                          |    *       |xxx0000000|              *                 D",
// "|                          |   xx       |0000000000|              xxxxxxxxxxxxxxxxxx|",
// "|                        xx|            |0000000000|                  |             |",
// "|                          |       xx   |000000xxxx|                  |             |",
// "|            x             |            |0000000000|          xxxx    |             |",
// "|    @       |      xxx    |            D2200000000|                  |             |",
// "|           x|      | |  xx|xxxxxxxxxxxx|xxxxxxxxxx|xxxxxxxxxxxxxxxxxx|             |",
// "|xxx     xxx |     x   xx                                                           |",
// "|   xxxxx    |xxxxxx                                                                |"
//     ];

    var game = new GameEngine(ctx);
    var forestStage = new Level();
    forestStage.parseLevelFile(AM.getAsset("./txt/forest-stage.txt").split("\n"), game); 
    forestStage.addBackground(AM.getAsset("./img/forest-stage/forest sky.png"));
    forestStage.addBackground(AM.getAsset("./img/forest-stage/forest trees.png"), true, true, 3/4);
    var camera = new Camera(0, 0, canvas.width, canvas.height, forestStage.width_px, forestStage.height_px);
    camera.follow(forestStage.player, canvas.width/2 - 120, canvas.height/2 - 120);
    game.init(camera);
    game.addEntity(forestStage);
    game.addPlayer(forestStage.player);
    for (var i = 0; i < forestStage.enemies.length; i += 1) {
        game.addEntity(forestStage.enemies[i]);
    }
    game.start();
});