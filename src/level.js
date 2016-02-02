function Level (map, game) {
    this.width = map[0].length;
    this.height = map.length;
    this.width_px = this.width * BLOCK_SIZE;
    this.height_px = this.height * BLOCK_SIZE;
    console.log(this.width + "x" + this.height);
    console.log(this.width_px + "x" + this.height_px);
    this.grid = [];
    this.image = null;
    var foreground = new Foreground();
    this.door = [];
    this.enemies = [];
    
    for (var y = 0; y < this.height; y += 1) {
        var line = map[y], gridLine = [];
        for (var x = 0; x < this.width; x += 1) {
            var ch = line[x], fieldType = null;
            switch (ch) {
                case "x" : fieldType = "ground"; break;
                case "|" : fieldType = "wall"; break;
                case "D" : fieldType = "door"; this.door.push(new Door(x, y)); break;
                case "K" : fieldType = "key"; break;
                case "0" : fieldType = "hidden"; foreground.set(x, y); break;
                case "@" : this.player = new Knight(x, y, game, this); break;
                default : break;
            }
            gridLine.push(fieldType);
        }
        this.grid.push(gridLine);
    }
    for (var i = 0; i < this.door.length; i += 1) {
        this.door[i].assignHiddenPlace(foreground);
        foreground.findItselfOnMap();
    }
}

Level.prototype = {
    displayHidden : function (x, y, door) {
        if (door.currentX_px < x && door.currentY_px > y) {
            if (door.showHidden !== undefined) {    
                door.showHidden = true;
            }
        } else if (door.currentX_px > x && door.currentY_px > y) {
            if (door.showHidden !== undefined) {    
                door.showHidden = false;
            }
        }
    },
    
    generate : function () {
        var ctx = document.createElement("canvas").getContext('2d');
        ctx.canvas.height = this.height_px;
        ctx.canvas.width = this.width_px;
        ctx.save();
        var trees_bg = ASSET_MANAGER.getAsset("img/forest-stage/forest trees.png");
        var ground = ASSET_MANAGER.getAsset("img/forest-stage/forest ground block.png");
        var innerGround = ASSET_MANAGER.getAsset("img/forest-stage/tree tile inner.png");
        var door = ASSET_MANAGER.getAsset("img/forest-stage/tree outer door.png");
        var wall = ASSET_MANAGER.getAsset("img/forest-stage/tree tile.png");
        var scale = Math.ceil((ctx.canvas.height * 2/3)/ trees_bg.height);
        var increment = trees_bg.width * scale;
        for (var i = 0; i < ctx.canvas.width; i += increment) {
            ctx.drawImage(trees_bg, 0, 0, trees_bg.width, trees_bg.height,
                        i, Math.ceil(ctx.canvas.height/3),
                        trees_bg.width*scale, trees_bg.height*scale);
        }
        
        for (var y = 0; y < this.grid.length; y += 1) {
            for (var x = 0; x < this.grid[0].length; x += 1) {
                // console.log("draw blocks");
                var fieldType = this.grid[y][x];
                if (fieldType === "wall") {
                    ctx.drawImage(wall, 0, 0, wall.width, wall.height,
                                    x * BLOCK_SIZE, 
                                    y * BLOCK_SIZE, 
                                    BLOCK_SIZE, BLOCK_SIZE);
                } else if (fieldType === "ground") {
                   ctx.drawImage(ground, 0, 0, ground.width, ground.height, 
                                 x * BLOCK_SIZE, y * BLOCK_SIZE,
                                BLOCK_SIZE, BLOCK_SIZE);
                } else if (fieldType === "key") {
                    ctx.font = "48px serif";
                    ctx.fillText("Key", x * BLOCK_SIZE, y * BLOCK_SIZE);
                } else if (fieldType === "door") {
                    ctx.drawImage(door, 0, 0, door.width, door.height,
                                x * BLOCK_SIZE,
                                y * BLOCK_SIZE - 100, door.width, door.height);
                } else if (fieldType === "hidden") {
                    ctx.drawImage(innerGround, 0, 0, innerGround.width, innerGround.height,
                                x * BLOCK_SIZE, y * BLOCK_SIZE,
                                innerGround.width, innerGround.height);
                }
            }
        }
        ctx.restore();
        // store the generate map as this image texture
        this.image = new Image();
        this.image.setAttribute('crossOrigin', 'anonymous');
        this.image.src = ctx.canvas.toDataURL();
        // console.log(this.image.src);
        // console.log(this.image);
    },
    
    update : function () {},
    draw : function (ctx, xView, yView) {
        var sky_bg = ASSET_MANAGER.getAsset("img/forest-stage/forest sky.png");
        
        var sx, sy, dx, dy;
        var sWidth, sHeight, dWidth, dHeight;

        // offset point to crop the image
        sx = xView;
        sy = yView;

        // dimensions of cropped image			
        sWidth =  ctx.canvas.width;
        sHeight = ctx.canvas.height;
        
        // if cropped image is smaller than canvas we need to change the source dimensions
        if(this.image.width - sx < sWidth){
            sWidth = this.image.width - sx;
        }
        if(this.image.height - sy < sHeight){
            sHeight = this.image.height - sy; 
        }

        // location on canvas to draw the croped image
        dx = 0;
        dy = 0;
        // match destination with source to not scale the image
        dWidth = sWidth;
        dHeight = sHeight;
        ctx.drawImage(sky_bg, 0, 0, 450, 300, dx, dy, dWidth, dHeight);
        ctx.drawImage(this.image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);	
        for (var i = 0; i < this.door.length; i += 1) {
            if (this.door[i].showHidden === false) {
                var fg = ASSET_MANAGER.getAsset("img/forest-stage/ground block.png");
                ctx.drawImage(fg, 0, 0, fg.width, fg.height, 
                    this.door[i].foreground.left - xView, this.door[i].foreground.top - yView,
                    this.door[i].foreground.width, this.door[i].foreground.height);
            } 
        }
    },

    obstacleAt : function (x, y, width, height) {
        var left = Math.floor(x / BLOCK_SIZE);
        var top = Math.floor(y / BLOCK_SIZE);
        var right = Math.floor((x + width) / BLOCK_SIZE);
        var bottom = Math.floor((y + height) / BLOCK_SIZE);
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
        this.left = this.xStart * BLOCK_SIZE;
        this.right = (this.xEnd + 1) * BLOCK_SIZE;
        this.top = this.yStart * BLOCK_SIZE;
        this.bottom = (this.yEnd + 2) * BLOCK_SIZE;
        this.width = this.right - this.left;
        this.height = this.bottom - this.top;
    }
}

