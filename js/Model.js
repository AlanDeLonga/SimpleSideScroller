/*
 * Game model
 * 
 * The model is responsible for initializing and
 * updating the hero, level, bad guys, and health bar
 * 
 * includes methods:
 * 
 * removeDefeatedBadGuys() - loops through the bad guys array and then removes the ones that are no longer alive
 * updateBadGuys() - updates each bad guy with new values based on the actions of the last frame
 * updateStage() - updates all of the game objects for each animation frame
 * initHealthBar() - initializes vaules such as the location and size for the health bar
 * initLevel() - initializes the levels controller x, y, left and right bound values
 * initHero() - initializes the hero character, first by setting up the motions with values 
 *				based on the sprite sheets, then by instantiating a new actor object which is
 *				initialized with values defined in the controller lastly sets the characters 
 *				beginning position
 * initBadGuys() - initializes the hero character, first by setting up the motions with values
 *				   based on the sprite sheets sets each bad guy's starting position and orientation
 *				   then by instantiates a new actor object which is initialized with values defined 
 *				   in the controller for each bad guy
 * moveBadGuys() - serves as a simple AI engine for the continual movement of bad guys
 * updateLevel() - updates current level position based on heros position
 * updateHeroCanvasPos() - updates the position of the hero relative to the canvas
 * updateActor() - updates characters variables such as position and life state
 * updateActorVY() - Uses the downward force of gravity and the upward force of the
 *					 levitation pods to update teh vertical velocity of an actor
 * updateActorY() - updates the y position of the character based on his vertical velocity
 * updateActorX() - updates the characters x position in the level by checking orientation and movement
 * nearby() - checks proximity between characters in the level
 */
 
function Model(controller){
    this.controller = controller;
    this.healthBar = null;
    this.hero = null;
    this.level = null;
    this.badGuys = []; // array of bad guys
    this.heroCanvasPos = {};
}

// loops through the bad guys array and then removes the ones that are no longer alive
Model.prototype.removeDefeatedBadGuys = function(){
    for (var n = 0; n < this.badGuys.length; n++) {
        var badGuy = this.badGuys[n];
        if (!badGuy.alive && badGuy.opacity == 0) {
            this.badGuys.splice(n, 1);
        }
    }
};

// updates each bad guy with new values based on the actions of the last frame
Model.prototype.updateBadGuys = function(){
    var that = this;
    for (var n = 0; n < this.badGuys.length; n++) {
        var badGuy = this.badGuys[n];
        if (badGuy.alive
			&& this.hero.alive
			&& !badGuy.attacking
			&& badGuy.canAttack 
			&& this.nearby(this.hero, badGuy)
			&& ((badGuy.x - this.hero.x > 0 && !badGuy.isFacingRight()) || (this.hero.x - badGuy.x > 0 && badGuy.isFacingRight()))) {
			badGuy.attack();
            setTimeout(function(){
                that.hero.damage();
            }, 200);
        }
        this.updateActor(badGuy);
    }
};

// updates all of the game objects for each animation frame
Model.prototype.updateStage = function(){
    var controller = this.controller;
    var canvas = controller.view.canvas;
    if (controller.state == controller.states.PLAYING) {
        this.removeDefeatedBadGuys();
        
        // if hero dies then set state to GAMEOVER
        if (!this.hero.alive && controller.state == controller.states.PLAYING) {
            controller.state = controller.states.GAMEOVER;
        }
        
        // if all bad guys defeated, change state to WON
        if (this.badGuys.length == 0) {
            controller.state = controller.states.WON;
        }
        
        // move bad guys around
        this.moveBadGuys();
        
        // update level position
        this.updateLevel();
        
		/*
		 * update bad guys and also see
		 * if they can attack the hero
		 */
        this.updateBadGuys();
        
        // update hero
        var oldHeroX = this.hero.x;
        this.updateActor(this.hero);
        this.updateHeroCanvasPos(oldHeroX);
        
        // update health bar
        this.healthBar.setHealth(this.hero.health);
        
        // if hero falls into a hole set health to zero
        if (this.hero.y > canvas.height - this.hero.spriteSize * 2 / 3) {
            this.hero.health = 0;
        }
        
        // update avg fps
        var anim = controller.anim;
        if (anim.getFrame() % 20 == 0) {
            this.controller.avgFps = Math.round(anim.getFps() * 10) / 10;
        }
    }
};

