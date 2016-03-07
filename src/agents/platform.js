var BLOCKS_GLOBALS = {
    WIDTH: 50,
    HEIGHT: 50,
    FRAME_DURATION: 1,
}

function Platform(game, AM, x, y, width, height, stageType) {
    this.entity = new Entity(x, y, BLOCKS_GLOBALS.WIDTH * width, BLOCKS_GLOBALS.HEIGHT * height);
    this.game = game;
    this.entity.pushesOnly = true;
    
    this.movePatterns = [];
    this.currentMovePattern = 0;
    this.loopMovePatterns = true;
    this.lastMoveOriginX = x;
    this.lastMoveOriginY = y;
    
    var NormalState;
    var blockStart;
    switch (stageType) {
        case STAGE_TYPE.FOREST:
            NormalState = new Animation(AM.getAsset("./img/forest-stage/forest block.png"), BLOCKS_GLOBALS.WIDTH, BLOCKS_GLOBALS.HEIGHT, BLOCKS_GLOBALS.FRAME_DURATION, true);
            blockStart = 0;
            break;
        case STAGE_TYPE.CASTLE:
            NormalState = new Animation(AM.getAsset("./img/castle-stage/castle block.png"), BLOCKS_GLOBALS.WIDTH, BLOCKS_GLOBALS.HEIGHT, BLOCKS_GLOBALS.FRAME_DURATION, true);
            blockStart = 50;
            break;
    }
    
    var multiframeArray = [];
    
    for (var i = 0; i < height; i++) {
        var tempArray = [];
        for (var j = 0; j < width; j++) {
            tempArray.push(blockStart);
            tempArray.push(0);
        }
        multiframeArray.push(tempArray);
        tempArray = [];
    }

    if(multiframeArray.length === 1) {
        //If the multiframe has only one row, then do not pass a 2D Array.
        NormalState.addMultiframe(multiframeArray[0]);
    } else {
        NormalState.addMultiframe(multiframeArray);
    }
    
    this.entity.addAnimation(NormalState);
    this.entity.setAnimation(0);
}

Platform.prototype = { 
        
    /**
      * Update the moving platform, which almost entirely involves progressing it upon
      * the current move pattern, or advancing to the next pattern.
      */
    update: function () {
        if(this.movePatterns.length > 0) {
            //Check if we need to restart the movement loop.
            if (this.currentMovePattern > this.movePatterns.length - 1) {
                if (this.loopMovePatterns) this.currentMovePattern = 0;
                else return;
            }            
            //Check if the current movement pattern has ended.
            if (Math.abs(this.lastMoveOriginX - this.entity.x) > this.movePatterns[this.currentMovePattern].amountX ||
                Math.abs(this.lastMoveOriginY - this.entity.y) > this.movePatterns[this.currentMovePattern].amountY) {
                this.currentMovePattern++;
                this.lastMoveOriginX = this.entity.x;
                this.lastMoveOriginY = this.entity.y;
            }
            //Move the platform by the amount requested by the movement pattern.
            var agentsToDrag = this.game.getTopCollisions(this);
            
            if (this.currentMovePattern < this.movePatterns.length) {
                this.game.requestMove(this, 
                                             this.movePatterns[this.currentMovePattern].velocityX, 
                                             this.movePatterns[this.currentMovePattern].velocityY);
                
                //Only vertically drag riding entities downwards. Gravity will take care of the rest.
                var downwardsDrag = Math.max(0, this.movePatterns[this.currentMovePattern].velocityY);
                
                for (var i = 0; i < agentsToDrag.length; i++) {
                    this.game.requestMove(agentsToDrag[i], 
                                             this.movePatterns[this.currentMovePattern].velocityX, 
                                             downwardsDrag);
                }
            }
        }
    },
    
    /**
      * Add a move pattern to the platform.
      * A move pattern moves the platform at the velocity requested until it reaches the distance given.
      * Once a move pattern is over, it will go on to the next move pattern.
      */
    addMovePattern: function (amountX, velocityX, amountY, velocityY) {
        this.entity.moveable = true;
        this.movePatterns.push({amountX: amountX, velocityX: velocityX,
                               amountY: amountY, velocityY: velocityY});
    }
}

/**
  * Return a list of x and y magnitudes that will form a circular path of a given radius.
  */
var getCircularPath = function (radius, sides, speed) {
    var centralAngle = 360.0 / sides;
    var centralRadian = central_angle * Math.PI / 180;
    var sideLength = 2 * (radius * Math.sin(centralRadian));
    var path = [];
    
    for (var i = 0; i < sides; i++) {
        var hypoLength = sideLength / Math.cos(centralRadian * i + 1);
        var oppLength = sideLength / Math.sin(centralRadian * i + 1);
        
        if (hypoLength < oppLength) {
            path.push({amountX: hypoLength, velocityX: hypoLength / oppLength,
                       amountY: oppLength, velocityY: 1 - hypoLength / oppLength});
        } else {
            path.push({amountX: hypoLength, velocityX: 1 - oppLength / hypoLength,
                       amountY: oppLength, velocityY: oppLength / hypoLength});
        }
    }
    
    return path;
}