
var latestLemming;
var lemmingId;
var objectId;
var lemmingHeight = 1;
var lemmingWidth = 0.5;
var velocity = 2;
var lemmingsArrived;
var maxLemmings = 20;
var deadLemmings = 0;
var minLemmingsToWin;
var mode;
var level;

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
    if (lemmingsArrived == minLemmingsToWin)
		{
			console.log("You won! Please select another level");
      winLevel();
		}
		console.log(this.id + ": reached destination. Removing. Total arrived: " + lemmingsArrived);
		removeLemming(this.id);
		return;
	}
	if(e.detail.body.el.id == "theVoid")
	{
		console.log(this.id + ": fell out of the world. Removing.");
		removeLemming(this.id);
		return;
	}

	// check the relative height (delta) of the colliding object. Theoretically, delta is zero, if the lemming is standing on the object
	// delta height indicates the height of the object above the lemmings "feet"
	var other = e.detail.body.el;
	var otherHeight = other.getAttribute("height");
	var otherYPos = other.getAttribute("position").y;
	var lemmingYPos = this.getAttribute("position").y;

	var delta = otherYPos + otherHeight/2 - (lemmingYPos - lemmingHeight/2);
	var fallHeight = this.getAttribute("fallingStart") - lemmingYPos;
	console.log(this.id + ": delta: " + delta + " with " + e.detail.body.el.className);
	console.log(this.id + ": fallHeight: " + fallHeight);

	// there is no continuous collision checking, only periodically. Fast objects clip into other objects, until a collision is registered
	// faster objects clip further into other objects, resulting in a higher delta (at vertical speeds). Avoid high acceleration! Mostly caused by falling.

	// if lemming is falling, either kill him or resume walking

	if ((delta < 0.09) && (delta > -0.09))	// collision with floor
	{
		// nothing so far
	}

	if (this.getAttribute("task") == "falling")
	{
		var hasChute = (this.getAttribute("hasChute") == "true");
		if (!hasChute && (fallHeight > 4.5))
		{
			console.log("killing lemming");
			killLemming(this.id);
			return;
		}

		this.removeAttribute("fallingStart");	
		this.setAttribute("task", "walking");
		console.log(this.id + ": is walking again");
		updateModel(this);
		setTimeout(setVelocity, 100, this, "maintain");
		return;
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
		updateModel(lemming);
	}
	else
	{
		lemming.setAttribute("direction", "right");
		updateModel(lemming);
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
  if (lemmingId == maxLemmings)
	{
		console.log("The maximum amount of lemmings (" + maxLemmings + ") is already spawned!");
		console.log("If you did non win yet, retry the level and try to let more lemmings survive");
		return false;
	}
  
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
	lemming.setAttribute("fallingStart", spawnPos.y);
  lemming.setAttribute("dynamic-body", "linearDamping: 0"); // linear damping can also be added inside "body-loaded" event listener
	//lemming.setAttribute("mass", "1");
	lemming.setAttribute("width", lemmingWidth);
	lemming.setAttribute("height", lemmingHeight);
	lemming.setAttribute("depth", lemmingWidth);
	lemming.setAttribute("color", "#33cc33");
	lemming.setAttribute("opacity", 0);
	lemming.setAttribute("lastCollision", "");
	lemming.setAttribute("id", "lemming"+lemmingId);
	
	lemming.setAttribute("task", "falling");
	//lemming.setAttribute("constraint", "target: #test; collideConnected: false;");

	// append model that can animate
	var model = document.createElement("a-gltf-model");
	model.setAttribute("animation-mixer", "");
	lemming.appendChild(model);

	// append label for identification
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
	updateModel(lemming);
	lemmingId++;
  	if (lemmingId == maxLemmings)
	{
		spawner.setAttribute("gltf-model", "./Models/spawner_closed.glb");
	}
}

function winLevel()
{
	// clearLevel();
  console.log('winLevel() called');
  window.location.href = encodeURI('./end.html?result=victory&level=' + level + '&mode=' + mode);
}

function loseLevel() {
  window.location.href = encodeURI('./end.html?result=defeat&level=' + level + '&mode=' + mode);
}

