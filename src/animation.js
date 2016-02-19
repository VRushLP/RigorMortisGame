/**
 * Create a new animation.
 * frameWidth: The width of each frame.
 * frameHeight: The height of each frame.
 * frameDuration: The length in time that each frame should last.
 * loop: Set to true if the animation should repeat once it is over.
 * offsetX/Y: Optional offsets for how the animation is drawn to the screen.
 */
function Animation(spriteSheet, frameWidth, frameHeight, frameDuration, loop, offsetX, offsetY) {
    this.elapsedTime = 0;
    this.frames = [];
    this.multiframeArray = [];
    this.loop = loop;
    this.spriteSheet = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.frameDuration = frameDuration;

    //Set offsets to 0 if they were not provided.
    if (offsetX) this.offsetX = offsetX;
    else this.offsetX = 0;

    if (offsetY) this.offsetY = offsetY;
    else this.offsetY = 0;
}

Animation.prototype = {
    /**
     * Add several frames in a series to the animation
     * (will scan forward or backward - Default is forward).
     * Will automatically skip to the next row if it reaches the end or the start of a column.
     */
    addFrame : function (startX, startY, numFrames, scanForward) {
        if (this.multiframeArray.length !== 0) {
            console.log("Animation Error: Cannot add single frame to multiframe animation.");
            return;
        }
        var currentX = startX;
        var currentY = startY;
        var frames = numFrames || 1;
        //Scan through the spritesheet, adding frames at each index as we go.
        //Checks if we are at the end of a column, but not if we are at the end of all rows. TODO?
        for (var i = 0; i < frames; i += 1) {
            if (scanForward === false) {
                if (currentX < 0) {
                    currentX = this.spriteSheet.width - this.frameWidth;
                    currentY -= this.frameHeight;
                }
                this.frames.push(currentX)
                this.frames.push(currentY);
                currentX -= this.frameWidth;
            } else {    // scan forward
                if(currentX + this.frameWidth > this.spriteSheet.width) {
                    currentX = 0;
                    currentY += this.frameHeight;
                }
                this.frames.push(currentX)
                this.frames.push(currentY);
                currentX += this.frameWidth;
            }
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

        //Unless this is the first multiframe, make sure the new one is compatible.
        if (this.multiframeArray.length > 0) {

            //Run a different set of tests depending on whether or not we are adding a 2d array.
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
                if (this.multiframeArray[0].length !== 1) {
                    console.log("Animation Error: addMultiframe height mismatch.");
                    return;
                }
                if (frameArrays.length !== this.multiframeArray[0][0].length) {
                    console.log("Aniamtion Error: addMultiframe width mismatch.");
                    return;
                }
            }
        }

        if (Array.isArray(frameArrays[0])) {
            this.multiframeArray.push(frameArrays);
        } else {
            this.multiframeArray.push([frameArrays]);
        }
    },

    drawFrame : function (tick, ctx, x, y) {
        this.elapsedTime += tick;
        if (this.isDone()) {
            if (this.loop) this.elapsedTime = 0;
        }
        var frame = this.currentFrame();

        if(this.frames.length > 0) {
            var xStart = this.frames[frame * 2];
            var yStart = this.frames[frame * 2 + 1];

            ctx.drawImage(this.spriteSheet,
                     xStart, yStart,  // source from sheet
                     this.frameWidth, this.frameHeight,
                     x + this.offsetX, y + this.offsetY,
                     this.frameWidth,
                     this.frameHeight);
        } else {
            for (var i = 0; i < this.multiframeArray[frame].length; i++) {
                for (var j = 0; j < this.multiframeArray[frame][i].length; j += 2) {
                    ctx.drawImage(this.spriteSheet,
                     this.multiframeArray[frame][i][j], this.multiframeArray[frame][i][j + 1],  // source from sheet
                     this.frameWidth, this.frameHeight,
                     x + (j / 2) * this.frameWidth, y + i * this.frameHeight,
                     this.frameWidth,
                     this.frameHeight);
                }
            }
        }
    },

    currentFrame : function () {
        return Math.floor(this.elapsedTime / this.frameDuration);
    },

    //Return whether or not the animation has finished.
    isDone : function () {
        return (this.currentFrame() >= this.frames.length / 2);
    },

    /*
     * Return whether or not the animation is on its final frame.
     * This indicates that the next frame animated will need to be from a different source.
     */
    isFinalFrame : function () {
        return (this.currentFrame() + 1 >= this.frames.length / 2);
    }
}
