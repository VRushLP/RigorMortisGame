function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
     
    var wallCurrent = Date.now(),
        wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000,
        gameDelta = Math.min(wallDelta, this.maxStep);
    
    this.wallLastTimestamp = wallCurrent;
    this.gameTime += gameDelta;
    return gameDelta;
};

var KEY_CODES = {
    65 : 'a',
    68 : 'd',
    87 : 'w'
};

function GameEngine(ctx) {
    this.entities = [];
    this.ctx = ctx;
    this.camera = null;

    this.keyStatus = {};
    this.keysDown = false;
}

GameEngine.prototype = {
    init : function (camera) {
        this.camera = camera;
        for (var code in KEY_CODES) {
            if (KEY_CODES.hasOwnProperty(code)) {
                this.keyStatus[KEY_CODES[code]] = false;
            }
        }
        this.startInput();
        this.timer = new Timer();
    },

    start : function () {
        var that = this;
        (function gameLoop() {
            that.loop();
            window.requestAnimationFrame(gameLoop, that.ctx.canvas);
        })();
    },

    startInput : function () {
        var that = this;
        this.ctx.canvas.addEventListener("keydown", function (event) {
            if (KEY_CODES[event.keyCode]) {
                that.keyStatus[KEY_CODES[event.keyCode]] = true;
                that.keysDown = true;
                event.preventDefault();
            }
        }, false);
        this.ctx.canvas.addEventListener("keyup", function (event) {
            if (KEY_CODES[event.keyCode]) {
                that.keyStatus[KEY_CODES[event.keyCode]] = false;
                that.keysDown = false;
                for (var code in KEY_CODES) {
                    if (KEY_CODES.hasOwnProperty(code) && that.keyStatus[KEY_CODES[code]]) {
                        that.keysDown = true;
                    }
                }
                event.preventDefault();
            }
        }, false);
    },

    addEntity : function (entity) {
        this.entities.push(entity);
    },

    draw : function () {
         
        var i;
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.save();
        for (i = 0; i < this.entities.length; i += 1) {
            this.entities[i].draw(this.ctx, this.camera.xView, this.camera.yView);
        }
        this.ctx.restore();
    },

    update : function () {
         
        var entitiesCount = this.entities.length, i, entity;

        for (i = 0; i < entitiesCount; i += 1) {
            entity = this.entities[i];

            if (!entity.removeFromWorld) {
                // console.log(entity);
                entity.update();
            }
        }

        for (i = this.entities.length - 1; i >= 0; i -= 1) {
            if (this.entities[i].removeFromWorld) {
                this.entities.splice(i, 1);
            }
        }
        this.camera.update();
    },

    loop : function () {
        this.clockTick = this.timer.tick();
        this.update();
        this.draw();
    }
};