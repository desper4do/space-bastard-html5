//
// Global Resources Bank
//

Engine.Resources = {};
Engine.Resources.SpriteSheet = (function(){
	// raw item data from data files
	var _items = {};

	// created sprites
	var _sprites = {};

	//
	// create sprites from one spritesheet data file
	//
	// @param Object spriteSheetData - spritesheet data
	// @param Canvas canvas - canvas element
	//
	function _createSprites(spriteSheetData, canvas)
	{
		var spriteObj = spriteSheetData.sprites;

		// get and load image
		var img = new Image();
		img.src = spriteSheetData.path;

		// iterate sprites property
		for (var spriteName in spriteObj) {
			//console.log(spriteName);
			if (spriteObj.hasOwnProperty(spriteName)) {
				//console.log("got sprite: " + spriteName + ", iterating..");

				// got sprite, so create it
				_sprites[spriteName] = new Engine.Sprite(canvas, img);
				_sprites[spriteName].name = spriteName;
				if (spriteObj[spriteName].skip) {
					_sprites[spriteName].skip = spriteObj[spriteName].skip;
				}
				
				// get some defined default values
				var defaults = spriteObj[spriteName].defaults || {};

				// iterate actions property
				var actionObj = spriteObj[spriteName].actions;
				for (var actionName in actionObj) {
					if (actionObj.hasOwnProperty(actionName)) {
						var act = actionObj[actionName];

						_sprites[spriteName].addAction(actionName, {
							name: actionName,
							currFrame: 0,
							totalFrames: defaults.fc || act.fc,
							alpha: defaults.alpha || act.alpha || 1.0,
							sx: act.x,
							sy: act.y,
							width: defaults.w || act.w,
							height: defaults.h || act.h,
							repeat: defaults.repeat || act.repeat,
							repeated: 0
						});
					}
				}

				var pivot = 'center';
				if ('pivot' in spriteObj[spriteName]) {
					pivot = spriteObj[spriteName].pivot;
				}

				_sprites[spriteName].setPivot(pivot);
			}
		}
	}

	//
	// @class Engine.Resources.SpriteSheet
	//
	return function(data) {
		if (typeof data == 'object') {
			_items[data.id] = data;
			_createSprites(data, null);
		}

		//
		// PUBLIC
		//

		//
		// Return true if spritesheet with given id is loaded
		//
		// @param string idName - spritesheet id
		// @return bool
		//
		this.spriteSheetExists = function(idName)
		{
			return (idName in _items);
		}


		//
		// Return true if sprite with given name is created
		//
		// @param string spriteName
		// @return bool
		//
		this.spriteExists = function(spriteName)
		{
			return (spriteName in _sprites);
		}


		//
		// Return sprite object
		//
		// @param string spriteName - sprite name
		// @return Engine.Sprite
		//
		this.getSprite = function(spriteName)
		{
			return _sprites[spriteName];
		}


		//
		// Return all created sprite objects
		//
		// @return Engine.Sprite[]
		//
		this.getSprites = function()
		{
			return _sprites;
		}


		//
		// Return raw data from spritesheet data files
		//
		// @return Object[]
		//
		this.getItems = function()
		{
			return _items;
		}
	}
})();