function stopOthers(id)
{
  console.error('HOLA')
	  let lemming = getLemming(id);
    if (lemming == null) 
    {
      console.log("Invalid lemming ID");
      return false;
    } 

	lemming.removeEventListener("collide", collisionFunction);
	lemming.setAttribute("task", "stop");
	updateModel(lemming);
	lemming.setAttribute("color", "#006600");
	lemming.body.velocity.set(0,0,0);
	lemming.body.invMass = 0;
	lemming.body.collisionFilterGroup = 1;
	lemming.body.collisionFilterMask = 1+2+4+8;
}

function digDown(id)
{
  console.error('HALLO');
	let lemming = getLemming(id);
    if (lemming == null) 
    {
      console.log("Invalid lemming ID");
      return false;
    }
	lemming.setAttribute("color" , "#55AA55");
	lemming.body.velocity.set(0,0.1,0);
	lemming.setAttribute("task", "digDown");
	updateModel(lemming);
	setTimeout(digDownPartTwo, 200, lemming);
}

// split floor into three parts: left side, right side and tunnel element in center that gets smaller until it disappears
function digDownPartTwo(lemming)
{
	var floorId = lemming.getAttribute("lastCollision");
	var floor = document.querySelector("#"+floorId);
	var floor_type = floor.getAttribute("class");
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
  floor.removeAttribute("src");
	scene.removeChild(floor);

	// the lemming is not digging at the left end of the floor
	if (leftWidth > 0) {
		createBox(leftWidth, floorHeight, floorDepth, leftX + " " + floorPos.y + " " + floorPos.z, floor_type, "");
		console.log("left side width: " + leftWidth + " with x: " + leftX);
	}
	else // the lemming is digging at the left end of the floor and the tunnel element cannot have the width of lemmingWidth * 2
	{
		tunnelWidth += leftWidth;
		if (tunnelWidth < 0) tunnelWidth = tunnelWidth * -1;
		tunnelX = rightX - rightWidth/2 - tunnelWidth/2;
	}
	// the lemming is not digging at the right end of the floor
	if (rightWidth > 0) 
	{
		createBox(rightWidth, floorHeight, floorDepth, rightX + " " + floorPos.y + " " + floorPos.z, floor_type, ""); 
		console.log("right side width: " + rightWidth + " with x: " + rightX);
	}
	else // same as for the left side
	{
		tunnelWidth += rightWidth;
		if (tunnelWidth < 0) tunnelWidth = tunnelWidth * -1;
		tunnelX = leftX + leftWidth/2 + tunnelWidth/2;
	}
	console.log(floor_type);
	var tunnel = createBox(tunnelWidth, floorHeight, floorDepth, tunnelX + " " + floorPos.y + " " + floorPos.z, floor_type, "");
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
      object.removeAttribute("src");
			scene.removeChild(object);
			clearInterval(object.getAttribute("shrinker"));
			lemming.setAttribute("task", "walking");
			updateModel(lemming);
			lemming.setAttribute("color", "#33cc33");
			
			return;
		}
		var pos = object.body.position;
		object.setAttribute("height", (height-0.1));
		var type = object.getAttribute("class");
		var width = object.getAttribute("width");
		if (type == "wall") 	object.setAttribute("material", "src: #texture_wall; repeat: " + width + " " + (height-0.1));
		if (type == "floor") 	object.setAttribute("material", "src: #texture_floor; repeat: " + width + " " + (height-0.1));
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
	lemming.setAttribute("task", "dead");
	console.log("Unfortunately, lemming #" + lemming.id.substring(7) + " has died");
	lemming.body.velocity.x = 0;
	lemming.body.collisionFilterGroup = 2;
	lemming.body.collisionFilterMask = 1;
	updateModel(lemming);
	setTimeout(removeLemming, 2500, id);
  deadLemmings++;
  
  if((maxLemmings - deadLemmings) < minLemmingsToWin) {
    loseLevel();
  }
  
}

function removeLemming(id)
{
	var lemming = getLemming(id);
	if (lemming == null) 
	{
		console.log("Invalid lemming ID");
		return false;
	}
	console.log("removing lemming #" + lemming.id.substring(7));
	lemming.removeAttribute("gltf-model");
	var label = lemming.getChildren();
	lemming.removeChild(label[0]);
	document.querySelector("a-scene").removeChild(lemming); 
}

