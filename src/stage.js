function Stage(ctx, gameEngine, spawnX, spawnY, music) {
    this.entityList = [];
    this.enemies = [];
    this.spawnX = spawnX;
    this.spawnY = spawnY;
    this.backgroundList = [];
    this.canvasX = ctx.canvas.width;
    this.canvasY = ctx.canvas.height;
    this.gameEngine = gameEngine;
    this.stageMusic = null;
    if (typeof(music) !== "undefined") {
        this.stageMusic = music;
    }
    this.stageHeight = 0;
}

Stage.prototype = {

    /**
     * Add a new background to the stage.
     * If the background is static, set its moveSpeed to 0.
     * Otherwise, set its moveSpeed to the distance you want the player to traverse before the background loops once.
     */
    addBackground: function (background, moveSpeed) {
        this.backgroundList.push(background);
        this.backgroundList.push(moveSpeed);
    },

    drawBackground: function (ctx, cameraX) {
        //Every two list elements is a background + speed pairing.
        for(var i = 0; i < this.backgroundList.length; i+= 2) {
            if(this.backgroundList[i + 1] > 0) {
                //Background moves with the camera

                //Complex equation that determines where the background should start based on where the camera is and its speed.
                var backgroundLeftStart = (cameraX % this.backgroundList[i + 1]) / (this.backgroundList[i + 1] / this.canvasX);
                ctx.drawImage(this.backgroundList[i],
                             backgroundLeftStart, 0,
                             this.canvasX, this.canvasY);
                //Draw a second
                ctx.drawImage(this.backgroundList[i],
                              backgroundLeftStart + this.canvasX, 0,
                              this.canvasX, this.canvasY)
            } else {
                //Background is static
                ctx.drawImage(this.backgroundList[i], 0, 0, this.canvasX, this.canvasY);
            }
        }
    },

    parseLevelFile: function (inputArray, AM) {
        var currentX = 0;
        var currentY = 0;

        for(var lineNum = 0; lineNum < inputArray.length; lineNum++) {
            for(var tileNum = 0; tileNum < inputArray[lineNum].length; tileNum++) {
                var currentSymbol = inputArray[lineNum][tileNum];

                switch (currentSymbol) {
                    case 'x':
                        this.entityList.push(new Block(this.gameEngine, AM, currentX, currentY));
                        break;
                    case '@':
                        this.spawnX = currentX;
                        this.spawnY = currentY - 5; //Small drop to avoid spawning into other entities.
                        console.log(currentX);
                        console.log(currentY);
                        break;
                    case "!" :
                        this.enemies.push(new Skeleton(this.gameEngine, AM, currentX, currentY - 10));
                        this.entityList.push(this.enemies[this.enemies.length - 1]);
                        break;
                    case "*" :
                        this.enemies.push(new Archer(this.gameEngine, currentX, currentY - 10, this));
                        this.entityList.push(this.enemies[this.enemies.length - 1]);
                        break;
                    // case "w" : this.enemies.push(new Wisp(currentX, currentY, this)); break;
                    // case "o" : this.enemies.push(new HealingStuff(currentX, currentY)); break;
                    default: break;
                }
                currentX += 50;
            }
            currentX = 0;
            currentY += 50;
        }

        this.stageHeight = currentY + 50;
    }
}
