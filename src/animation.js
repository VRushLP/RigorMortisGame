/**
 * Create a new animation.
 * frameWidth: The width of each frame.
 * frameHeight: The height of each frame.
 * frameDuration: The length in time that each frame should last.
 * loop: Set to true if the animation should repeat once it is over.
 */
function Animation(spriteSheet, frameWidth, frameHeight, frameDuration, loop) {
    this.elapsedTime = 0;   
    this.frames = [];
    this.multiframeArray = [];
    
    this.loop = loop;
    this.spriteSheet = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.frameDuration = frameDuration;
}

Animation.prototype = {
    /**
     * Add an individual frame to the animation.
     */
    addFrame: function (startX, startY) {
        if (this.multiframeArray.length !== 0) {
            console.log("Animation Error: Cannot add single frame to multiframe animation.");
            return;
        }
        this.frames.push(startX);
        this.frames.push(startY);
        
        this.multiframeWidth = 1;
        this.multiframeHeight = 1;
    },

    /**
     * Add several frames in a series to the animation.
     * Will automatically skip to the next row if it reaches the end of a column.
     */
    addFrameBatch : function (startX, startY, numFrames) {
        if (this.multiframeArray.length !== 0) {
            console.log("Animation Error: Cannot add single frame to multiframe animation.");
            return;
        }
        var currentX = startX;
        var currentY = startY;
    
        //Scan through the spritesheet, adding frames at each index as we go.
        //Checks if we are at the end of a column, but not if we are at the end of all rows. TODO?
        for (var i = 0; i < numFrames; i++) {
            if(currentX + this.frameWidth > this.spriteSheet.width) {
                currentX = 0;
                currentY += this.frameHeight;
            }
        
            var newFrame = [];
        
            this.frames.push(currentX);
            this.frames.push(currentY);
            currentX += this.frameWidth;
        }
        
        this.multiframeWidth = 1;
        this.multiframeHeight = 1;
    },
    
    /**
      * Will add a multiframe, which is a sequence of individual frames
      * stitched together.
      * frameArrays is at least one array of x and y coordinates of frames.
      * Each array is a row of frames.
      */
    addMultiframe : function (frameArrays) {
        
        if (this.frames.length !== 0) {
            console.log("Animation Error: Cannot add multiframe to single frame animation.");
            return;
        }
        if (!Array.isArray(frameArrays)) {
            console.log("Animation Error: addMultiframe requires an array.");
            return;
        }
        
        if (this.multiframeArray.length > 0) {
            //Check if the frameArray is a 2d array, and check accordingly.
            if (Array.isArray(frameArrays[0])) {
                if (frameArrays.length !== this.multiframeArray[0].length) {
                    console.log("Animation Error: addMultiframe height mismatch.");
                    return;
                }
                if (Array.isArray(this.multiframeArray[0][0]) && this.multiframeArray[0][0].length !== frameArrays[0].length) {
                    console.log("Animation Error: addMultiframe width mismatch.");
                    return;
                }            
            } else {
                if (Array.isArray(this.multiframeArray[0][0])) {
                    console.log("Animation Error: addMultiframe height mismatch.");
                    return;
                }
                if (frameArrays.length !== this.multiframeArray[0].length) {
                    console.log("Aniamtion Error: addMultiframe width mismatch.");
                    return;
                }
            }
        }
            
        this.multiframeArray.push(frameArrays);
    },


    /**
     * Request the animation to draw its current frame.
     */
    drawFrame : function (tick, ctx, x, y) {
        this.elapsedTime += tick;
        if (this.isDone()) {
            if (this.loop) this.elapsedTime = 0;
        }
        var frame = this.currentFrame();
        var xStart = this.frames[frame * 2];
        var yStart = this.frames[frame * 2 + 1];

        ctx.drawImage(this.spriteSheet,
                     xStart, yStart,  // source from sheet
                     this.frameWidth, this.frameHeight,
                     x, y,
                     this.frameWidth,
                     this.frameHeight);
    },

    //Return the current frame number of the animation based on how much time elapsed.
    currentFrame : function () {
        return Math.floor(this.elapsedTime / this.frameDuration);
    },

    //Return whether or not the animation has finished.
    isDone : function () {
    return (this.currentFrame() >= this.frames.length / 2);
    }
}