// initializes vaules such as the location and size for the health bar
Model.prototype.initHealthBar = function(){
    this.healthBar = new HealthBar({
        controller: this.controller,
        maxHealth: this.hero.maxHealth,
        x: 10,
        y: 10,
        maxWidth: 150,
        height: 20
    });
};

// initializes the levels controller x, y, left and right bound values
Model.prototype.initLevel = function(){
    this.level = new Level({
        controller: this.controller,
        x: 0,
        y: 0,
        leftBounds: 100,
        rightBounds: 500
    });
};

// initializes the hero character, first by setting up
// the motions with values based on the sprite sheets
// then by instantiating a new actor object which is
// initialized with values defined in the controller
// lastly sets the characters beginning position
Model.prototype.initHero = function(){
    // initialize Hero
    var heroMotions = {
        STANDING: {
            index: 0,
            numSprites: 5,
            loop: true
        },
        AIRBORNE: {
            index: 1,
            numSprites: 5,
            loop: false
        },
        RUNNING: {
            index: 2,
            numSprites: 6,
            loop: true
        },
        ATTACKING: {
            index: 3,
            numSprites: 5,
            loop: false
        }
    };
    
    this.hero = new Actor({
        controller: this.controller,
        normalSpriteSheet: this.controller.images.heroSprites,
        hitSpriteSheet: this.controller.images.heroHitSprites,
        x: 30,
        y: 381,
        playerSpeed: 300,
        motions: heroMotions,
        startMotion: heroMotions.STANDING,
        facingRight: true,
        moving: false,
        spriteInterval: 90,
        maxHealth: 3,
        attackRange: 100,
        minAttackInterval: 200
    });
    
    this.heroCanvasPos = {
        x: this.hero.x,
        y: this.hero.y
    };
};

// initializes the hero character, first by setting up
// the motions with values based on the sprite sheets
// sets each bad guy's starting position and orientation
// then by instantiates a new actor object which is
// initialized with values defined in the controller for each bad guy
Model.prototype.initBadGuys = function(){
    // notice that AIRBORNE and RUNNING
    // both use the same sprite animation
    var badGuyMotions = {
        RUNNING: {
            index: 0,
            numSprites: 6,
            loop: true
        },
        AIRBORNE: {
            index: 0,
            numSprites: 4,
            loop: false
        },
        ATTACKING: {
            index: 1,
            numSprites: 4,
            loop: false
        }
    };
    
    var badGuyStartConfig = [{
        x: 600,
        facingRight: true
    }, {
        x: 1460,
        facingRight: true
    }, {
        x: 2602,
        facingRight: true
    }, {
        x: 3000,
        facingRight: true
    }, {
        x: 6402,
        facingRight: true
    }, {
        x: 6602,
        facingRight: true
    }];
    
    for (var n = 0; n < badGuyStartConfig.length; n++) {
        this.badGuys.push(new Actor({
            controller: this.controller,
            normalSpriteSheet: this.controller.images.badGuySprites,
            hitSpriteSheet: this.controller.images.badGuyHitSprites,
            x: badGuyStartConfig[n].x,
            y: 381,
            playerSpeed: 100,
            motions: badGuyMotions,
            startMotion: badGuyMotions.RUNNING,
            facingRight: badGuyStartConfig[n].facingRight,
            moving: true,
            spriteInterval: 160,
            maxHealth: 3,
            attackRange: 100,
            minAttackInterval: 2000
        }));
    }
};

// serves as a simple AI engine for the continual movement of bad guys
Model.prototype.moveBadGuys = function(){
    var level = this.level;
    for (var n = 0; n < this.badGuys.length; n++) {
        var badGuy = this.badGuys[n];
        
        if (badGuy.alive) {
            if (badGuy.isFacingRight()) {
                badGuy.x += 5;
                if (!level.getZoneInfo(badGuy.getCenter()).inBounds) {
                    badGuy.facingRight = false;
                }
                badGuy.x -= 5;
            }
            
            else {
                badGuy.x -= 5;
                if (!level.getZoneInfo(badGuy.getCenter()).inBounds) {
                    badGuy.facingRight = true;
                }
                badGuy.x += 5;
            }
        }
    }
};

