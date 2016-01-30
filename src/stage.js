function Stage(ctx, spawnX, spawnY) {
    this.entityList = [];
    this.spawnX = spawnX;
    this.spawnY = spawnY;
    this.backgroundList = [];
    this.stageMusic = null;
    this.canvasX = ctx.canvas.width;
    this.canvasY = ctx.canvas.height;
}

/**
  * Add a new background to the stage.
  * If the background is static, set its moveSpeed to 0.
  * Otherwise, set its moveSpeed to the distance you want the player to traverse before the background loops once.
  */
Stage.prototype.addBackground = function(background, moveSpeed) { 
    this.backgroundList.push(background);
    this.backgroundList.push(moveSpeed);
}

Stage.prototype.drawBackground = function(ctx, cameraX) {
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
}