/*
Kyle Doan

For all this code, copyright from Gustavo Carvalho from stackoverflow website,
it is modified for the purpose of this project.
*/

var AXIS = {
    NONE: "none", 
    HORIZONTAL: "horizontal", 
    VERTICAL: "vertical", 
    BOTH: "both"
};

// Rectangle constructor
function Rectangle(left, top, width, height) {
    this.left = left || 0;
    this.top = top || 0;
    this.width = width || 0;
    this.height = height || 0;
    this.right = this.left + this.width;
    this.bottom = this.top + this.height;
}

// Rectangle method
Rectangle.prototype = {
    set : function (left, top, /* optional */ width, /* optional */ height) {
        this.left = left;
        this.top = top;
        this.width = width || this.width;
        this.height = height || this.height
        this.right = (this.left + this.width);
        this.bottom = (this.top + this.height);
    },
    
    within : function (r) {
        return (r.left <= this.left && 
                r.right >= this.right &&
                r.top <= this.top && 
                r.bottom >= this.bottom);
    },
    
//    overlap : function (r) {
//        return (this.left < r.right && 
//                r.left < this.right && 
//                this.top < r.bottom &&
//                r.top < this.bottom);
//    }
};

// Camera constructor
function Camera(xView, yView, canvasWidth, canvasHeight, worldWidth, worldHeight) {
    // position of camera (left-top coordinate)
    this.xView = xView || 0;
    this.yView = yView || 0;

    // distance from followed object to border before camera starts move
    this.xDeadZone = 0; // min distance to horizontal borders
    this.yDeadZone = 0; // min distance to vertical borders

    // viewport dimensions
    this.wView = canvasWidth;
    this.hView = canvasHeight;			

    // allow camera to move in vertical and horizontal axis
    this.axis = AXIS.BOTH;	

    // object that should be followed
    this.followed = null;

    // rectangle that represents the viewport
    this.viewportRect = new Rectangle(this.xView, this.yView, this.wView, this.hView);				

    // rectangle that represents the world's boundary (room's boundary)
    this.worldRect = new Rectangle(0, 0, worldWidth, worldHeight);
}

Camera.prototype = {
    // gameObject needs to have "x" and "y" properties (as world(or room) position)
    follow : function (gameObject, xDeadZone, yDeadZone) {
        this.followed = gameObject;	
        this.xDeadZone = xDeadZone;
        this.yDeadZone = yDeadZone;
    },
    
    update : function () {
        // keep following the player (or other desired object)
        if(this.followed != null) {		
            if(this.axis == AXIS.HORIZONTAL || this.axis == AXIS.BOTH) {	
                // moves camera on horizontal axis based on followed object position
                if(this.followed.currentX_px - this.xView  + this.xDeadZone > this.wView) {
                    this.xView = this.followed.currentX_px - (this.wView - this.xDeadZone);
                } else if(this.followed.currentX_px  - this.xDeadZone < this.xView) {
                    this.xView = this.followed.currentX_px  - this.xDeadZone;
                }
            }
            if(this.axis == AXIS.VERTICAL || this.axis == AXIS.BOTH) {
                // moves camera on vertical axis based on followed object position
                if(this.followed.currentY_px - this.yView + this.yDeadZone > this.hView) {
                    this.yView = this.followed.currentY_px - (this.hView - this.yDeadZone);
                } else if(this.followed.currentY_px - this.yDeadZone < this.yView) {
                    this.yView = this.followed.currentY_px - this.yDeadZone;
                }
            }						

        }		

        // update viewportRect
        this.viewportRect.set(this.xView, this.yView);

        // don't let camera leaves the world's boundary
        if(!this.viewportRect.within(this.worldRect)) {
            if(this.viewportRect.left < this.worldRect.left)
                this.xView = this.worldRect.left;
            if(this.viewportRect.top < this.worldRect.top)					
                this.yView = this.worldRect.top;
            if(this.viewportRect.right > this.worldRect.right)
                this.xView = this.worldRect.right - this.wView;
            if(this.viewportRect.bottom > this.worldRect.bottom)					
                this.yView = this.worldRect.bottom - this.hView;
        }
    },
}