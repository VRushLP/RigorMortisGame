function Level () {
    this.backgroundList = [];
    this.grid = [];
    this.titles = [];
    this.enemies = [];
    // var foreground = new Foreground();
    // this.door = [];
}

Level.prototype = {
    // displayHidden : function (x, y, door) {
    //     // TODO door doesn't have the property current_px
    //     if (door.currentX_px < x && door.currentY_px > y) {
    //         if (door.showHidden !== undefined) {    
    //             door.showHidden = true;
    //         }
    //     } else if (door.currentX_px > x && door.currentY_px > y) {
    //         if (door.showHidden !== undefined) {    
    //             door.showHidden = false;
    //         }
    //     }
    // },
    
    parseLevelFile: function (inputArray, game) {
        this.height = inputArray.length;
        this.width = inputArray[0].length;
        this.width_px = this.width * GAME_CONSTANT.BLOCK_SIZE;
        this.height_px = this.height * GAME_CONSTANT.BLOCK_SIZE;
        console.log("Map dimension: " + this.width + "x" + this.height);
        console.log("Map dimension in pixel: " + this.width_px + "x" + this.height_px);
        
        var forestBlock = new Animation(AM.getAsset("./img/forest-stage/forest ground block.png"), 
                GAME_CONSTANT.BLOCK_SIZE, GAME_CONSTANT.BLOCK_SIZE, 1, true);
        forestBlock.addFrame(0,0);
        var wallBlock = new Animation(AM.getAsset("./img/forest-stage/tree tile.png"),
                GAME_CONSTANT.BLOCK_SIZE, GAME_CONSTANT.BLOCK_SIZE, 1, true)
        wallBlock.addFrame(0,0);
    
        var currentX = 0;
        var currentY = 0;
        
        for (var y = 0; y < this.height; y += 1) {
            var gridLine = [];
            for (var x = 0; x < this.width; x += 1) {
                var currentSymbol = inputArray[y][x], block = null;
                switch (currentSymbol) {
                    case "x" : 
                        block = new Block(x, y, forestBlock);
                        block.fieldType = "ground";
                        this.titles.push(block); 
                        break;
                    case "|" : 
                        block = new Block(x, y, wallBlock);
                        block.fieldType = "wall"; 
                        this.titles.push(block);
                        break;
                    case "!" : this.enemies.push(new Skeleton(x, y, this)); break;
                    case "*" : this.enemies.push(new Archer(x, y, game, this)); break;
                    case "o" : this.enemies.push(new HealingStuff(x, y)); break;
                    // case "D" : block = new Door(x,y); this.door.push(block); break;
                    // case "0" : block = "hidden"; foreground.set(x, y); break;
                    case "@" : this.player = new Knight(x, y, game, this);break;
                    default : break;
                }
                gridLine.push(block);
            }
            this.grid.push(gridLine);
        }
        // for (var i = 0; i < this.door.length; i += 1) {
        //     this.door[i].assignHiddenPlace(foreground);
        //     foreground.findItselfOnMap();
        // }
    },
    
    /**
     * Add a new background to the stage.
     * If the background is static, just pass one parameter
     * Otherwise, set the second parameter true. 
     * The next two parameter decides where the background will start and the scale respects to the real map.
     */
    addBackground: function (background, isMoving, startFromBottom, scaleToWorldMap) {
        var canMove = isMoving || false;
        var scaleToMap = scaleToWorldMap || 1;
        var startFromBot = startFromBottom || false;
        var bg = new Background(background, canMove, startFromBot, scaleToMap);
        this.backgroundList.push(bg);
    },

    drawBackground: function (ctx, xView, yView) {
        for (var i = 0; i < this.backgroundList.length; i += 1) {
            var img = this.backgroundList[i].img;
            var scale = this.backgroundList[i].scale;
            var xStart = 0, yStart = 0;
            // I suppose that when a img is not moving. the img will be the same size of the canvas.
            // FIXME there is some issues when the background is not moving. In this map, it will work
            // It won't work if set up a different way.
            if (!this.backgroundList[i].isMoving) { // the background is not moving
                if (this.backgroundList[i].startFromBottom) {  // the background starts from bottom
                    yStart = (1 - scale) * ctx.canvas.height;
                } // if the background starts from top, yStart is still 0
                ctx.drawImage(img, xStart, yStart, ctx.canvas.width * scale, ctx.canvas.height * scale);
            } else {    // the background is moving with the character
                // how many pics will be drawn in canvas.
                var pics = Math.ceil(ctx.canvas.width / img.width);
                // the real scale respect to the canvas.
                var s = this.height_px * scale / img.height;
                // the position that img will start to draw.
                xStart = img.width * s * Math.floor(xView / (img.width * s)) - xView; 
                yStart = - yView;
                if (this.backgroundList[i].startFromBottom) {  // the background starts from top
                    yStart = (1 - scale) * this.height_px - yView;
                }
                // console.log(xStart);
                for (var j = 0; j <= pics; j += 1) {
                    // console.log(pics);
                    // console.log(yStart + " " + ctx.canvas.height * scale);
                    ctx.drawImage(img, xStart, yStart, img.width * s, img.height * s);
                    xStart += (img.width * s);
                }
            }
        }
    },
    
    update : function () {
        // TODO Update all movement platforms
        
        // remove the monsters that are killed
        for (var i = this.enemies.length - 1; i >= 0; i -= 1) {
            if (this.enemies[i].removeFromWorld) {
                this.enemies.splice(i, 1);
            }
        }
    },
    
    draw : function (ctx, cameraRect, tick) {
        this.drawBackground(ctx, cameraRect.left, cameraRect.top);
      
        for (var y = 0; y < this.grid.length; y += 1) {
            for (var x = 0; x < this.grid[0].length; x += 1) {
                var block = this.grid[y][x];
                if (block) {
                    block.draw(ctx, cameraRect, tick);
                }
            }
        }
    },
    
    /**
     * Check if there is an obstacle at the position x, y with the width and height of the entity.
     */
    obstacleAt : function (x, y, width, height) {
        var left = Math.floor(x / GAME_CONSTANT.BLOCK_SIZE);
        var top = Math.floor(y / GAME_CONSTANT.BLOCK_SIZE);
        var right = Math.floor((x + width) / GAME_CONSTANT.BLOCK_SIZE);
        var bottom = Math.floor((y + height) / GAME_CONSTANT.BLOCK_SIZE);
         if (left < 0 || right > this.width || top < 0) {
             return "wall";
         }

        for (var y = bottom; y >= top; y -= 1) {
            for (var x = left; x <= right; x += 1) {
                var fieldType = this.grid[y][x];
                if (fieldType === "hidden") {continue};
                if (fieldType === "door") {
                    for (var i = 0; i < this.door.length; i += 1) {
                        if (this.door[i].x === x) {return this.door[i]};
                    }
                }
                if (fieldType) {return fieldType;}
            }
        }
    },
    
    /**
     * Check if there is any enemy nearby.
     */
    enemyAt : function (player) {
        for (var i = 0; i < this.enemies.length; i += 1) {
            var monster = this.enemies[i];
            if (player.currentX_px + player.width > monster.currentX_px &&
                player.currentX_px < monster.currentX_px + monster.width &&
                player.currentY_px + player.height > monster.currentY_px &&
                player.currentY_px < monster.currentY_px + monster.height)
                return monster;
        }
    }
}

