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
        this.frames.push(startX);
        this.frames.push(startY);
    },

    /**
     * Add several frames in a series to the animation.
     * Will automatically skip to the next row if it reaches the end of a column.
     */
    addFrameBatch : function (startX, startY, numFrames) {
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