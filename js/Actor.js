/*
 * Actor class 
 *
 * includes methods:
 * 
 * attack() - sets variables and animaition to trigger an attack
 * stop() - stop character from moving
 * isFacingRight() - checks if character is facing right
 * moveRight() - set variables for movement in right direction
 * moveLeft() - set variables for movement in left direction
 * jump() - set variables for jump movement
 * draw() - set up context and positions, move charater to new position
 *          check if direction has changed, set up opacity and draw charracter
 * fade() - fades character when it has been defeated
 * updateSpriteMotion() - update character motion based on its current state
 * updateSpriteSeqNum() - increments or resets the sprite sequence number for each sprite interval
 * damage() - decrements the character's health and sets the sprite sheet to the hit sprite sheet,
 *            causing the character to flash white for a brief moment
 * getCenter() - returns the position of the center of the character
 */
 
function Actor(config){
    this.controller = config.controller;
    this.normalSpriteSheet = config.normalSpriteSheet;
    this.hitSpriteSheet = config.hitSpriteSheet;
    this.x = config.x; // absolute x
    this.y = config.y; // absolute y
    this.playerSpeed = config.playerSpeed; // px / s
    this.motions = config.motions;
    this.startMotion = config.startMotion;
    this.facingRight = config.facingRight;
    this.moving = config.moving;
    this.spriteInterval = config.spriteInterval; // ms
    this.maxHealth = config.maxHealth;
    this.attackRange = config.attackRange;
    this.minAttackInterval = config.minAttackInterval;
    
    this.SPRITE_SIZE = 144;
	this.FADE_RATE = 1; // full fade in 1s
    this.spriteSheet = this.normalSpriteSheet;
    this.vx = 0;
    this.vy = 0;
    this.spriteSeq = 0;
    this.motion = this.startMotion;
    this.lastMotion = this.motion;
    this.airborne = false;
    this.attacking = false;
    this.canAttack = true;
    this.health = this.maxHealth;
    this.alive = true;
    this.opacity = 1;
    this.timeSinceLastSpriteFrame = 0;
}

// sets variables and animaition to trigger an attack
Actor.prototype.attack = function(){
    this.attacking = true;
    this.canAttack = false;
    var that = this;
    setTimeout(function(){
       that.canAttack = true;
    }, this.minAttackInterval);
};

// stop character from moving
Actor.prototype.stop = function(){
    this.moving = false;
};

// checks if character is facing right
Actor.prototype.isFacingRight = function(){
    return this.facingRight;
};

// set variables for movement in right direction
Actor.prototype.moveRight = function(){
    this.moving = true;
    this.facingRight = true;
};

// set variables for movement in left direction
Actor.prototype.moveLeft = function(){
    this.moving = true;
    this.facingRight = false;
};

// set variables for jump movement
Actor.prototype.jump = function(){
    if (!this.airborne) {
        this.airborne = true;
        this.vy = -1;
    }
};

// set up context and positions, move charater to new position
// check if direction has changed, set up opacity and draw charracter
Actor.prototype.draw = function(pos){
    var context = this.controller.view.context;
    var sourceX = this.spriteSeq * this.SPRITE_SIZE;
    var sourceY = this.motion.index * this.SPRITE_SIZE;
    
    context.save();
	context.translate(pos.x, pos.y);

    if (this.facingRight) {
        context.translate(this.SPRITE_SIZE, 0);
        context.scale(-1, 1);
    }
    
    context.globalAlpha = this.opacity;
    context.drawImage(this.spriteSheet, sourceX, sourceY, this.SPRITE_SIZE, this.SPRITE_SIZE, 0, 0, this.SPRITE_SIZE, this.SPRITE_SIZE);
    context.restore();
};

// fades character when it has been defeated
Actor.prototype.fade = function(){
	var opacityChange = this.controller.anim.getTimeInterval() * this.FADE_RATE / 1000;
    this.opacity -= opacityChange;
    if (this.opacity < 0) {
        this.opacity = 0;
    }
};

// update character motion based on its current state
Actor.prototype.updateSpriteMotion = function(){
	// if attack sequence has finished, set attacking = false
    if (this.attacking && this.spriteSeq == this.motion.numSprites - 1) {
        this.attacking = false;
    }
			
    if (this.attacking) {
        this.motion = this.motions.ATTACKING;
    }
    else {
        if (this.airborne) {
            this.motion = this.motions.AIRBORNE;
        }
        else {
            this.vy = 0;
            if (this.moving) {
                this.motion = this.motions.RUNNING;
            }
            else {
                this.motion = this.motions.STANDING;
            }
        }
    }
};

// increments or resets the sprite sequence number for each sprite interval
Actor.prototype.updateSpriteSeqNum = function() {
    var anim = this.controller.anim;
    this.timeSinceLastSpriteFrame += anim.getTimeInterval();
    
    if (this.timeSinceLastSpriteFrame > this.spriteInterval) {
        if (this.spriteSeq < this.motion.numSprites - 1) {
            this.spriteSeq++;
        }
        else {
            if (this.motion.loop) {
                this.spriteSeq = 0;
            }
        }
        
        this.timeSinceLastSpriteFrame = 0;
    }
    
    if (this.motion != this.lastMotion) {
        this.spriteSeq = 0;
        this.lastMotion = this.motion;
    }
};

// decrements the character's health and sets the sprite sheet to the hit sprite sheet,
// causing the character to flash white for a brief moment
Actor.prototype.damage = function(){
    this.health = this.health <= 0 ? 0 : this.health - 1;
    
    this.spriteSheet = this.hitSpriteSheet;
    var that = this;
    setTimeout(function(){
        that.spriteSheet = that.normalSpriteSheet;
    }, 200);
};

// returns the position of the center of the character
Actor.prototype.getCenter = function(){
    return {
        x: Math.round(this.x) + this.SPRITE_SIZE / 2,
        y: Math.round(this.y) + this.SPRITE_SIZE / 2
    };
};
