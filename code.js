
var latestLemming;
var lemmingId;
var objectId;
var lemmingHeight = 1;
var lemmingWidth = 0.5;
var velocity = 2;
var lemmingsArrived;

function collisionFunction(e)
{	
	// there is a problem with stairs: first four collisions are ok
	// the following two lines counter that effect
	if (this.getAttribute("task") == "stairs") this.body.velocity.set(0, 0, 0);

	if (this.getAttribute("lastCollision") == e.detail.body.el.id) 
	{
		//console.log("-------------------------------------");
		//console.log("collision with velocity: " + this.body.velocity.x);
		console.log(this.id + ": collision skipped (v: " + this.body.velocity.x + ")");
		if ( (this.getAttribute("task") == "walking") && (getLemming(this.id) != null) ) setTimeout(setVelocity, 100, this, "maintain");
		return; // we get four events per collision. Ignore the last three for now
	}
	this.setAttribute("lastCollision", e.detail.body.el.id); 

	console.log(this.id + "-------------------------------------");
	console.log(this.id + ": collision with body #" + e.detail.body.el.id);
	console.log(this.id + ": collision with class: " + e.detail.body.el.className);
	console.log(this.id + ": collision with velocity: " + this.body.velocity.x + " | " + this.body.velocity.y + " | " + this.body.velocity.z);
	
	if(e.detail.body.el.id == "exit")
	{
		lemmingsArrived++;
		console.log(this.id + ": reached destination. Removing. Total arrived: " + lemmingsArrived);
		this.parentNode.removeChild(this);	// throws an error but seems to work fine
		return;
	}
	if(e.detail.body.el.id == "theVoid")
	{
		console.log(this.id + ": fell out of the world. Removing.");
		this.parentNode.removeChild(this);	// throws an error but seems to work fine
		return;
	}

	// check the relative height (delta) of the colliding object. Theoretically, delta is zero, if the lemming is standing on the object
	// delta height indicates the height of the object above the lemmings "feet"
	var other = e.detail.body.el;
	var otherHeight = other.getAttribute("height");
	var otherYPos = other.getAttribute("position").y;
	var lemmingYPos = this.getAttribute("position").y;

	var delta = otherYPos + otherHeight/2 - (lemmingYPos - lemmingHeight/2);
	console.log(this.id + ": delta: " + delta + " with " + e.detail.body.el.className);

	// there is no continuous collision checking, only periodically. Fast objects clip into other objects, until a collision is registered
	// faster objects clip further into other objects, resulting in a higher delta (at vertical speeds). Avoid high acceleration! Mostly caused by falling.

	console.log(this.id + ": task: " + this.getAttribute("task") + " == falling: " + (this.getAttribute("task") == "falling"));
	if (this.getAttribute("task") == "falling")
	{
		console.log(this.id + ": should be walking");
		//this.removeAttribute("task");
		this.setAttribute("task", "walking");
		lemming.setAttribute("gltf-model", "#lemming_walk");
		//setTimeout(function(e) {e.setAttribute("task", "walking");}, 100, this);
		//this.removeAttribute("color");
		setTimeout(function(e) {e.setAttribute("color", "#33cc33");}, 100, this);
		setTimeout(setVelocity, 100, this, "maintain");
		//this.removeAttribute("lastCollision");
		return;
	}

	if ((delta < 0.09) && (delta > -0.09))	// collision with floor
	{
		if (this.body.velocity.y < -9.5)
		{
			killLemming(this.id);
			return;
		}	
	}
	if ((delta > 0.09) && (delta < 0.11) && (e.detail.body.el.className == "stair") )	// collision with stair
	{
		console.log(this.id + ": walking up stairs");
		var x = this.body.position.x;
		var y = this.body.position.y;
		var z = this.body.position.z;

		this.body.velocity.set(0,3.6,0);
		setTimeout(setVelocity, 30, this, "maintain");
		return;
	}

	if ((delta > 0.11))	// collision with wall or ceiling
	{
		if (e.detail.body.el.className == "stair") 
		{	
			//console.log("group");
			//e.detail.body.collisionFilterGroup = 4;
			//setTimeout(setVelocity, 1, this, "maintain");
			if (this.getAttribute("direction") == "right")	this.body.collisionFilterGroup = 4;
			else											this.body.collisionFilterGroup = 8;
		}
		else turnAround(this);
	};	

	if ((delta > lemmingHeight) && ( (otherYPos - otherHeight/2) > (lemmingYPos + lemmingHeight/2) ))	// collision with ceiling
	{

		// if the lemming is building stairs, abort and resume walking
		var timer = this.getAttribute("timer");
		if (timer != null) 
		{
			console.log(this.id +  ": aborted building stairs");
			clearTimeout(timer);
			this.removeAttribute("timer");
			setTimeout(setVelocity, 10, this, "maintain");
		}
		
	}
}

