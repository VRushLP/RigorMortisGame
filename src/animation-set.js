/**
 * An Animation Set is a collection of all animations for an agent.
 * Agents are intended to create their animation set and then add it to the game engine.
 */
var ANIMATION_SET = {
    KNIGHT: 0,
    SKELETON: 1,
    WISP: 2,
    ARCHER: 3
};

//Size constants
var KNIGHT_SIZE = {
    STAND_WIDTH: 41,
    STAND_HEIGHT: 50,
    WALK_WIDTH: 49,
    WALK_HEIGHT: 52,
    JUMP_WIDTH: 47,
    JUMP_HEIGHT: 55,
    ATTACK_OFFSET_Y: -19,
    ATTACK_LEFT_OFFSET_X: -40
};

function AnimationSet(animationSetType, AM) {
    this.animationSet = [];
    this.AM = AM;
    
    switch (animationSetType) {
        case ANIMATION_SET.KNIGHT:
            this.createKnightSet();
            break;
        case ANIMATION_SET.SKELETON:
            this.createSkeletonSet();
            break;
        case ANIMATION_SET.WISP:
            this.createWispSet();
            break;
        case ANIMATION_SET.ARCHER:
            this.createArcherSet();
            break;
        default:
            this.createKnightSet();
    }
}

AnimationSet.prototype = {
    
    createKnightSet: function () {
        var KnightStandRight = new Animation(this.AM.getAsset("./img/knight/knight standing.png"),
        KNIGHT_SIZE.STAND_WIDTH, KNIGHT_SIZE.STAND_HEIGHT, KNIGHT_ANIM.FRAME_DURATION, true);
        KnightStandRight.addFrame(0, 0);
        this.animationSet.push(KnightStandRight);
        
        var KnightStandLeft = new Animation(this.AM.getAsset("./img/knight/knight standing flipped.png"),
            KNIGHT_SIZE.STAND_WIDTH, KNIGHT_SIZE.STAND_HEIGHT, KNIGHT_ANIM.FRAME_DURATION, true);
        KnightStandLeft.addFrame(0, 0);
        this.animationSet.push(KnightStandLeft);

        var KnightWalkRight = new Animation(this.AM.getAsset("./img/knight/knight run.png"),
            KNIGHT_SIZE.WALK_WIDTH, KNIGHT_SIZE.WALK_HEIGHT, KNIGHT_ANIM.FRAME_RUN_DURATION, true);
        KnightWalkRight.addFrame(0, 0, 8);
        this.animationSet.push(KnightWalkRight);
        
        var KnightWalkLeft = new Animation(this.AM.getAsset("./img/knight/knight run flipped.png"),
            KNIGHT_SIZE.WALK_WIDTH, KNIGHT_SIZE.WALK_HEIGHT, KNIGHT_ANIM.FRAME_RUN_DURATION, true);
        KnightWalkLeft.addFrame(0, 0, 8);
        this.animationSet.push(KnightWalkLeft);

        var KnightJumpRight = new Animation(this.AM.getAsset("./img/knight/knight jump.png"),
            KNIGHT_SIZE.JUMP_WIDTH, KNIGHT_SIZE.JUMP_HEIGHT, KNIGHT_ANIM.FRAME_DURATION, true);
        KnightJumpRight.addFrame(0, 0);
        this.animationSet.push(KnightJumpRight);
        
        var KnightJumpLeft = new Animation(this.AM.getAsset("./img/knight/knight jump flipped.png"),
            KNIGHT_SIZE.JUMP_WIDTH, KNIGHT_SIZE.JUMP_HEIGHT, KNIGHT_ANIM.FRAME_DURATION, true);
        KnightJumpLeft.addFrame(0, 0);
        this.animationSet.push(KnightJumpLeft);

        var KnightFallRight = new Animation(this.AM.getAsset("./img/knight/knight jump.png"),
            KNIGHT_SIZE.JUMP_WIDTH, KNIGHT_SIZE.JUMP_HEIGHT, KNIGHT_ANIM.FRAME_DURATION, true);
        KnightFallRight.addFrame(KNIGHT_SIZE.JUMP_WIDTH, 0);
        this.animationSet.push(KnightFallRight);
        
        var KnightFallLeft = new Animation(this.AM.getAsset("./img/knight/knight jump flipped.png"),
            KNIGHT_SIZE.JUMP_WIDTH, KNIGHT_SIZE.JUMP_HEIGHT, KNIGHT_ANIM.FRAME_DURATION, true);
        KnightFallLeft.addFrame(KNIGHT_SIZE.JUMP_WIDTH, 0);
        this.animationSet.push(KnightFallLeft);

        var KnightAttackRight = new Animation(this.AM.getAsset("./img/knight/knight attack.png"), 90, 70, 0.085, false, 0, KNIGHT_SIZE.ATTACK_OFFSET_Y);
        KnightAttackRight.addFrame(0, 0, 8);
        this.animationSet.push(KnightAttackRight);
        
        var KnightAttackLeft = new Animation(this.AM.getAsset("./img/knight/knight attack flipped.png"), 90, 70, 0.085, false,
                                             KNIGHT_SIZE.ATTACK_LEFT_OFFSET_X, KNIGHT_SIZE.ATTACK_OFFSET_Y);
        KnightAttackLeft.addFrame(0, 0, 8);
        this.animationSet.push(KnightAttackLeft);
    },
    
    createSkeletonSet: function () {
        var skeletonIdleRight = new Animation(this.AM.getAsset("./img/enemy/chaser.png"), 31, 59, 0.05, true);
        skeletonIdleRight.addFrame(31, 0);
        this.animationSet.push(skeletonIdleRight);
        
        var skeletonIdleLeft = new Animation(this.AM.getAsset("./img/enemy/chaser.png"), 31, 59, 0.05, true);
        skeletonIdleLeft.addFrame(0, 0);
        this.animationSet.push(skeletonIdleLeft);
        
        var skeletonRunRight = new Animation(this.AM.getAsset("./img/enemy/chaser.png"), 52, 59, 0.1, true);
        skeletonRunRight.addFrame(0, 118, 3);
        this.animationSet.push(skeletonRunRight);
        
        var skeletonRunLeft = new Animation(this.AM.getAsset("./img/enemy/chaser.png"), 52, 59, 0.1, true);
        skeletonRunLeft.addFrame(0, 59, 3);
        this.animationSet.push(skeletonRunLeft);
        
        var skeletonDeath = new Animation(this.AM.getAsset("./img/enemy/death anim.png"), 15, 15, 0.1, false);
        skeletonDeath.addFrame(0, 0, 7);
        this.animationSet.push(skeletonDeath);
    },
    
    createWispSet: function () {
        var wispRight = new Animation(this.AM.getAsset("./img/enemy/wisp.png"), 44, 50, 0.17, true);
        wispRight.addFrame(0, 50, 4);
        this.animationSet.push(wispRight);
        
        var wispLeft = new Animation(this.AM.getAsset("./img/enemy/wisp.png"), 44, 50, 0.17, true);
        wispLeft.addFrame(0, 0, 4);
        this.animationSet.push(wispLeft);
        
        var wispDie = new Animation(this.AM.getAsset("./img/enemy/death anim.png"), 15, 15, 0.1, false);
        wispDie.addFrame(0, 0, 7);
        this.animationSet.push(wispDie);
    },
    
    createArcherSet: function () {
        var archerRight = new Animation(this.AM.getAsset("./img/enemy/archer.png"), 73, 64, 0.05, true);
        archerRight.addFrame(73, 0);
        this.animationSet.push(archerRight);
        
        var archerLeft = new Animation(this.AM.getAsset("./img/enemy/archer.png"), 73, 64, 0.05, true);
        archerLeft.addFrame(0, 0);
        this.animationSet.push(archerLeft);
        
        var archerLeftShooting = new Animation(this.AM.getAsset("./img/enemy/archer.png"), 73, 64, 0.2, false);
        archerLeftShooting.addFrame(0, 64, 3);
        this.animationSet.push(archerLeftShooting);
        
        var archerRightShooting = new Animation(this.AM.getAsset("./img/enemy/archer.png"), 73, 64, 0.2, false);
        archerRightShooting.addFrame(0, 128, 3);
        this.animationSet.push(archerRightShooting);
        
        var archerLeftShootingDown = new Animation(this.AM.getAsset("./img/enemy/archer.png"), 73, 64, 0.2, false);
        archerLeftShootingDown.addFrame(0, 192, 3);
        this.animationSet.push(archerLeftShootingDown);
        
        var archerRightShootingDown = new Animation(this.AM.getAsset("./img/enemy/archer.png"), 73, 64, 0.2, false);
        archerRightShootingDown.addFrame(0, 256, 3);
        this.animationSet.push(archerRightShootingDown);
        
        var archerLeftShootingUp = new Animation(this.AM.getAsset("./img/enemy/archer.png"), 73, 64, 0.2, false);
        archerLeftShootingUp.addFrame(0, 320, 3);
        this.animationSet.push(archerLeftShootingUp);
        
        var archerRightShootingUp = new Animation(this.AM.getAsset("./img/enemy/archer.png"), 73, 64, 0.2, false);
        archerRightShootingUp.addFrame(0, 384, 3);
        this.animationSet.push(archerRightShootingUp);
        
        var archerDeath = new Animation(this.AM.getAsset("./img/enemy/death anim.png"), 15, 15, 0.1, false);
        archerDeath.addFrame(0, 0, 7);
        this.animationSet.push(archerDeath);
    },
    
    getAnimationArray: function () {
        return this.animationSet;
    }
};