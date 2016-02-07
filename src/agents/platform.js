var BLOCKS_GLOBALS = {
    WIDTH: 50,
    HEIGHT: 50,
    FRAME_DURATION: 1,
}

function Platform(game, AM, x, y, width, height) {
    this.entity = new Entity(game, x, y, BLOCKS_GLOBALS.WIDTH * width, BLOCKS_GLOBALS.HEIGHT * height);
    
    var NormalState = new Animation(AM.getAsset("./img/forest-stage/forest block.png"), BLOCKS_GLOBALS.WIDTH, BLOCKS_GLOBALS.HEIGHT, BLOCKS_GLOBALS.FRAME_DURATION, true);
    var multiframeArray = [];
    
    for (var i = 0; i < height; i++) {
        var tempArray = [];
        for (var j = 0; j < width; j++) {
            tempArray.push(0);
            tempArray.push(0);
        }
        multiframeArray.push(tempArray);
        tempArray = [];
    }

    if(multiframeArray.length === 1) {
        //If the multiframe has only one row, then do not pass a 2D Array.
        NormalState.addMultiframe(multiframeArray[0]);
    } else {
        NormalState.addMultiframe(multiframeArray);
    }
    
    this.entity.addAnimation(NormalState);
    this.entity.setAnimation(0);
}

Platform.prototype = { 
    
    draw: function () {
        this.entity.draw();
    },
    
    update: function () {
        //Nothing to do.
    }
}