// used for lemmngs walking to the other side when hitting a wall or turning around when building stairs and hitting a wall
function turnAround(lemming)
{
	var dir = lemming.getAttribute("direction");
	var vel = lemming.body.velocity.x;
	if (dir == "right")	
	{
		lemming.setAttribute("direction", "left");
	}
	else
	{
		lemming.setAttribute("direction", "right");
	}
	//if (vel * vel > 0.1)				setTimeout(setVelocity, 100, lemming, "maintain");
	//else								setTimeout(setVelocity, 100, lemming, 0);
	setTimeout(setVelocity, 100, lemming, "maintain");
	console.log(lemming.id + ": velocity after turning: " + lemming.body.velocity.x);

	// reset lemming collision group
	lemming.body.collisionFilterGroup = 2;

}

// used as timed function when climbing stairs
function setVelocity(object, v)
{
	if (object.getAttribute("task") == "walking")
	{
		if (v == "maintain")
		{
			if (object.getAttribute("direction") == "right") 	v = velocity;
			else												v = -velocity;
		}
		console.log(object.id + ": setting velocity to " + v);
		object.body.velocity.set(v,0,0);
	}
}

function getLemming(id)
{
	if (typeof id == "string") id = id.substring(7);
	var l = document.querySelector("#lemming"+id);
	return l;
}

function spawnLemming()
{
	var spawner = document.querySelector("#spawner")
	if (spawner == null)
	{
		console.log("no spawner detected");
		return false;
	}
	var spawnPos = spawner.getAttribute("position");

	var lemming = document.createElement("a-box");
	lemming.className = "lemming";
	lemming.setAttribute("position", spawnPos.x + " " + (spawnPos.y-0.7) + " " + spawnPos.z);
	lemming.setAttribute("dynamic-body", "linearDamping: 0"); // linear damping can also be added inside "body-loaded" event listener
	//lemming.setAttribute("mass", "1");
	lemming.setAttribute("width", lemmingWidth);
	lemming.setAttribute("height", lemmingHeight);
	lemming.setAttribute("depth", lemmingWidth);
	lemming.setAttribute("color", "#33cc33");
	lemming.setAttribute("lastCollision", "");
	lemming.setAttribute("id", "lemming"+lemmingId);
	
	lemming.setAttribute("task", "falling");
	//lemming.setAttribute("constraint", "target: #test; collideConnected: false;");

	var text = document.createElement("a-text");
	text.setAttribute("value", lemmingId);
	text.setAttribute("position", "0 0 0.5");
	text.setAttribute("align", "center");
	text.setAttribute("font", "exo2bold");
	text.setAttribute("width", 10);
	text.setAttribute("color", "#555555");

	lemming.addEventListener("body-loaded", function(e) 
	{
		console.log("body of lemming #" + this.body.id + " loaded");
		this.body.fixedRotation = true;
		this.setAttribute("velocity", "0 0 0");
		this.setAttribute("direction", "right");
		this.body.collisionFilterGroup = 2;
		this.body.collisionFilterMask = 1;
		lemming.appendChild(text);
	});

	lemming.addEventListener("collide", collisionFunction);

	document.querySelector("a-scene").appendChild(lemming);
	//document.querySelector("a-scene").appendChild(text);
	//lemming.setAttribute("constraint", "target: label"+lemmingId+"; type: lock");

	latestLemming = lemming;
	lemmingId++;
}