function Door (x, y) {
    this.x = x;
    this.y = y;
    Entity.call(this, x, y, 50, 100);
}
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

// var simpleLevelPlan = [
// "|                                                                     |             |",
// "|                                                                     |             |",
// "|                                                                     |             |",
// "|                                                                     |             |",
// "|                                                                     |             |",
// "|                                   xxxxxxxxxxxxxxxx   xxxx     xxxx  |             |",
// "|                                       |0000000000|                  |             |",
// "|                        xxx  xx        |0000000000|       xx         |             |",
// "|                          |            |0000000000|              xxxx|             |",
// "|                          |      xxx   |000000xxxx|                  |             |",
// "|                    xxx   |            |0000000000|         xxx                    |",
// "|                          |            |xxx0000000|                                D",
// "|                          |   xx       |0000000000|              xxxxxxxxxxxxxxxxxx|",
// "|                        xx|            |0000000000|                  |             |",
// "|                          |       xx   |000000xxxx|                  |             |",
// "|            x             |  @         |0000000000|          xxxx    |             |",
// "|            |      xxx    |            D0000000000|                  |             |",
// "|           x|      | |  xx|xxxxxxxxxxxx|xxxxxxxxxx|xxxxxxxxxxxxxxxxxx|             |",
// "|xxx     xxx |     x   xx                                                           |",
// "|   xxxxx    |xxxxxx                                                                |"
//     ];