function giveChute(id)
{
  let lemming = getLemming(id);
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
  let lemming = getLemming(id);
  if (lemming == null) 
  {
    console.log("Invalid lemming ID");
    return false;
  }
	var dir = lemming.getAttribute("direction");

	if (counter >= 11)	// stair finished, resume walking
	{
		lemming.setAttribute("task", "walking");
		updateModel(lemming);
		setVelocity(lemming, "maintain");
		return;
	}

	

	lemming.setAttribute("task", "stairs");
	updateModel(lemming);
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
		stair.setAttribute("color", "#5E0011");
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
			updateModel(lemming);
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
  if(mode === 'ar') {
    var marker = document.createElement("a-marker-camera");
	  marker.setAttribute("preset","barcode");
  }
  
	var box = document.createElement("a-box");
	console.log("creating box with " + width + " * " + height + " * " + depth);
	if ((id == "spawner") || (id == "exit"))
	{
		if (id == "spawner")
		{
			box.setAttribute("height", 0.3);
			box.setAttribute("width", 2);
			box.setAttribute("depth", 2);
		}
		else
		{
			box.setAttribute("height", 2);
			box.setAttribute("width", 0.8);
			box.setAttribute("depth", 2);
		}
		
	}
	else 
	{
		box.setAttribute("width", width);
		box.setAttribute("height", height);
		box.setAttribute("depth", depth);
	}
	box.setAttribute("static-body", "");
	box.setAttribute("position", position);
	box.setAttribute("class", type);
	if(id == "")
	{
		box.setAttribute("id", "obj"+objectId);
		objectId++;
	}
	else box.setAttribute("id", id);
	var color = "#ffFFFF";
	if (type == "wall") 	box.setAttribute("material", "src: #texture_wall; repeat: " + width + " " + height);
	if (type == "floor") 	box.setAttribute("material", "src: #texture_floor; repeat: " + width + " " + height);
	if (id == "exit") 		box.setAttribute("gltf-model", "./Models/exit.glb");
	if (id == "spawner") 	box.setAttribute("gltf-model", "./Models/spawner.glb");
	if (id == "theVoid") color = "#382714";
	box.setAttribute("color", color);
	box.addEventListener("body-loaded", function(e)
	{
		this.body.collisionFilterMask = 1+2+4+8;
	})

  if (mode === 'ar') {
    marker.appendChild(box);
	  document.querySelector("a-scene").appendChild(marker);
    return;
  }
    
	document.querySelector("a-scene").appendChild(box);

	return box;
}

// function clearLevel()
// {
// 	lemmingId = 0;
// 	objectId = 0;
// 	lemmingsArrived = 0;
// 	var boxes = document.querySelectorAll("a-box");
// 	var scene = document.querySelector("a-scene");
// 	for (var i = 0; i < boxes.length; i++)
// 	{
// 		console.log("removing: class=" + boxes[i].className + ", id=" + boxes[i].id);
// 		boxes[i].removeAttribute("gltf-model");
// 		boxes[i].removeAttribute("src");
// 		scene.removeChild(boxes[i]);
// 	}
// 	var camera = document.querySelector("#cameraWrapper");
// 	if (camera != null) scene.removeChild(camera);
// 	//createBox(100, 0.1, 100, "0 0 0", "", "theVoid");
// }

// early testing Level, does not work anymore

function setAlphaLevel()
{
	loadCamera();
	createBox(4, 0.1, 1, "2 3.5 -4", "floor", "");
	createBox(6, 0.1, 4, "-1 1.5 -4", "floor", "");
	createBox(8, 0.1, 4, "0 0 -4", "floor", "");
	createBox(0.1, 3, 4, "4 1.5 -4", "wall", "");
	createBox(0.1, 0.1, 4, "4 4 -4", "wall", "");
	createBox(0.1, 4, 4, "-4 4 -4", "wall", "");

	// createBox(100, 0.1, 100, "0 -2, -4", "", "theVoid");
  createBox(100, 0.1, 100, "0 -4, -4", "", "theVoid");

	// sizes do not matter
	createBox(1, 1, 1, "0.5 5 -4", "", "spawner");
	createBox(1, 1, 1, "-4 0.75 -4", "", "exit");
}

