/*
 * Game controller
 * 
 * The controller is responsible for instantiating
 * the view and the model, initializing the game,
 * controlling the game state, and managing keyboard events
 *  
 * includes methods: 
 *  
 *  loadImages() - loads all of the game images and then calls initGame() when they have all loaded
 *  addKeyboardListeners() - attaches keyboard event listener to the game
 *  handleKeyup() - method that is fired when a key is released
 *  handleKeydown() - method that is fired when the key is pressed down
 *  initGame() - initializes the game by calling the initialize functions for all objects in model class
 *  resetGame() - resets the game by reinitializing the game objects in model class
 */
 
// initializes the game, creating a map to all of the images/sprite sheets
// sets up a state map, key map, and instantiates all objects needed to start. 
function Controller(canvasId){
    this.imageSources = {
        levelBounds: "img/level_bounds.png",
        level: "img/level.png",
        heroSprites: "img/hero_sprites.png",
        heroHitSprites: "img/hero_hit_sprites.png",
        badGuySprites: "img/bad_guy_sprites.png",
        badGuyHitSprites: "img/bad_guy_hit_sprites.png",
        background: "img/background.png",
        readyScreen: "img/readyScreen.png",
        gameoverScreen: "img/gameoverScreen.png",
        winScreen: "img/winScreen.png"
    };
    this.images = {};
    
    this.states = {
        INIT: "INIT",
        READY: "READY",
        PLAYING: "PLAYING",
        WON: "WON",
        GAMEOVER: "GAMEOVER"
    };
	
	this.keys = {
		ENTER: 13,
		UP: 38,
		LEFT: 37,
		RIGHT: 39,
		A: 65 
	};
	
	this.anim = new Animation(canvasId);
    this.state = this.states.INIT;
    this.model = new Model(this);
    this.view = new View(this);
	this.avgFps = 0;
	this.leftKeyup = true;
	this.rightKeyup = true;
    this.addKeyboardListeners();
    this.loadImages();
}

// loads all of the game images and then 
// calls initGame() when they have all loaded
Controller.prototype.loadImages = function(){
	/*
	 * we need to load the loading image first
	 * so go ahead and insert it into the dom
	 * and them load the rest of the images
	 */
	this.view.canvas.style.background = "url('img/loadingScreen.png')";
	
    var that = this;
    var loadedImages = 0;
    var numImages = 0;
    for (var src in this.imageSources) {
        numImages++;
    }
    for (var src in this.imageSources) {
        this.images[src] = new Image();
        this.images[src].onload = function(){
            if (++loadedImages >= numImages) {
                that.initGame();
            }
        };
        this.images[src].src = this.imageSources[src];
    }
};

// attaches keyboard event listener to the game
Controller.prototype.addKeyboardListeners = function(){
    var that = this;
    document.onkeydown = function(evt){
        that.handleKeydown(evt);
    };
    document.onkeyup = function(evt){
        that.handleKeyup(evt);
    };
};

// method that is fired when a key is released
Controller.prototype.handleKeyup = function(evt){
    keycode = ((evt.which) || (evt.keyCode));
    
    switch (keycode) {
        case this.keys.LEFT: 
            this.leftKeyup = true;
            if (this.leftKeyup && this.rightKeyup) {
                this.model.hero.stop();
            }
            break;
            
        case this.keys.UP: 
            break;
            
        case this.keys.RIGHT: 
            this.rightKeyup = true;
            if (this.leftKeyup && this.rightKeyup) {
                this.model.hero.stop();
            }
            break;
    }
};

// method that is fired when the key is pressed down
Controller.prototype.handleKeydown = function(evt){
    var that = this;
    keycode = ((evt.which) || (evt.keyCode));
    switch (keycode) {
        case this.keys.ENTER: // enter
            if (this.state == this.states.READY) {
                this.state = this.states.PLAYING;
                // start animation
                this.anim.start();
            }
            else if (this.state == this.states.GAMEOVER || this.state == this.states.WON) {
                this.resetGame();
                this.state = this.states.PLAYING;
            }
            break;
        case this.keys.LEFT: 
            this.leftKeyup = false;
            this.model.hero.moveLeft();
            break;
            
        case this.keys.UP: 
            this.model.hero.jump();
            break;
            
        case this.keys.RIGHT: 
            this.rightKeyup = false;
            this.model.hero.moveRight();
            break;
            
        case this.keys.A: // attack
        	var model = this.model;
			var hero = model.hero; 
            hero.attack();
            setTimeout(function(){
                for (var n = 0; n < model.badGuys.length; n++) {
                    (function(){
                        var badGuy = model.badGuys[n];
                        if (model.nearby(hero, badGuy)
							&& ((badGuy.x - hero.x > 0 && hero.isFacingRight()) || (hero.x - badGuy.x > 0 && !hero.isFacingRight()))) {
                            badGuy.damage();
                        }
                    })();
                }
            }, 200);
            break;
    }
};

// initializes the game by calling the initialize functions for all objects in model class
Controller.prototype.initGame = function(){
	var model = this.model;
	var view = this.view;
    model.initLevel();
    model.initHero();
    model.initBadGuys();
    model.initHealthBar();

    // set stage function
    this.anim.setStage(function(){
        model.updateStage();
        view.drawStage();
    });
    
    // game is now ready to play
    this.state = this.states.READY;
    view.drawScreen(this.images.readyScreen);
};

// resets the game by reinitializing the game objects
Controller.prototype.resetGame = function(){
    var model = this.model;
	model.level = null;
    model.hero = null;
    model.healthBar = null;
    model.badGuys = [];
    
    model.initLevel();
    model.initHero();
    model.initBadGuys();
    model.initHealthBar();
};

