var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("img/knight/knight jump.png");
ASSET_MANAGER.queueDownload("img/knight/knight jump flipped.png");
ASSET_MANAGER.queueDownload("img/knight/knight run.png");
ASSET_MANAGER.queueDownload("img/knight/knight run flipped.png");
ASSET_MANAGER.queueDownload("img/knight/knight standing.png");
ASSET_MANAGER.queueDownload("img/knight/knight standing flipped.png");
ASSET_MANAGER.queueDownload("img/forest-stage/forest ground block.png");
ASSET_MANAGER.queueDownload("img/forest-stage/ground block.png");
ASSET_MANAGER.queueDownload("img/forest-stage/tree outer door.png");
ASSET_MANAGER.queueDownload("img/forest-stage/tree tile.png");
ASSET_MANAGER.queueDownload("img/forest-stage/tree tile inner.png");
ASSET_MANAGER.queueDownload("img/forest-stage/forest sky.png");
ASSET_MANAGER.queueDownload("img/forest-stage/forest trees.png");

/*
Download all the elements and add entities to the game.
*/
ASSET_MANAGER.downloadAll(function () {
    console.log("Initializing world");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
    var simpleLevelPlan = [
"|                                                                     |             |",
"|                                                                     |             |",
"|                                                                     |             |",
"|                                                                     |             |",
"|                                       !                             |             |",
"|                                   xxxxxxxxxxxxxxxx   xxxx     xxxx  |             |",
"|                         !             |0000000000|                  |             |",
"|                        xxx  xx        |0000000000|       xx         |             |",
"|                          |            |0000000000|              xxxx|             |",
"|                    *     |      xxx   |000000xxxx|                  |             |",
"|                    xxx   |            |0000000000|         xxx                    |",
"|                          |            |xxx0000000|                                D",
"|                          |   xx       |0000000000|              xxxxxxxxxxxxxxxxxx|",
"|                        xx|            |0000000000|                  |             |",
"|                    @     |       xx   |000000xxxx|                  |             |",
"|            x             |            |0000000000|          xxxx    |             |",
"|            |      xxx    |            D0000000000|                  |             |",
"|           x|      | |  xx|xxxxxxxxxxxx|xxxxxxxxxx|xxxxxxxxxxxxxxxxxx|             |",
"|xxx     xxx |     x   xx                                                           |",
"|   xxxxx    |xxxxxx                                                                |"
    ];

    var game = new GameEngine(ctx);
    var lv1 = new Level(simpleLevelPlan, game);
    lv1.generate();
    var camera = new Camera(0, 0, canvas.width, canvas.height, lv1.width_px, lv1.height_px);
    camera.follow(lv1.player, canvas.width/2 - 120, canvas.height/2 - 120);
    game.init(camera);
    game.addEntity(lv1);
    game.addPlayer(lv1.player);
    for (var i = 0; i < lv1.enemies.length; i += 1) {
        game.addEntity(lv1.enemies[i]);
    }
    game.start();
});