/*
 * Game view
 * 
 * The view has access to the canvas context
 * and is responsible for the drawing logic
 * 
 * includes methods:
 * 
 * drawScreen() - draws the loading, read, gameover, or win state screen
 * drawBadGuys() - draws the bad guys by cycling through array and updating their positions
 * drawFps() - draws the FPS value of the game in the top-right corner of the screen
 *			   so the preformance of the game can be monitored
 * drawStage() - draws all of the objects into the canvas
 */

 function View(controller){
    this.controller = controller;
    this.canvas = controller.anim.getCanvas();
    this.context = controller.anim.getContext();
}

// draws the loading, read, gameover, or win state screen
View.prototype.drawScreen = function(screenImg){
    this.context.drawImage(screenImg, 0, 0, this.canvas.width, this.canvas.height);
};

// draws the bad guys by cycling through array and updating their positions
View.prototype.drawBadGuys = function() {
    var controller = this.controller;
    var model = controller.model;
	for (var n = 0; n < model.badGuys.length; n++) {
	    var badGuy = model.badGuys[n];
		var offsetPos = {
			x: badGuy.x + model.level.x,
			y: badGuy.y + model.level.y
		};
	    badGuy.draw(offsetPos);
	}
};

// draws the FPS value of the game in the top-right corner of the screen
// so the preformance of the game can be monitored
View.prototype.drawFps = function() {
    var context = this.context;
    context.fillStyle = "black";
    context.fillRect(this.canvas.width - 100, 0, 100, 30);
    
    context.font = "18pt Calibri";
    context.fillStyle = "white";
    context.fillText("fps: " + this.controller.avgFps.toFixed(1), this.canvas.width - 93, 22);
};

// draws all of the objects into the canvas
View.prototype.drawStage = function(){
    var controller = this.controller;
    var model = controller.model;
    if (controller.state == controller.states.PLAYING || controller.state == controller.states.GAMEOVER || controller.state == controller.states.WON) {
        model.level.draw();
		this.drawBadGuys();
        model.hero.draw(model.heroCanvasPos);
        model.healthBar.draw();
        
        // draw screen overlay
        if (controller.state == controller.states.GAMEOVER) {
            this.drawScreen(controller.images.gameoverScreen);
        }
        else if (controller.state == controller.states.WON) {
            this.drawScreen(controller.images.winScreen);
        }
        
        this.drawFps();
    }
    else if (controller.state == controller.states.READY) {
        this.drawScreen(controller.images.readyScreen);
    }
};
