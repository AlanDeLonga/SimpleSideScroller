/*
 * HealthBar class
 * 
 * includes methods:
 * 
 * setHealth() - sets the health value
 * draw() - draws the health bar to the canvas
 */
function HealthBar(config){
	this.controller = config.controller;
    this.maxHealth = config.maxHealth;
    this.x = config.x;
    this.y = config.y;
    this.maxWidth = config.maxWidth;
    this.height = config.height;
    
    this.health = this.maxHealth;
}

// sets the health value
HealthBar.prototype.setHealth = function(health){
    this.health = health;
};

// draws the health bar to the canvas
HealthBar.prototype.draw = function(){
	var context = this.controller.view.context;
	// draws the background for the health bar to the canvas
    context.beginPath();
    context.rect(this.x, this.y, this.maxWidth, this.height);
    context.fillStyle = "black";
    context.fill();
    context.closePath();
    
	// draw health of the bar to canvas using a rectangle
    context.beginPath();
    var width = this.maxWidth * this.health / this.maxHealth;
    context.rect(this.x, this.y, width, this.height);
    context.fillStyle = "red";
    context.fill();
    context.closePath();
};