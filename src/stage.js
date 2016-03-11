var STAGE_TYPE = {
    FOREST: 1,
    CASTLE: 2,
    HELL: 3
}

function Stage(gameEngine, stageType, music) {
    //Initialize stage with default values.
    this.entityList = [];
    this.spawnX = 0;
    this.spawnY = 0;
    this.backgroundList = [];
    this.stageMusic = null;
    this.stageHeight = 0;
    
    if (typeof(music) !== "undefined") {
        this.stageMusic = music;
    }    
    this.gameEngine = gameEngine;
    this.stageType = stageType;
    
    switch (stageType) {
        case (STAGE_TYPE.FOREST):
            this.placeBlock = this.placeForestBlock;
            this.equalizeBlocks = this.equalizeForestBlocks;
            break;
        case (STAGE_TYPE.CASTLE):
            this.placeBlock = this.placeCastleBlock;
            this.equalizeBlocks = this.equalizeCastleBlocks;
            break;
        default:
            this.placeBlocks = this.placeForestBlock;
            this.equalizeBlocks = this.equalizeForestBlocks;
    }
}

Stage.prototype = {

    /**
     * Add a new background to the stage.
     * If the background is static, set its moveSpeed to 0.
     * Otherwise, set its moveSpeed to the distance you want the player to traverse before the background loops once.
     * Backgrounds will be drawn in the order they are added.
     */
    addBackground: function (background, moveSpeed) {
        this.backgroundList.push({image: background, speed: moveSpeed});
        //this.backgroundList.push(background);
        //this.backgroundList.push(moveSpeed);
    },

    /*
     * Draw all backgrounds of the stage to the screen, where any backgrounds
     * that have a speed greater than zero will be offset based on the camera's position.
     */
    drawBackground: function (cameraX) {
        var ctx = this.gameEngine.ctx;
        var canvasWidth = this.gameEngine.ctx.canvas.width;
        var canvasHeight = this.gameEngine.ctx.canvas.height;
        
        //Draw each background to the screen in the order that they were added.
        for(var i = 0; i < this.backgroundList.length; i++) {
            if(this.backgroundList[i].speed > 0) {
                //The background moves with the camera, so first calculate its offset.

                //Determine where the background should start based on where the camera is and its speed.
                var backgroundLeftStart = (cameraX % this.backgroundList[i].speed) / (this.backgroundList[i].speed / canvasWidth);
                
                //Draw the background based on the above calculation.
                ctx.drawImage(this.backgroundList[i].image,
                             backgroundLeftStart, 0,
                             canvasWidth, canvasHeight);
                //Draw a second background just to the right of the first one so that it loops.
                ctx.drawImage(this.backgroundList[i].image,
                              backgroundLeftStart + canvasWidth, 0,
                              canvasWidth, canvasHeight)
            } else {
                //The background is static, so just draw it.
                ctx.drawImage(this.backgroundList[i].image, 0, 0, canvasWidth, canvasY);
            }
        }
    },

    /*
     * Read through an array of strings and build the level from recognizable characters.
     * inputArray: a 2D array of ASCII characters.
     */
    parseLevelFile: function (inputArray, AM) {
        //When parsing the level file, put the blocks into this array so that
        //they can be optimized before building.
        var blockArray = [];
        
        var currentX = 0;
        var currentY = 0;

        for(var lineNum = 0; lineNum < inputArray.length; lineNum++) {
            var blockLine = [];
            for(var tileNum = 0; tileNum < inputArray[lineNum].length; tileNum++) {
                var currentSymbol = inputArray[lineNum][tileNum];
                blockLine[tileNum] = {exists: false, depth: 0};

                switch (currentSymbol) {
                    case 'x':
                        blockLine[tileNum].exists = true;
                        break;
                    case '@':
                        this.spawnX = currentX;
                        this.spawnY = currentY - 5; //Small drop to avoid spawning into other entities.
                        break;
                    case "!" :
                        this.entityList.push(new Skeleton(this.gameEngine, AM, currentX, currentY - 10));
                        break;
                    case "*" :
                        this.entityList.push(new Archer(this.gameEngine, AM, currentX, currentY - 10));
                        break;
                    case "w":
                        this.entityList.push(new Wisp(this.gameEngine, AM, currentX, currentY));
                        break;
                    case "h":
                        this.entityList.push(new HealthPotion(this.gameEngine, AM, currentX, currentY));
                        break;
                    default: break;
                }
                currentX += 50;
            }
            blockArray[lineNum] = blockLine;
            currentX = 0;
            currentY += 50;
        }

        this.stageHeight = currentY + 50;
        
        //Scan through the loaded block array and set the block depths.
        for (var row = 0; row < blockArray.length; row++) {
            for (var column = 0; column < blockArray[row].length; column++) {
                if (blockArray[row][column].exists) {
                    this.placeBlock(blockArray, row, column);
                }
            }
        }
        
        //Scan through the loaded block array and equalize the blocks. Then place them.
        for (var row = 0; row < blockArray.length; row++) {
            for (var column = 0; column < blockArray[row].length; column++) {
                var currentBlock = blockArray[row][column];
                if (currentBlock.exists) {
                    this.equalizeBlocks(blockArray, row, column);                  
                    
                    this.entityList.push(new Block(this.gameEngine, AM, column * 50,
                                        row * 50, this.stageType, currentBlock.depth)); 
                }
            }
        }
    },
    
    placeForestBlock: function (blockArray, row, column) {
        var blockAbove, blockLeft, blockRight, currentBlock;
        
        var currentBlock = blockArray[row][column];
        
        if (typeof(blockArray[row - 1]) !== 'undefined') {
            blockAbove = blockArray[row - 1][column];
        }
        var blockLeft = blockArray[row][column - 1];
        var blockRight = blockArray[row][column + 1];
        
        //If the block has a block above it, then it is not a surface block.
        if (typeof(blockAbove) !== 'undefined' && blockAbove.exists) {
            currentBlock.depth = 1;
            
            //If the block has blocks to its left and right, then set its depth to be
            //one greater than the block above it.
            if (((typeof(blockLeft) !== 'undefined') && blockLeft.exists) || column === 0) {
                if (typeof(blockRight) !== 'undefined' && blockRight.exists) {
                    currentBlock.depth = blockAbove.depth + 1;
                }
            } 
        }
    },
    
    placeCastleBlock: function (blockArray, row, column) {
        
        var blockAbove;
        var currentBlock = blockArray[row][column];
        if (typeof(blockArray[row - 1]) !== 'undefined') {
            blockAbove = blockArray[row - 1][column];
        }
        
        //If the block has a block above it, then it has a depth of 1.
        if (typeof(blockAbove) !== 'undefined' && blockAbove.exists) {
            currentBlock.depth = 1;
        } else {
            currentBlock.depth = 0;
        }
    },
    
    equalizeForestBlocks: function (blockArray, row, column) {
        var currentBlock = blockArray[row][column];
        
        if (currentBlock.depth > 1 && column != 0) {
            var blockAbove = blockArray[row - 1][column];
            var blockLeft = blockArray[row][column - 1];
            var blockRight = blockArray[row][column + 1];
            
            if (blockLeft.depth < currentBlock.depth && blockRight.depth < currentBlock.depth) {
                currentBlock.depth = Math.min(blockLeft.depth, blockRight.depth);
            }
            if (blockLeft.depth === 0 || blockRight.depth === 0) {
                currentBlock.depth = 1;
            }
            if (blockAbove.depth === 2) currentBlock.depth = 3;
            if (blockAbove.depth === 1 && currentBlock.depth === 3) currentBlock.depth = 2;
            if (blockAbove.depth === 3 && currentBlock.depth === 5) currentBlock.depth = 4;
            if (currentBlock.depth - blockAbove.depth > 1) currentBlock = blockAbove.depth - 1;
        }
    },
    
    equalizeCastleBlocks : function (blockArray, row, column) {
        //Castle blocks do not require equalization.   
    }
}