// updates current level position based on heros position
Model.prototype.updateLevel = function(){
    var hero = this.hero;
    var level = this.level;
    level.x = -hero.x + this.heroCanvasPos.x;
};

// updates the position of the hero relative to the canvas
Model.prototype.updateHeroCanvasPos = function(oldHeroX){
    this.heroCanvasPos.y = this.hero.y;
    var heroDiffX = this.hero.x - oldHeroX;
    var newHeroCanvasPosX = this.heroCanvasPos.x + heroDiffX;
    // if moving right and not past right bounds
    if (heroDiffX > 0 && newHeroCanvasPosX < this.level.rightBounds) {
        this.heroCanvasPos.x += heroDiffX;
    }
    // if moving left and not past left bounds
    if (heroDiffX < 0 && newHeroCanvasPosX > this.level.leftBounds) {
        this.heroCanvasPos.x += heroDiffX;
    }
	
	if (this.hero.x < this.level.leftBounds) {
		this.heroCanvasPos.x = this.hero.x;
	}
};

// updates characters variables such as position and life state
Model.prototype.updateActor = function(actor){
    if (actor.alive) {
        if (actor.health <= 0 || actor.y + actor.SPRITE_SIZE > this.controller.view.canvas.height) {
            actor.alive = false;
        }
        else {
			this.updateActorVY(actor);            
			this.updateActorY(actor);
			this.updateActorX(actor);
            
            actor.updateSpriteMotion();
			actor.updateSpriteSeqNum();
        }
    }
    else {
        if (actor.opacity > 0) {
            actor.fade();
        }
    }
};

// Uses the downward force of gravity and the upward force of the
// levitation pods to update teh vertical velocity of an actor
Model.prototype.updateActorVY = function(actor) {
	var anim = this.controller.anim;
	var level = this.level;
	
    // apply gravity (+y)
    var gravity = this.controller.model.level.GRAVITY;
    var speedIncrementEachFrame = gravity * anim.getTimeInterval() / 1000; // pixels / second
    actor.vy += speedIncrementEachFrame;        
    
    // apply levitation (-y)
    if (level.getZoneInfo(actor.getCenter()).levitating) {
        actor.vy = (65 - actor.y) / 200;
    }
};

// updates the y position of the character based on his vertical velocity
Model.prototype.updateActorY = function(actor) {
	var anim = this.controller.anim;
	var level = this.level;
    var oldY = actor.y;
    actor.y += actor.vy * anim.getTimeInterval();
    
    if (level.getZoneInfo(actor.getCenter()).inBounds) {
        actor.airborne = true;
    }
    else {
        actor.y = oldY;
        
        // handle case where player has fallen to the ground
        // if vy is less than zero, this means the player has just
        // hit the ceiling, in which case we can simply leave
        // this.y as oldY to prevent the player from going
        // past the ceiling
        if (actor.vy > 0) {
            while (level.getZoneInfo(actor.getCenter()).inBounds) {
                actor.y++;
            }
            actor.y--;
            actor.vy = 0;
            actor.airborne = false;
        }
    }
};

// updates the characters x position in the level by checking orientation and movement
Model.prototype.updateActorX = function(actor) {
	var anim = this.controller.anim;
	var level = this.level;
    var oldX = actor.x;
	var changeX = actor.playerSpeed * (anim.getTimeInterval() / 1000);
    if (actor.moving) {
        actor.facingRight ? actor.x += changeX : actor.x -= changeX;
    }
    
    if (!level.getZoneInfo(actor.getCenter()).inBounds) {
        actor.x = oldX;
        
        while (level.getZoneInfo(actor.getCenter()).inBounds) {
            actor.facingRight ? actor.x++ : actor.x--;
        }
        
        // reposition to nearest placement in bounds
        actor.facingRight ? actor.x-- : actor.x++;
    }
};

// checks proximity between characters in the level
Model.prototype.nearby = function(actor1, actor2){
    return (Math.abs(actor1.x - actor2.x) < actor1.attackRange)
		&& Math.abs(actor1.y - actor2.y) < 30;
};

