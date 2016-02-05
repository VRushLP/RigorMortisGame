function Block (x, y, blockAnimation) {
   this.x = x;  // coordinate of the block of the map
   this.y = y;  // coordinate of the block of the map
   Entity.call(this, x, y, GAME_CONSTANT.BLOCK_SIZE, GAME_CONSTANT.BLOCK_SIZE);
   
   this.animationList.push(blockAnimation);
}   

Block.prototype = new Entity();
Block.prototype.constructor = Block;