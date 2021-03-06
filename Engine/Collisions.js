//
// Amazing Collision System
//


//
// constructor
//
Engine.Collisions = function()
{
	this.friends = {};
	this.enemies = {};
	this.neutral = {};

	// flag that's we are in collision detection loop at the moment
	this._inCheck = false;

	// items that should be removed later
	this._garbage = [];
}


//
// create subgroup of given collision group
//
// @param string group - group name
// @param string subgroup - subgroup name
//
Engine.Collisions.prototype.createSubgroup = function(group, subgroup)
{
	if (!(group in this)) {
		throw new Error(Engine.Util.format("No such group '{0}'", group));
	}

	this[group][subgroup] = [];
}


//
// adds item to collision by given it's name
//
// @param string group - group name
// @param Object item - object
// @return bool
//
Engine.Collisions.prototype.add = function(group, subgroup, item)
{
	if (typeof(this[group]) == "undefined") {
		console.log("[E] No such collision group '" + group + "'");
		return false;
	}

	if (typeof this[group][subgroup] == "undefined") {
		this[group][subgroup] = [];
	}

	this[group][subgroup].push(item);
	return true;
}


//
// removes item from collision list by given group's name
//
// @param string group - group name
// @param string subgroup - subgroup name
// @param Object item - object
// @return bool
//
Engine.Collisions.prototype.remove = function(group, subgroup, item)
{
	// checking if removal was requested somewhere outside during collision detection loop
	if (!this._inCheck) {
		if (typeof(this[group]) == "undefined") {
			console.log("[E] No such collision group '" + group + "' to remove from", item);
			return false;
		}

		if (typeof this[group][subgroup] == "undefined") {
			throw new Error(Engine.Util.format("No such subgroup '{0}'", subgroup));
		}

		var pos = this[group][subgroup].indexOf(item);
		if (pos !== -1) {
			var start = this[group][subgroup].slice(0, pos);
			var end = this[group][subgroup].slice(pos + 1);
			this[group][subgroup] = start.concat(end);
			return true;
		}
	}
	else {
		// set this item for deletion when collision detect loop ends
		this._garbage.push({"group": group, "subgroup": subgroup, "item": item});
	}

	return false;
}


//
// search for any collision in given subgroup
//
// @param string subgroup - subgroup name
//
Engine.Collisions.prototype.check = function(subgroup)
{
	if (!this.friends[subgroup] || !this.enemies[subgroup]) {
		return;
	}

	function collision(c1, c2)
	{
		if (!c1 || !c2) {
			return false;
		}
		// for getting center coordinates
		var hw1 = c1.width() / 2;
		var hh1 = c1.height() / 2;
		var hw2 = c2.width() / 2;
		var hh2 = c2.height() / 2;

		var dx = (c1.x() + hw1) - (c2.x() + hw2);
		var dy = (c1.y() + hh1) - (c2.y() + hh2);
		var dist = c1.width() / 2 + c2.width() / 2;

		return (dx * dx + dy * dy <= dist * dist)
	}

	this._inCheck = true;
	// loop over all items to check for collision
	for (var i = 0, fCount = this.friends[subgroup].length; i < fCount; i++) {
		for (var j = 0, eCount = this.enemies[subgroup].length; j < eCount; j++) {
			var friend = this.friends[subgroup][i];
			var enemy = this.enemies[subgroup][j];
			if (collision(friend, enemy)) {
				//this.friends[i].onCollide(this.enemies[j]);
				//this.enemies[j].onCollide(this.friends[i]);
				friend.getEventManager().fire('collide', friend, enemy);
				enemy.getEventManager().fire('collide', enemy, friend);
				//return;
			}
		}
	}
	this._inCheck = false;

	if (this._garbage.length > 0) {
		for (var k = 0, max = this._garbage.length; k < max; k++) {
			this.remove(this._garbage[k].group, this._garbage[k].subgroup, this._garbage[k].item);
		}
		this._garbage = [];
	}
}


Engine.Collisions.prototype.removeAll = function()
{
	var groups = ["friends", "enemies", "neutral"];
	for (var i = 0, max = groups.length; i < max; i += 1) {
		var subgroups = this[groups[i]];
		for (var subgroup in subgroups) {
			subgroups[subgroup] = [];
			/*
			for (var j = 0, len = subgroups[subgroup].length; j < len; j += 1) {
				var item = subgroups[subgroup][j];
				this.remove(groups[i], subgroup, item);
			} */
		}
	}

	/*
	for (var i = 0, max = groups.length; i < max; i += 1) {
		for (var j = 0, len = this[groups[i]].length; j < len; j += 1) {
			this.remove(groups[i], this[groups[i]][j]);
		}
	}*/
}