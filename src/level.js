function Level (map, game) {
    // suppose there is an image about the ground with the size
    this.blockSize = 50;
    this.width = map[0].length;
    this.height = map.length;
    this.width_px = this.width * this.blockSize;
    this.height_px = this.height * this.blockSize;
    console.log(this.width + "x" + this.height);
    console.log(this.width_px + "x" + this.height_px);
    this.grid = [];
    this.image = null;
    
    for (var y = 0; y < this.height; y += 1) {
        var line = map[y], gridLine = [];
        for (var x = 0; x < this.width; x += 1) {
            var ch = line[x], fieldType = null;
            if (ch === "x") {
                fieldType = "ground";
            } else if (ch === "|") {
                fieldType = "wall";  
            } else if (ch === "@") {
                this.player = new Knight(x, y, game, this);
            }
            gridLine.push(fieldType);
        }
        this.grid.push(gridLine);
    }
}

Level.prototype = {
    generate : function () {
        var ctx = document.createElement("canvas").getContext('2d');
        ctx.canvas.height = this.height_px;
        ctx.canvas.width = this.width_px;
        ctx.save();
        ctx.fillStyle = "Brown";
        var ground = ASSET_MANAGER.getAsset("assets/forest platform2x.png");
        for (var y = 0; y < this.grid.length; y += 1) {
            for (var x = 0; x < this.grid[0].length; x += 1) {
                var fieldType = this.grid[y][x];
                if (fieldType) {
                    ctx.fillRect(x * this.blockSize, 
                                    y * this.blockSize, 
                                    this.blockSize, this.blockSize);
                }// else if (fieldType === "ground") {
//                    ctx.drawImage(ground, 0, 0, 50, 50, 
//                                  x * this.blockSize, y * this.blockSize,
//                                 this.blockSize, this.blockSize);
//                }
            }
        }
//        ctx.drawImage(ground, 0, 0, 50, 50, 50, 50, 50, 50);
        ctx.restore();
        // store the generate map as this image texture
        this.image = new Image();
        this.image.setAttribute('crossOrigin', 'anonymous');
        this.image.src = ctx.canvas.toDataURL();
        console.log(this.image.src);
    },
    
    update : function () {},
    draw : function (ctx, xView, yView) {
			
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

        ctx.drawImage(this.image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);	
    },

    obstacleAt : function (x, y, width, height) {
        var left = Math.floor(x / this.blockSize);
        var top = Math.floor(y / this.blockSize);
        var right = Math.floor((x + width) / this.blockSize);
        var bottom = Math.floor((y + height) / this.blockSize);
         if (left < 0 || right > this.width || top < 0) {
             return "wall";
         }

        for (var y = top; y <= bottom; y += 1) {
            for (var x = left; x <= right; x += 1) {
                if (this.grid[y][x]) 
                    return "wall";
            }
        }
    }
}