var BLOCKS_GLOBALS = {
    WIDTH: 50,
    HEIGHT: 50,
    FRAME_DURATION: 1,
}

function Platform(game, AM, x, y, width, height, stageType) {
    this.entity = new Entity(x, y, BLOCKS_GLOBALS.WIDTH * width, BLOCKS_GLOBALS.HEIGHT * height);
    this.entity.moveable = true;
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
            blockStart = 0;
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
            if (Math.abs(this.lastMoveOriginX - this.entity.x) >= this.movePatterns[this.currentMovePattern].amountX - 0.0001 &&
                Math.abs(this.lastMoveOriginY - this.entity.y) >= this.movePatterns[this.currentMovePattern].amountY - 0.0001) {
                this.currentMovePattern++;
                this.lastMoveOriginX = this.entity.x;
                this.lastMoveOriginY = this.entity.y;
            }
            //Move the platform by the amount requested by the movement pattern.
            var agentsToDrag = this.game.getTopCollisions(this);
            
            if (this.currentMovePattern < this.movePatterns.length) {
                var velocityX = this.movePatterns[this.currentMovePattern].velocityX;
                var velocityY = this.movePatterns[this.currentMovePattern].velocityY;
                var amountX = this.movePatterns[this.currentMovePattern].amountX;
                var amountY = this.movePatterns[this.currentMovePattern].amountY;
                
                var adjustedX = Math.min( Math.abs(velocityX), 
                                       amountX - Math.abs(this.lastMoveOriginX - this.entity.x) );
                var adjustedY = Math.min( Math.abs(velocityY),
                                       amountY - Math.abs(this.lastMoveOriginY - this.entity.y) );
                
                if (velocityX < 0) adjustedX *= -1;
                if (velocityY < 0) adjustedY *= -1;
                this.game.requestMove(this, adjustedX, 0);
                this.game.requestMove(this, 0, adjustedY);
                
                //Only vertically drag riding entities downwards. Gravity will take care of the rest.
                var downwardsDrag = Math.max(0, adjustedY);
                
                for (var i = 0; i < agentsToDrag.length; i++) {
                    this.game.requestMove(agentsToDrag[i], adjustedX, 0);
                    this.game.requestMove(agentsToDrag[i], 0, downwardsDrag);
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
    },
    
    readInput : function (input) {
        if (input === "reset") {
            this.currentMovePattern = 0;
        }
    }
}


/**
  * Return a list of x and y magnitudes that will form a circular path of a given radius.
  * sides: The number of sides of the polygon path we are creating. Higher means more circular.
  */
Platform.getCircularPath = function (radius, sides, speed) {
    var centralAngle = 360.0 / sides;
    var centralRadian = centralAngle * Math.PI / 180;
    var sideLength = 2 * (radius * Math.sin(centralRadian));
    var path = [];

    for (var i = 0; i < sides; i++) {
        var adjLength = Math.cos(centralRadian * (i + 1)) * sideLength;
        var oppLength = Math.sin(centralRadian * (i + 1)) * sideLength;
        
        var amountX = adjLength;
        var amountY = oppLength;
        var velocityX = (speed / sideLength) * amountX;
        var velocityY = (speed / sideLength) * amountY;
        
        path.push({amountX: Math.abs(amountX), velocityX: velocityX,
                   amountY: Math.abs(amountY), velocityY: velocityY});
    }
    return path;
},

/**
  * Inserts an array of platforms into a pre-existing path,
  * with as much space existing between each platform as possible.
  */
Platform.addPlatformsToPath = function (path, platforms) {
    for (var i = 0; i < platforms.length; i++) {
        var startIndex = path.length / platforms.length * i;
        var currentIndex = startIndex;

        for (var j = 0; j < path.length; j++) {
            //Re-construct the path by starting from some index, going until the end,
            //then restarting and going until we get to the index again.
            platforms[i].movePatterns.push(path[currentIndex]);
            currentIndex++;
            if (currentIndex === path.length) currentIndex = 0;

            //Move the platform's start coordinates along the projected path.
            if (j <= startIndex) {
                var signX, signY;
                path[j].velocityX > 0 ? signX = 1 : signX = -1;
                path[j].velocityY > 0 ? signY = 1 : signY = -1;
                
                platforms[i].entity.originX += path[j].amountX * signX;
                platforms[i].entity.originY += path[j].amountY * signY;
            }
        }

        //Set the current point of the platforms to be the current point.
        platforms[i].entity.x = platforms[i].entity.originX;
        platforms[i].entity.y = platforms[i].entity.originY;
    }
}