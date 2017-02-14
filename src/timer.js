/**
 * A timer can be set for a number or an animation.
 * Numbers will be decremented by the game clock tick every update.
 * Animations will execute upon the final frame.
 *
 * Once the timer executes, it will call the toggleFunction.
 * toggleThis will be the value of this provided for the call to toggleFunction.
 * toggleFunctionArguments is an array of arguments that will be passed in (but not as an array).
 */

function Timer(game, source, toggleFunction, toggleThis, toggleFunctionArguments) {
    if (typeof source !== "number" && source.isDone() === "undefined") {
        console.log("Timer Error: Timer source must be either a number or an animation.");
        return;
    }
    
    if (typeof toggleFunction !== "function") {
        console.log("Timer Error: toggleFunction is not a function.");
        return;
    }
    
    this.game = game;
    this.source = source;
    this.toggleFunction = toggleFunction;
    this.toggleThis = toggleThis;
    this.toggleFunctionArguments = toggleFunctionArguments;
    this.isDone = false;
    
    this.initialValue = 0;
    if (typeof this.source === "number") {
        this.initialValue = this.source;
    }
}

Timer.prototype = {
    update: function () {
        if (this.isDone) return;
        
        if (typeof this.source === "number") {
            //TESTED.
            this.source -= this.game.clockTick;
            if (this.source <= 0) {
                this.source = 0;
                this.execute();
            }
        } else {
            //Assume that this is an animation.
            //UNTESTED.
            if (this.source.isDone()) {
                this.execute();
            }
        }
    },
    
    execute: function () {
        if (this.toggleFunction !== "undefined") {
            if (typeof this.toggleFunctionArguments  === "object") {
                //UNTESTED.
                this.toggleFunction.apply(this.toggleThis, this.toggleFunctionArguments);
            } else {
                //TESTED.
                this.toggleFunction.call(this.toggleThis, this.toggleFunctionArguments);
            }
            
        }
        this.isDone = true;
    },
    
    reset: function (resetSource, source) {
        if (source !== "undefined") {
            this.source = source;
        } else {
            if (this.resetSource === true) {
                if (typeof this.source !== "number") {
                    console.log("Timer Error: Timer may be reset, but the source of the timer cannot if it is an animation.");
                } else {
                    this.source = this.initialValue;
                }
            }

        }
        this.isDone = false;
    }
}