function stopOthers(id)
{
	var lemming = getLemming(id);
	if (lemming == null) 
	{
		console.log("Invalid lemming ID");
		return false;
	}
	lemming.removeEventListener("collide", collisionFunction);
	lemming.setAttribute("task", "stop");
	lemming.setAttribute("color", "#006600");
	lemming.body.velocity.set(0,0,0);
	lemming.body.invMass = 0;
	lemming.body.collisionFilterGroup = 1;
	lemming.body.collisionFilterMask = 1+2+4+8;
}

function digDown(id)
{
	var lemming = getLemming(id);
	if (lemming == null) 
	{
		console.log("Invalid lemming ID");
		return false;
	}
	lemming.setAttribute("color" , "#55AA55");
	lemming.body.velocity.set(0,0.1,0);
	lemming.setAttribute("task", "digDown");
	setTimeout(digDownPartTwo, 200, lemming);
}

// split floor into three parts: left side, right side and tunnel element in center that gets smaller until it disappears
function digDownPartTwo(lemming)
{
	var floorId = lemming.getAttribute("lastCollision");
	var floor = document.querySelector("#"+floorId);
	var halfFloorWidth = floor.getAttribute("width") / 2;
	var floorHeight = floor.getAttribute("height");
	var floorDepth = floor.getAttribute("depth");
	var floorPos = floor.body.position;
	var lemmingX = lemming.body.position.x;
	var tunnelWidth = lemmingWidth*2;
	var tunnelX = lemmingX;

	// calculate values for left side
	var leftWidth = floorPos.x - halfFloorWidth;
	if (leftWidth < 0) leftWidth = leftWidth * -1;
	leftWidth += lemmingX - lemmingWidth;
	var leftX = lemmingX - lemmingWidth - (leftWidth / 2); 

	// calculate values for right side
	var rightBound = floorPos.x + halfFloorWidth;
	var lemmingRight = lemmingX + lemmingWidth;
	var rightWidth = rightBound - lemmingRight;
	console.log("floorX: " + floorPos.x + " | halfFloorWidth: " + halfFloorWidth + " | lemmingX: " + lemmingX + " | lemmingWidth: " + lemmingWidth);
	var rightX = lemmingX + lemmingWidth + (rightWidth / 2);
	
	var scene = document.querySelector("a-scene");
	scene.removeChild(floor);

	// the lemming is not digging at the left end of the floor
	if (leftWidth > 0) {
		createBox(leftWidth, floorHeight, floorDepth, leftX + " " + floorPos.y + " " + floorPos.z, "floor", "");
		console.log("left side width: " + leftWidth + " with x: " + leftX);
	}
	else // the lemming is digging at the left end of the floor and the tunnel element cannot have the width of lemmingWidth * 2
	{
		tunnelWidth += leftWidth;
		if (tunnelWidth < 0) tunnelWidth = tunnelWidth * -1;
		tunnelX = rightX - rightWidth/2 - tunnelWidth/2;
	}
	// the lemming is not digging at the right end of the floor
	if (rightWidth > 0) createBox(rightWidth, floorHeight, floorDepth, rightX + " " + floorPos.y + " " + floorPos.z, "floor", ""); 
	else // same as for the left side
	{
		tunnelWidth += rightWidth;
		if (tunnelWidth < 0) tunnelWidth = tunnelWidth * -1;
		tunnelX = leftX + leftWidth/2 + tunnelWidth/2;
	}
	var tunnel = createBox(tunnelWidth, floorHeight, floorDepth, tunnelX + " " + floorPos.y + " " + floorPos.z, "tunnel", "");
	var timerId = setInterval(shrink, 700, tunnel, true);
	tunnel.setAttribute("shrinker", timerId);
	tunnel.setAttribute("lemming", lemming.id);
}

