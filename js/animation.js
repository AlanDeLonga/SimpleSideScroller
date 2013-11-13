/**
 *	Animation class for creating animations in canvas element
 *	Contains the following methods:
 *	
 *	getContext() - returns current context
 *	getCanvas() - returns current canvas
 *	clear() - clears the contexts current canvas (clears screen)
 *	setStage() - sets up the stage() function that will execute each frame
 *	isAnimating() - returns if anim is currently animating
 *	getFrame() - returns the current frame
 *	start() - initializes anim's variables with values and starts the animation loop
 *	stop() - flags the animation to stop
 *	getTimeInterval() - returns the time interval in ms between the current and last frame
 *	getTime() - returns the time in ms that the animation has been running
 *	getFps() - returns the current FPS of the animation
 *	animationLoop() - Updates all time and frame values for new display and redisplays 
 */	

 
// Animation Constructor that creates cross-browser requestAnimationFrame method
var Animation = function(canvasId){

	this.canvas = document.getElementById(canvasId);
	this.context = this.canvas.getContext("2d");
	this.t = 0;
	this.timeInterval = 0;
	this.startTime = 0;
	this.lastTime = 0;
	this.frame = 0;
	this.animating = false;
	
	// provided by Paul Irish
	window.requestAnimFrame = (function(callback){
		return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(callback){
			window.setTimeout(callback, 100 / 60);
		};
		})();
};

// ---------------------- methods for the Animation class ---------------

// returns current context
Animation.prototype.getContext = function(){
	return this.context;
};

// returns current canvas
Animation.prototype.getCanvas = function(){
	return this.canvas;
};

// clears the contexts current canvas (clears screen)
Animation.prototype.clear = function(){
	return this.context.clearRect(0,0, this.canvas.width, this.canvas.height);
};

// sets up the stage() function that will execute each frame
Animation.prototype.setStage = function(func){
	this.stage = func;
};

// returns if anim is currently animating
Animation.prototype.isAnimating = function(){
	return this.animating;
};

// returns the current frame
Animation.prototype.getFrame = function(){
	return this.frame;
};

// initializes Anim's variables with values
// and starts the animation loop
Animation.prototype.start = function(){
	this.animating = true;
	var date = new Date();
	this.startTime = date.getTime();
	this.lastTime = this.startTime;
	
	if(this.stage !== undefined) {
		this.stage();
	}
	
	this.animationLoop();
};

// flags the animation to stop
Animation.prototype.stop = function(){
	this.animating = false;
};

// returns the time interval in ms 
// between the current and last frame
Animation.prototype.getTimeInterval = function(){
	return this.timeInterval;
};

// returns the time in ms that the animation has been running
Animation.prototype.getTime = function(){
	return this.t;
};

// returns the current FPS of the animation
Animation.prototype.getFps = function(){
	return this.timeInterval > 0? 100/this.timeInterval : 0;
};

// Updates all time and frame values for new display and redisplays 
Animation.prototype.animationLoop = function(){
	var that = this;

	this.frame++;
	var date = new Date();
	var thisTime = date.getTime();
	this.timeInterval = thisTime - this.lastTime;
	this.t += this.timeInterval;
	this.lastTime = thisTime;
	
	if(this.stage !== undefined){
		this.stage();
	}
	
	if(this.animating){
		requestAnimFrame(function(){
			that.animationLoop();
		});
	}
};

