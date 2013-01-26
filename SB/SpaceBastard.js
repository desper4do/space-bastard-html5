//
// Global game object
//

var SB = {
	canvasId: '',
	game: null,
	gui: null,
	player: null,
	level: null,

	ammoData: [
		{
			"sprite": "ammo1",
			"damage": 20,
			"velocity": 8,
			"ratio": 4,
			"angles": [90]
		},

		{
			"sprite": "ammo1",
			"damage": 20,
			"velocity": 8,
			"ratio": 4,
			"angles": [87, 93]
		},

		{
			"sprite": "ammo1",
			"damage": 20,
			"velocity": 8,
			"ratio": 4,
			"angles": [90, 60, 120]
		},

		{
			"sprite": "ammo1",
			"damage": 20,
			"velocity": 8,
			"ratio": 4,
			"angles": [90, 75, 90 + 90 - 75, 45, 90 + 90 - 45]
		}
	],

	enemyData: {
		enemy1: {
			sprite: 'enemy1',
			health: 100,
			ammo: {
				sprite: "enemyAmmo1",
				damage: 20,
				velocity: -3,
				ratio: 0.5,
				angles: [90]
			}
		},
		enemy2: {
			sprite: "enemy2",
			health: 150,
			ammo: {
				sprite: "enemyAmmo1",
				damage: 5,
				velocity: -7,
				ratio: 2,
				angles: [90]
			}
		},
		enemy3: {
			sprite: "enemy3",
			health: 75,
			ammo: {
				sprite: "enemyAmmo1",
				damage: 75,
				velocity: -9,
				ratio: 0.25,
				angles: [90]
			}
		},
		enemy4: {
			sprite: "enemy4",
			health: 75,
			ammo: {
				sprite: "enemyAmmo1",
				damage: 50,
				velocity: -3,
				ratio: 1,
				angles: [90]
			}
		},
		enemy5: {
			sprite: "enemy5",
			health: 2000,
			ammo: {
				sprite: "ammo1",
				damage: 150,
				velocity: 8,
				ratio: 4,
				angles: [90]
			}
		},
		enemy6: {
			sprite: "enemy6",
			health: 1300,
			ammo: {
				sprite: "enemyAmmoMine",
				damage: 200,
				velocity: -3,
				ratio: 1.5,
				angles: [85, 95]
			}
		},
		enemy7: {
			sprite: "enemy7",
			health: 3000,
			ammo: {
				sprite: "enemyAmmo1",
				damage: 50
			}
		},
		boss1: {
			sprite: "boss1",
			health: 8000,
			ammo: {
				sprite: "enemyAmmo1",
				damage: 250
			}
		}
	},


	//
	// game init - main entry point of game
	//
	init: function(canvasId)
	{
		var self = this,
			game = self.game = new Engine.Game(canvasId),
			rp = game.rp;

		self.canvasId = canvasId;

		// create gui system
		self.gui = new Engine.GuiSystem(self.game);

		// create level object but do not load it
		self.level = new SB.Level()
			.on('finish', function(lvl) {
				console.log(Engine.Util.format("Level {0} finished!", lvl.getNumber()));
			})
			.on('enemydie', function(lvl, enemy) {
				SB.game.sm.play("explosionStrong");
				self.player.score += enemy.maxHealth;
				game.ent.label1.text = self.player.score;
			});

		// init controls
		self.initMouse();
		self.initKeyboard();

		// create empty scenes
		// render pipeline for game
		rp.createScene("main")
			// render pipeline for main menu scene
			.createScene("main-menu")
			// render pipeline for pause menu
			.createScene("pause-menu")
			// level loading animation
			.createScene("loading-screen")
			// game over scene
			.createScene("game-over");

		// load sprite sheets
		var spriteSheetDir = "img/sprites/";
		game.ssm.setDir(spriteSheetDir)
			.load(['gui/buttons', 'gui/elements', 'hero'], function(ssm) {
				// all spritesheets loaded
				game.bg.mainMenu = new Engine.Background(game.canvas)
					.load("img/sprites/gui/start.jpg", function() {
						// let's start create entities
						// main menu
						game.scene("main-menu");
						game.ent.buttonStart = new Engine.GuiButton("menuButton1", game);
						game.ent.buttonStart
							.x(600).y(240)
							.set({
								text: "Start",
								captionFont: {
									normal: "20px Arial",
									hover: "20px Arial bold"
								},
								captionColor: {
									normal: "#ffffff",
									hover: "#ff0000"
								},
								captionAlign: "center",
								captionMargin: {
									top: 0, right: 0, bottom: 0,
									left: -10
								}
							})
							.on('click', function() {
								// show loading screen
								game.sm.play("click");
								game.scene('loading-screen');

								// load level
								SB.level.load(1);
							});

						game.ent.pointer = new Engine.GuiPointer("pointer", game);
						SB.gui.addItem(game.bg.mainMenu)
							.addItem(game.ent.buttonStart)
							.addItem(game.ent.pointer);

						// once all entities are create start game
						self.game.scene("main-menu");
						self.game.on('scenechange', self.onSceneChange);

						// start all loops here
						self.game.start();
					});

				game.bg.doors = new Engine.Background(game.canvas)
					.load('img/backgrounds/doors.jpg')
					.setMode('curtain', {
						type: 'horizontal',
						speed: 10
					})
					.on('load', function(bg) {
						game.rp.addItem(bg, 'loading-screen');
					})
					.on('finish', function(bg) {
						game.scene('main');
						bg.reinit();
					});

				// sounds
				game.sm.load({handle: 'mainTheme', path: 'sounds/main-theme.wav', loop: true, autoPlay: true})
					.load({handle: 'click', path: 'sounds/menu_click.wav'})
					.load({handle: 'pause0', path: 'sounds/pause-theme0.wav', loop: true})
					.load({handle: 'pause1', path: 'sounds/pause-theme1.WAV', loop: true})
					.load({handle: 'pause2', path: 'sounds/pause-theme2.wav', loop: true})
					.load({handle: 'pause3', path: 'sounds/pause-theme3.wav', loop: true})
					.load({handle: 'pulse', path: 'sounds/pulse.wav'})
					.load({handle: 'explosionStrong', path: 'sounds/explosion-strong.wav'})
					.volume('', 0.05); // set very low volume for a while :)

				// create game over scene
				game.ent.buttonRestart = new Engine.GuiButton("menuButton1", game);
				game.ent.buttonRestart
					.x(400).y(240)
					.set({
						text: "Restart",
						captionFont: {
							normal: "20px Arial",
							hover: "20px Arial bold"
						},
						captionColor: {
							normal: "#ffffff",
							hover: "#ff0000"
						},
						captionAlign: "center",
						captionMargin: {
							top: 0, right: 0, bottom: 0,
							left: -10
						}
					})
					.on('click', function() {
						console.log('click');
						// show loading screen
						game.sm.play("click");
						//SB.game.removeSceneEntities('main');
						game.scene('main');

						SB.level.run();
						// load level
						//SB.level.load(1);
					});
			});

		// some callbacks
		SB.level.on('load', function() {
			// create some entities that are not managed by level
			SB.gui.addItem(SB.level.bg, 'main');

			// create gui for pause menu
			SB.gui.addItem(SB.level.bg, 'pause-menu');
			game.ent.pauseMenuBtn1 = new Engine.GuiButton("pauseMenuBtn1", game);
			game.ent.pauseMenuBtn1.captionColor.hover = "#555555";
			game.ent.pauseMenuBtn1.captionMargin.left = -10;
			game.ent.pauseMenuBtn1.x(600).y(240)
				.set({
					captionAlign: 'center',
					text: 'Back',
					captionFont: {
						normal: "20px Arial",
						hover: "20px Arial bold"
					}
				})
				.on('click', function() {
					game.sm.play("click");
					game.scene("main");
				})

			SB.gui.addItem(game.ent.pauseMenuBtn1, "pause-menu")
				.addItem(game.ent.pointer, "pause-menu");

			// other useful items
			game.ent.label1 = new Engine.GuiLabel(game);
			game.ent.label1.set({
				x: 20, y: 20,
				width: 500,
				color: "#ffffff",
				font: "18px Tahoma",
				text: "0"
			});
			SB.gui.addItem(game.ent.label1, "main");

			game.ent.pg = new Engine.GuiProgress("progress", "progressStep", game);
			game.ent.pg.x(10).y(560);
			game.ent.pg.value = 100;
			game.ent.pg.on('update', function(pg) {
				pg.value = game.ent.hero.health / game.ent.hero.maxHealth * 100;
			});
			SB.gui.addItem(game.ent.pg, "main");

			// set game over scene
			game.scene('game-over');
			SB.gui.addItem(SB.level.bg)
				.addItem(game.ent.buttonRestart)
				.addItem(game.ent.pointer);

			// create player instance
			self.player = new SB.Player()
				.set({score: 0});

			game.scene('main');
			SB.level.run();
		})
	},


	//
	// init mouse behaviour callbacks on various scenes
	//
	initMouse: function()
	{
		var self = this;
		self.game
			.on('mousemove', function(game, e) {
				if (game.scene() != 'main') {
					game.ent.pointer.x(e.clientX).y(e.clientY);
					self.gui.onMouseMove(e);
				}
			})
			.on('mouseout', function(game, e) {
				switch (game.scene()) {
				case 'main':
					game.scene('pause-menu');
					break;
				}
			})
			.on('click', function(game, e) {
				if (game.scene() != 'main') {
					self.gui.onClick(e);
				}
			});
	},


	//
	// init keyboard handling on various scenes
	//
	initKeyboard: function()
	{
		var self = this;
		self.game.on('keydown', function(game, e) {
			switch (e.keyCode) {
			case game.KEY_ESCAPE:
				if (game.scene() == "main") {
					game.scene("pause-menu");
				}
				else if (game.scene() == "pause-menu") {
					game.scene("main");
				}
				break;
			}
		});
	},




	onSceneChange: function(from, to)
	{
		var sc = from + "." + to;
		switch (sc) {
		case 'main-menu.loading-screen':
			SB.game.sm.pauseAll();
			break;
		case 'loading-screen.main':
			// game start
			console.log("go go go!");
			SB.game.sm.pause("mainTheme");
			SB.game.sm.play("level1");
			break;

		case 'main.main-menu':
			SB.game.ent.pointer.x(SB.game.ent.hero.x());
			SB.game.ent.pointer.y(SB.game.ent.hero.y());
			SB.game.removeSceneEntities('main');
			SB.game.sm.pauseAll();
			SB.game.sm.play("mainTheme");
			break;

		case 'main.pause-menu':
			SB.game.sm.pause("level1");
			SB.game.sm.play("pause" + Engine.Util.random(0, 3));
			break;

		case 'pause-menu.main':
			SB.game.sm.pauseAll();
			SB.game.sm.play("level1");
			break;
		}
	},


	onPowerupTake: function(powerup)
	{
		//console.log("I'VE GOT A POWER!");
		//console.log(powerup);
		this.player.ammo += 1;
	}
}