function shrink(object, vertical)
{
	if (vertical)
	{
		var height = object.getAttribute("height");
		if (height < 0.1)
		{
			var lemming = document.querySelector("#"+object.getAttribute("lemming"));
			var scene = document.querySelector("a-scene");
			scene.removeChild(object);
			clearInterval(object.getAttribute("shrinker"));
			lemming.setAttribute("task", "walking");
			lemming.setAttribute("gltf-model", "#lemming_walk");
			lemming.setAttribute("color", "#33cc33");
			
			return;
		}
		var pos = object.body.position;
		object.setAttribute("height", (height-0.1));
		object.setAttribute("position", pos.x + " " + (pos.y - 0.05) + " " + pos.z);
		object.removeAttribute("static-body");
		object.setAttribute("static-body", "");
		
	}
	else
	{

	}
}

function killLemming(id)
{
	var lemming = getLemming(id);
	if (lemming == null) 
	{
		console.log("Invalid lemming ID");
		return false;
	}
	console.log("Unfortunately, lemming #" + lemming.id.substring(7) + " has died");
	document.querySelector("a-scene").removeChild(lemming);
}

function giveChute(id)
{
	var lemming = getLemming(id);
	if (lemming == null) 
	{
		console.log("Invalid lemming ID");
		return false;
	}
	lemming.setAttribute("hasChute", true);
}

function buildStairs(id, counter)
{
	if (counter == null) counter = 0;
	var lemming = getLemming(id);
	if (lemming == null) 
	{
		console.log("Invalid lemming ID");
		return false;
	}
	var dir = lemming.getAttribute("direction");

	if (counter >= 11)	// stair finished, resume walking
	{
		lemming.setAttribute("task", "walking");
		lemming.setAttribute("gltf-model", "#lemming_walk");
		setVelocity(lemming, "maintain");
		return;
	}

	

	lemming.setAttribute("task", "stairs");
	lemming.body.velocity.set(0,0,0);
	//build one stair after another
	for (var i = 0; i < 1; i++)
	{
		var posX;
		if (dir == "right") 	posX = lemming.body.position.x + 0.2;
		else				posX = lemming.body.position.x - 0.2;
		var posY = lemming.body.position.y - (1/2 * lemmingHeight) + 0.05;
		var posZ = lemming.body.position.z;
		setStair(posX + " " + posY + " " + posZ, dir);
		counter++;

		var timer = setTimeout(buildStairs, 2000, id, counter);
		lemming.setAttribute("timer", timer);

		// adjust lemming position
		//var lemmingX = lemming.body.position.x;
		var lemmingY = lemming.body.position.y;
		var lemmingZ = lemming.body.position.z;
		lemming.body.position.set(posX, lemmingY+0.11, lemmingZ);
		
	}
}

function setStair(pos, direction)
{
	var stair = document.createElement("a-box");
		stair.setAttribute("static-body", "");
		stair.setAttribute("width", lemmingWidth);
		stair.setAttribute("height", 0.1);
		stair.setAttribute("depth", lemmingWidth+0.2);
		stair.setAttribute("color", "#663300");
		stair.setAttribute("class", "stair");
		stair.setAttribute("id", "obj"+objectId);
		objectId++;
		stair.addEventListener("body-loaded", function(e)
		{
			if (direction == "right")	this.body.collisionFilterMask = 2 + 4;
			else						this.body.collisionFilterMask = 2 + 8;
			this.body.collisionFilterGroup = 1;
			//this.body.collisionResponse = false;
		})
		stair.setAttribute("position", pos);
		document.querySelector("a-scene").appendChild(stair);
}