function Background (img, isMoving, startFromBottom, scale) {
    this.img = img;
    this.scale = scale;
    this.startFromBottom = startFromBottom;
    this.isMoving = isMoving;
}

function Foreground (x, y, xEnd, yEnd) {
    this.xStart = x || null;
    this.yStart = y || null;
    this.yEnd = yEnd || null;
    this.xEnd = xEnd || null;
}

Foreground.prototype = {
    set : function (x, y) {
        if (this.xStart === null || this.xStart > x) {
            this.xStart = x;
        }
        if (this.yStart === null || this.yStart > y) {
            this.yStart = y;
        }
        if (this.xEnd === null || this.xEnd < x) {
            this.xEnd = x;
        }
        if (this.yEnd === null || this.yEnd < y) {
            this.yEnd = y;
        }
    },
    
    findItselfOnMap : function () {
        this.left = this.xStart * GAME_CONSTANT.BLOCK_SIZE;
        this.right = (this.xEnd + 1) * GAME_CONSTANT.BLOCK_SIZE;
        this.top = this.yStart * GAME_CONSTANT.BLOCK_SIZE;
        this.bottom = (this.yEnd + 2) * GAME_CONSTANT.BLOCK_SIZE;
        this.width = this.right - this.left;
        this.height = this.bottom - this.top;
    }
}

function Door (x, y) {
    Entity.call(this, x, y, GAME_CONSTANT.BLOCK_SIZE, GAME_CONSTANT.BLOCK_SIZE);
    this.x = x;
    this.y = y;
    var door = AM.getAsset("./img/forest-stage/tree outer door.png");
    var doorBlock = new Animation(door, door.width, door.height, 1, true);
    doorBlock.addFrame(0,0);
    this.animationList.push(doorBlock);
}

Door.prototype = new Entity();
Door.prototype.constructor = Door;
Door.prototype.fieldType = "door";
Door.prototype.assignHiddenPlace = function (foreground) {
    if (this.y === foreground.yEnd ||
        this.x + 1 === foreground.xStart ||
        this.x - 1 === foreground.xEnd ||
        this.y === foreground.yStart) {
        this.foreground = foreground;
        this.showHidden = false;
    } 
}