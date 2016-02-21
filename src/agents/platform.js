var BLOCKS_GLOBALS = {
    WIDTH: 50,
    HEIGHT: 50,
    FRAME_DURATION: 1,
}

function Platform(game, AM, x, y, width, height) {
    this.entity = new Entity(game, x, y, BLOCKS_GLOBALS.WIDTH * width, BLOCKS_GLOBALS.HEIGHT * height);
    
    this.movePatterns = [];
    this.currentMovePattern = 0;
    this.loopMovePatterns = true;
    this.lastMoveOriginX = x;
    this.lastMoveOriginY = y;
    
    var NormalState = new Animation(AM.getAsset("./img/forest-stage/forest block.png"), BLOCKS_GLOBALS.WIDTH, BLOCKS_GLOBALS.HEIGHT, BLOCKS_GLOBALS.FRAME_DURATION, true);
    var multiframeArray = [];
    
    for (var i = 0; i < height; i++) {
        var tempArray = [];
        for (var j = 0; j < width; j++) {
            tempArray.push(0);
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
    
    draw: function () {
        this.entity.draw();
    },
    
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
            if (Math.abs(this.lastMoveOriginX - this.entity.x) > this.movePatterns[this.currentMovePattern][0] ||
                Math.abs(this.lastMoveOriginY - this.entity.y) > this.movePatterns[this.currentMovePattern][2]) {
                this.currentMovePattern++;
                this.lastMoveOriginX = this.entity.x;
                this.lastMoveOriginY = this.entity.y;
            }
            //Move the platform by the amount requested by the movement pattern.
            var agentsToDrag = this.entity.game.getTopCollisions(this.entity);
            
            if (this.currentMovePattern < this.movePatterns.length) {
                this.entity.game.requestMove(this, 
                                             this.movePatterns[this.currentMovePattern][1], 
                                             this.movePatterns[this.currentMovePattern][3]);
                
                //Only vertically drag riding entities downwards. Gravity will take care of the rest.
                var downwardsDrag = Math.max(0, this.movePatterns[this.currentMovePattern][3]);
                
                for (var i = 0; i < agentsToDrag.length; i++) {
                    this.entity.game.requestMove(agentsToDrag[i], 
                                             this.movePatterns[this.currentMovePattern][1], 
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
        this.movePatterns.push([amountX, velocityX, amountY, velocityY]);
    }
}