// discarded for now, since it corrupts stair climbing
// can be used by hand from console
// sometimes lemmings get slowed down due to errors, this fixes them (hopefully)
function updateVelocities(){
	var lemmings = document.querySelectorAll(".lemming");
	function updateVelocity(lemming, index){
		if (lemming.getAttribute("task") == "walking")
		{
			setVelocity(lemming, "maintain");
		}
		if ((lemming.getAttribute("task") == "falling") && (lemming.body.velocity.y == 0))
		{
			lemming.setAttribute("task", "walking");
			lemming.setAttribute("gltf-model", "#lemming_walk");
			setVelocity(lemming, "maintain");
		}
		else	setVelocity(lemming, 0);
	}
	lemmings.forEach(updateVelocity);
}

// creates an a-box element. 
// width, height and depth are numbers
// position is a string ("x y z"), type and id are strings
function createBox(width, height, depth, position, type, id)
{
	var box = document.createElement("a-box");
	box.setAttribute("static-body", "");
	box.setAttribute("width", width);
	box.setAttribute("height", height);
	box.setAttribute("depth", depth);
	box.setAttribute("position", position);
	box.setAttribute("class", type);
	if(id == "")
	{
		box.setAttribute("id", "obj"+objectId);
		objectId++;
	}
	else box.setAttribute("id", id);
	var color = "#ff33cc";
	if (type == "wall") color = "#f44141";
	if (type == "floor") color = "#42d9f4";
	if ((id == "exit") || (id == "spawner")) color = "#00ff00";
	if (id == "theVoid") color = "#000000";
	box.setAttribute("color", color);
	box.addEventListener("body-loaded", function(e)
	{
		this.body.collisionFilterMask = 1+2+4+8;
	})

	document.querySelector("a-scene").appendChild(box);

	return box;
}

// currently bugged. Don't use
function clearLevel()
{
	var scene = document.querySelector("a-scene");
	while (scene.hasChildNodes())
	{
		scene.removeChild(scene.firstChild);
	}
	createBox(100, 0.1, 100, "0 0 0", "", "theVoid");
}

function setAlphaLevel()
{
	loadCamera();
	createBox(4, 0.1, 1, "2 3.5 -4", "floor", "");
	createBox(6, 0.1, 4, "-1 1.5 -4", "floor", "");
	createBox(8, 0.1, 4, "0 0 -4", "floor", "");
	createBox(0.1, 3, 4, "4 1.5 -4", "wall", "");
	createBox(0.1, 0.1, 4, "4 4 -4", "wall", "");
	createBox(0.1, 4, 4, "-4 4 -4", "wall", "");
	createBox(1, 0.1, 1, "0.5 5 -4", "", "spawner");
	createBox(0.1, 1.5, 4, "-4 0.75 -4", "", "exit");
	createBox(100, 0.1, 100, "0 -2, -4", "", "theVoid");
}

function setLevel1()
{
	loadCamera();
	var sky = document.createElement("a-sky");
	sky.setAttribute("color", "#9999FF");
	document.querySelector("a-scene").appendChild(sky);
	createBox(100, 0.1, 100, "0 -2, -4", "", "theVoid");
	document.querySelector("#cameraWrapper").object3D.position.set(0, 4, 9);

	createBox(20, 1, 2, "0 0 0", "floor", "");
	createBox(10, 2, 2, "-5 4 0", "floor", "");
	createBox(1, 12, 2, "-10.5 5.5 0", "wall", "");
	createBox(1, 12, 2, "10.5 5.5 0", "wall", "");
	createBox(1, 6, 2, "5 8 0", "wall", "");

	createBox(1.2, 0.1, 1.2, "-5 8 0", "", "spawner");
	createBox(1.6, 2, 1.6, "7 1.5 0", "", "exit");
}

