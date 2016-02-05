function HealingStuff (x, y) {
    Entity.call(this, x, y, 30, 30);
    
    this.health = 8;
    
    this.removeFromWorld = false;
}

HealingStuff.prototype = new Entity();
HealingStuff.prototype.constructor = HealingStuff;

HealingStuff.prototype.draw = function(ctx, cameraRect, tick) {
    ctx.fillStyle = "Yellow";
    ctx.fillRect(this.currentX_px - cameraRect.left, this.currentY_px - cameraRect.top,
                    30, 30);
}