function setLevel1()
{
	loadCamera();
  	minLemmingsToWin = 5;
	var sky = document.createElement("a-sky");
	sky.setAttribute("color", "#9999FF");
	document.querySelector("a-scene").appendChild(sky);
	// createBox(100, 0.1, 100, "0 -2, -4", "", "theVoid");
	createBox(100, 0.1, 100, "0 -4, -4", "", "theVoid");
	document.querySelector("#cameraWrapper").object3D.position.set(0, 4, 9);

	createBox(20, 1, 2, "0 0 0", "floor", "");
	createBox(20, 2, 2, "0 4 0", "floor", "");
	createBox(1, 12, 2, "-10.5 5.5 0", "wall", "");
	createBox(1, 12, 2, "10.5 5.5 0", "wall", "");
	createBox(1, 6, 2, "5 8 0", "wall", "");

	// sizes do not matter
	createBox(1, 1, 1, "-5 8 0", "", "spawner");
	createBox(1, 1, 1, "7 1.5 0", "", "exit");

	// animation test
	//var b2 = document.createElement("gltf-model");
	//b2.setAttribute("position", "0 10 0");
	//b2.setAttribute("src", "./Models/test.glb");
	//b2.setAttribute("animation-mixer");
	//document.querySelector("a-scene").appendChild(b2);

	//var b = createBox(1, 1, 1, "0 10 0", "", "test");
	//b.setAttribute("animation-mixer");
	//b.setAttribute("gltf-model", "./Models/test.glb");
}

function setLevel2()
{
	loadCamera();
  minLemmingsToWin = 5;
  maxLemmings = 10
	var sky = document.createElement("a-sky");
	sky.setAttribute("color", "#9999FF");
	document.querySelector("a-scene").appendChild(sky);
	// createBox(100, 0.1, 100, "0 -2, -4", "", "theVoid");
  createBox(100, 0.1, 100, "0 -4, -4", "", "theVoid");
	document.querySelector("#cameraWrapper").object3D.position.set(0, 4, 9);

	createBox(25, 1, 2, "0 0 0", "wall", "");
	createBox(3, 8, 2, "-11 4.5 0", "floor", "");
	createBox(3, 7, 2, "-8 4 0", "floor", "");
	createBox(3, 6, 2, "-5 3.5 0", "floor", "");

	// sizes do not matter
	createBox(1, 1, 1, "-12 11 0", "", "spawner");
	createBox(1, 1, 1, "7 1.5 0", "", "exit");
}

