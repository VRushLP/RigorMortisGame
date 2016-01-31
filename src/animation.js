function Animation (source, xStart, yStart, sourceFlip, xStFlip, yStFlip, frameWidth, frameHeight, frames, frameDuration, isFlipped, loop) {
    this.source = source;
    this.xStart = xStart;
    this.yStart = yStart;
    this.sourceFlip = sourceFlip;
    this.xStFlip = xStFlip;
    this.yStFlip = yStFlip;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.frameDuration = frameDuration;
    this.totalTime = frameDuration * frames;
    this.isFlipped = isFlipped;
    this.loop = loop;
    this.elapsedTime = 0;
}

Animation.prototype = {
    drawFrame : function (ctx, x, y, isFalling) {
        if (this.loop) {
            if (this.isDone()) {
                this.elapsedTime = 0;
            }
        } else if (this.isDone()) {
            return;
        }
        var curFrame = this.currentFrame();
//        console.log(isFalling);
        if (!this.isFlipped) {
            if (isFalling === true) {
//                console.log("Falling, not flipped");
                ctx.drawImage(this.source, this.xStart + this.frameWidth, this.yStart, 
                             this.frameWidth, this.frameHeight, x, y,
                             this.frameWidth, this.frameHeight);
            } else if (isFalling === false) {
//                console.log("Jumping, not flipped");
                ctx.drawImage(this.source, this.xStart, this.yStart, 
                             this.frameWidth, this.frameHeight, x, y,
                             this.frameWidth, this.frameHeight);
            } else {
                ctx.drawImage(this.source,
                         this.xStart + (curFrame * this.frameWidth),
                         this.yStart,
                         this.frameWidth, this.frameHeight,
                         x, y,
                         this.frameWidth, this.frameHeight);
            }
        } else {
            if (isFalling === true) {
//                console.log("Falling, flipped");
                ctx.drawImage(this.sourceFlip, this.xStFlip - this.frameWidth, this.yStFlip, 
                             this.frameWidth, this.frameHeight, x, y,
                             this.frameWidth, this.frameHeight);
            } else if (isFalling === false) {
//                console.log("Jumping, flipped");
                ctx.drawImage(this.sourceFlip, this.xStFlip, this.yStFlip, 
                             this.frameWidth, this.frameHeight, x, y,
                             this.frameWidth, this.frameHeight);
            } else {
                ctx.drawImage(this.sourceFlip,
                         this.xStFlip - (curFrame * this.frameWidth), 
                         this.yStFlip,
                         this.frameWidth, this.frameHeight,
                         x, y,
                         this.frameWidth, this.frameHeight);
            }
        }
    },
    
    isDone : function () {
        return (this.elapsedTime >= this.totalTime);
    },
    
    currentFrame : function () {
        return Math.floor(this.elapsedTime / this.frameDuration);
    }
}