function setLevel3()
{
	loadCamera();
	var sky = document.createElement("a-sky");
	sky.setAttribute("color", "#336699");
	document.querySelector("a-scene").appendChild(sky);

	document.querySelector("#cameraWrapper").object3D.position.set(0, 4, 9);
	createBox(12, 0.1, 2, "-1 0 0", "floor", "");
	createBox(6, 0.1, 2, "10 0 0", "floor", "");
	createBox(10, 0.1, 2, "-4 3 0", "floor", "");
	createBox(8, 0.1, 2, "-1 4.5 0", "floor", "");
	createBox(10, 0.1, 2, "4 6 0", "floor", "");
	createBox(6, 0.1, 2, "-8 6 0", "floor", "");
	createBox(10, 0.1, 2, "-3 7.5 0", "floor", "");
	createBox(14, 0.1, 2, "4 9 0", "floor", "");
	createBox(100, 0.1, 100, "0 -2, -4", "", "theVoid");

	createBox(1.2, 0.1, 1.2, "-1 11 0", "", "spawner");
	createBox(1.6, 2, 1.6, "10 1 0", "", "exit");

	// DEMO solver
	/*
	setTimeout(spawnLemming, 1000);
	setTimeout(spawnLemming, 1500);
	setTimeout(spawnLemming, 2000);
	setTimeout(spawnLemming, 2500);
	setTimeout(spawnLemming, 3000);
	setTimeout(stopOthers, 2000, 0);
	setTimeout(stopOthers, 5000, 1);
	setTimeout(stopOthers, 10000, 2);
	setTimeout(stopOthers, 16000, 3);
	setTimeout(buildStairs, 21700, 4);

	setTimeout(spawnLemming, 24000);
	setTimeout(spawnLemming, 24500);
	setTimeout(spawnLemming, 25000);
	setTimeout(spawnLemming, 25500);
	setTimeout(spawnLemming, 26000); */
}

function loadCamera()
{
	var wrapper = document.createElement("a-entity");
	wrapper.setAttribute("id", "cameraWrapper");
	var camera = document.createElement("a-camera");
	wrapper.appendChild(camera);
	document.querySelector("a-scene").appendChild(wrapper);
}

function checkFalling()
{
	var lemmings = document.querySelectorAll(".lemming");
	function updateFall(lemming, index){
		var task = lemming.getAttribute("task")
		if (lemming.body.velocity.y < -0.5)	
		{
			lemming.body.velocity.x = 0;
		}
		if (((task == "walking") || (task == "falling")) && (lemming.body.velocity.y < -2))
		{
			lemming.setAttribute("task", "falling");
			//console.log(lemming.id + ": lemming is falling with speed: " + lemming.body.velocity.y);
			lemming.setAttribute("color", "orange");
			lemming.body.velocity.x = 0;
			if (lemming.getAttribute("hasChute") == "true") lemming.body.velocity.set(0, -1.5, 0);
			if (lemming.body.velocity.y < -10) lemming.body.velocity.set(0, -10, 0);
		}
	}
	lemmings.forEach(updateFall);
}

function spawnLemmings(num)
{
	if (num <= 0) return;
	spawnLemming();
	setTimeout(function() {spawnLemmings(num-1);}, 500);
}

function updateModel(lemming)
{
	var task = lemming.getAttribute("task");
	var dir = lemming.getAttribute("direction");
	if ((task == "walking") && (dir == "left"))		lemming.setAttribute("gltf-model", "#lemming_walk_r");
	if ((task == "walking") && (dir == "right"))	lemming.setAttribute("gltf-model", "#lemming_walk_l");
	if ((task == "falling") && (dir == "right"))	lemming.setAttribute("gltf-model", "#lemming_fall_r");
	if ((task == "falling") && (dir == "left"))		lemming.setAttribute("gltf-model", "#lemming_fall_l");
	//if (task == "digDown")							lemming.setAttribute("gltf-model", "#lemming_digDown");
	if (task == "stop")								lemming.setAttribute("gltf-model", "#lemming_stop");
}

window.onload = function() 
{
	lemmingId = 0;
	objectId = 0;
	lemmingsArrived = 0;

	setInterval(checkFalling, 20); // 50 times per second. Could also be checked each time a frame is produced
	//lemmings will be spawned by hand later

	//DEMO
	setLevel1();
	

}
