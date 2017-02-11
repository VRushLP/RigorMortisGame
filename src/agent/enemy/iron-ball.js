var BALL_ATTR = {
  Y_ACCELERATION: .5,
  TERMINAL_VELOCITY: 6,
  DROP_FREQUENCY: 3 //seconds
}

var IRON_BALL_PHYSICS = {
    TERMINAL_X_VELOCITY : 0,
    TERMINAL_Y_VELOCITY : 6,
    KNOCKBACK_VELOCITY : 0,
    INITIAL_X_VELOCITY : 0,
    INITIAL_Y_VELOCITY : 0,
    Y_ACCELERATION : 0.5,
    X_ACCELRATION : 0,
}



function BallDropPoint(game, AM, x, y) {
    this.game = game;
    this.entity = new Entity(x, y, 0, 0);
    this.nextBall = BALL_ATTR.DROP_FREQUENCY;
    this.entity.collidable = false;

    this.ballAnimation = new Animation(AM.getAsset("./img/enemy/iron ball.png"), 150, 150, .2, true);
    this.ballAnimation.addFrame(0, 0);
}

BallDropPoint.prototype = {
  // Do we check to see if the knight is close enough, or are they on a global timer?
    update: function() {
      // Check if it's time to drop another ball
      this.nextBall -= this.game.clockTick;

      if (this.nextBall <= 0) {
        // If it is, drop another ball
        this.nextBall = BALL_ATTR.DROP_FREQUENCY;
        this.game.addAgent(new IronBall(this))
      }
      // else, nothing to do
    },
}

function IronBall(dropper){
    this.game = dropper.game;
    this.entity = new Entity(dropper.entity.x, dropper.entity.y, 150, 150);
    this.entity.animationList.push(dropper.ballAnimation);
    this.entity.temporary = true;
    this.entity.moveable = true;
    this.entity.nonColliders = [dropper.entity];
    this.yVelocity = 0;
}

IronBall.prototype = {
    update : function() {
      this.yVelocity += BALL_ATTR.Y_ACCELERATION;
      if (this.yVelocity > BALL_ATTR.TERMINAL_VELOCITY) this.yVelocity = BALL_ATTR.TERMINAL_VELOCITY;

      this.game.requestMove(this, 0, this.yVelocity);
    },

    checkListeners: function (agent) {
        if (agent.entity.controllable) {
            this.game.requestInputSend(agent, "damage", 1);
        } else if (!agent.entity.intangible) {
            this.entity.removeFromWorld = true;
        }
    }
}