function setLevel3()
{
	loadCamera();
  minLemmingsToWin = 5;
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
	// createBox(100, 0.1, 100, "0 -2, -4", "", "theVoid");
  createBox(100, 0.1, 100, "0 -4, -4", "", "theVoid");

	// sizes do not matter
	createBox(1, 1, 1, "-1 11 0", "", "spawner");
	createBox(1, 1, 1, "10 1 0", "", "exit");

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
  var cursor = document.createElement("a-cursor");
  camera.appendChild(cursor);
	wrapper.appendChild(camera);
	document.querySelector("a-scene").appendChild(wrapper);
  // By setting cursor="rayOrigin: mouse" on the scene, we can use the mouse to click elements of the scene (i.e: lemmings)
  document.querySelector("a-scene").setAttribute('cursor', 'rayOrigin: mouse');
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
		if (((task == "walking") || (task == "falling")) && (lemming.body.velocity.y < -2) && (task != "digDown"))
		{
			if (lemming.getAttribute("task") != "falling")
			{
				lemming.setAttribute("fallingStart", lemming.body.position.y);
				lemming.setAttribute("task", "falling");
				updateModel(lemming);
			}
			//console.log(lemming.id + ": lemming is falling with speed: " + lemming.body.velocity.y);
			lemming.setAttribute("color", "orange");
			lemming.body.velocity.x = 0;
			if (lemming.getAttribute("hasChute") == "true") 
			{
				lemming.body.velocity.set(0, -1.5, 0);
				updateModel(lemming);
			}
			if (lemming.body.velocity.y < -7) lemming.body.velocity.set(0, -7, 0);
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
	var rotation = "";
	if (dir == "left")  rotation = "0 180 0";
	else				rotation = "0 0 0";
	if ((task == "digDown") || (task == "stop") || (task == "dead")) direction = "";

	var model = "";	
	var hasChute = lemming.getAttribute("hasChute");
	if (hasChute == "") hasChute = false;
	if (task == "walking")							model = "walk_animated";			
	if ((task == "falling") && (hasChute)) 			model = "chute";
	if ((task == "falling") && (!hasChute)) 		model = "fall";
	if (task == "digDown")							model = "digDown";
	if (task == "stop")								model = "stop";
	if (task == "dead")								model = "tombstone";
	if (task == "stairs")							model = "stair";

	if (model != "")
	{
		var gltf_model = lemming.querySelector("a-gltf-model");
		gltf_model.setAttribute("gltf-model", "./Models/lemming_" + model + ".glb");
		gltf_model.setAttribute("rotation", rotation);
	}
}

function createRoleButton(position, sourceOn, sourceOff, onClick)
{
  const box = document.createElement('a-box');
  box.classList.add('role-button');
  box.setAttribute('position', position);
  box.setAttribute('height', 1);
  box.setAttribute('width', 1);
  
  box.switchOff = () => {
    box.setAttribute('src', sourceOff);
    box.setAttribute('data-selected', false);
    Array.from(document.querySelectorAll('.lemming')).forEach(lemming => lemming.removeEventListener('click', onClick));
  };
  
  box.switchOn = () => {
    box.setAttribute('src', sourceOn);
    box.setAttribute('data-selected', true);
    Array.from(document.querySelectorAll('.lemming')).forEach(lemming => lemming.addEventListener('click', onClick));
  };
  
  box.addEventListener('click', () => {
    const wasButtonSelected = box.getAttribute('data-selected') === 'true';
    switchSelectedButtonOff();
    
    if (wasButtonSelected) {
      box.switchOff();
    } else {
      box.switchOn();
    }
  });
  
  // By default button is off
  box.switchOff();
  
	document.querySelector("a-scene").appendChild(box);
}

function switchSelectedButtonOff() {
  const previousSelectedButton = document.querySelector('.role-button[data-selected="true"]');
  if (previousSelectedButton) {
    previousSelectedButton.switchOff();
  }
}

function createSpawnButton()
{
  const box = document.createElement('a-box');
  box.setAttribute('position', '-4 -1.3 0');
  box.setAttribute('height', 1);
  box.setAttribute('width', 1);
  box.setAttribute('src', './images/spawn.png');
  box.addEventListener('click', () => {
    if (lemmingId == maxLemmings) {
      return;
    }
    
    switchSelectedButtonOff();
    spawnLemming();
  });
  document.querySelector("a-scene").appendChild(box);
}

function setUIToolBar()
{	
  createSpawnButton();
  createRoleButton('-3 -1.3 0', './images/stop.png', './images/stopOff.png', event => stopOthers(event.currentTarget.id));
  createRoleButton('-2 -1.3 0', './images/dig.png', './images/digOff.png', event => digDown(event.currentTarget.id));
  createRoleButton('-1 -1.3 0', './images/build.png', './images/buildOff.png', event => buildStairs(event.currentTarget.id));
  createRoleButton('0 -1.3 0', './images/parachute.png', './images/parachuteOff.png', event => giveChute(event.currentTarget.id));
}

function setARToolBar() {
  const toolbar = document.createElement('div');
  toolbar.id = 'ar-toolbar';
  
  toolbar.appendChild(createARToolBarButton('Spawn', spawnLemming));
  
  document.body.appendChild(toolbar);
}

function createARToolBarButton(text, onClick) {
  const button = document.createElement('button');
  button.innerText = text;
  button.classList.add('ar-button');
  button.addEventListener('click', onClick);
  
  return button;
}

function createGlobalScene() {
  const scene = document.createElement('a-scene');
  const assets = document.createElement('a-assets');
  const floor = document.createElement('img');
  const wall = document.createElement('img');

  scene.setAttribute('physics', 'debug: false; friction: 0; restitution: 0;');
  scene.appendChild(assets);
  
  assets.appendChild(floor);
  assets.appendChild(wall);
  floor.setAttribute('src', './Textures/floor.jpg');
  floor.id = 'texture_floor';
  wall.setAttribute('src', './Textures/wall.jpg');
  wall.id = 'texture_wall';
  
  document.body.appendChild(scene);
}



function startGame(selectedMode, selectedLevel) 
{
	lemmingId = 0;
	objectId = 0;
	lemmingsArrived = 0;
  mode = selectedMode;
  level = selectedLevel;
  
  
  createGlobalScene();

	setInterval(checkFalling, 20); // 50 times per second. Could also be checked each time a frame is produced
	//lemmings will be spawned by hand later

  //set the toolbar for user interface, which includes the buttons to spawn and assign roles
  if (mode === 'ar') {
    setARToolBar();
  } else {
    setUIToolBar();
  }
  
	//DEMO
  switch(level) {
    case '1':
      setLevel1();
      break;
    case '2':
      setLevel2();
      break;
    case '3':
      setLevel3();
      break;
    default:
      setAlphaLevel();
      break;
  }
}
