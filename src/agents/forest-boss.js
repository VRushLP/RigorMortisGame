var ARM_STATE = {
    RISING: 0,
    RESTING: 1,
    FALLING: 2,
    HIDING: 3
}



function ForestBoss(game, AM, x, y) {
    //Setting width and height to 0 may cause problems.
    this.entity = new Entity(game, x, y, 0, 0);
    this.entity.collidable = false;
    
    this.speed = 0;
    this.health = 4;
    
    this.arms = [];
    for (var i = 0; i < 4; i++) {
        arms.push(new ForestBossArm(game, AM, x + 100 + 250 * i, y));
        game.addAgent(this.arms[i]);
    }
    
    this.core = new ForestBossCore(game, AM, x, y);
    game.addAgent(this.core);
}

ForestBoss.prototype = {
    
    update: function () {
        
    },
    
    draw: function() {
        this.entity.draw();
    },
    
    restPattern: function () {
        
    }
    
}

function ForestBossArm(game, AM, x, y) {
    this.entity = new Entity(game, x, y, 0, 0);
    this.currentState = ARM_STATE.HIDING;
}

ForestBossArm.prototype = {
    
    update: function () {
        
    },
    
    draw: function() {
        this.entity.draw();
    },
    
}
    
function ForestBossCore(game, AM, x, y) {
    this.entity = new Entity(game, x, y, 0, 0);
}

ForestBossCore.prototype = {
    
    update: function () {
        
    },
    
    draw: function() {
        this.entity.draw();
    },
    
}