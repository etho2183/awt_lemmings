# Lemmings Game using WebXR

The project is a remake of the classic 1991 Lemmings game, developed through WebXR as part of the project "Advanced Web Technologies" at Technical University Berlin. The main goal of this project was to evaluate WebXR through hands-on development and thus understand how to use this JavaScript Web API as well as document down problems that were encountered.
This project allows the user to play the lemmings game in virtual as well as augmented reality through the browser. It includes a simple HTML webpage, that leads the user to playing one of three levels in either VR or AR. From there on, interaction with the game will depend on the mode.

:warning: *This project is still in its initial stage. It supports simple game play but does not cover all functionality from the original game. In terms of VR/AR, it has not fully explored many functionalities, provided through WebXR and thus is not optimised for actions, such as controller support.*

## Content

This repository contains the source code as well as all the presentations and the final documentation about the project, where the development is introduced in detail and discussion about the evaluation of WebXR is held.

## Getting Started

While the source code is provided, it is not necessary to install or set up anything. 
The source code contains two main js files: `index.js` and `game.js`. `index.js` encapsulated the whole game into an HTML to navigate through, while `game.js` hold the game mechanics.

### Prerequisites

This game can be played on the desktop, in VR and AR. Depending on the desired mode, different hardware will be needed.
For the desktop version, a simple computer with screen and a mouse would suffice.
To play in VR, some kind of head mounted device is required. Additionally, access to a mouse will still be necessary for now, in order to play the game.
Playing the game in AR, the user would need to allow access to the camera and some markers, that the project will recognise.

### Installing

No installation is necessary, as the beauty of WebXR lies in being able to access the project through a simple web browser. However, there are some problems, when using Google Chrome, which do not exist in Mozilla Firefox. The game can be accessed through [this webpage](https://etho2183.github.io/awt_lemmings/).

## Playing The Game

The game is a puzzle about human-like creatures with green hair that fall out of a floating gate at one point of the level and try to reach an exit within it. These creatures behave in the most simple way: They walk towards one side, until they die, hit a wall and turn around or are told to complete a certain task. If walking means certain death, e.g. falling from a cliff, they still continue doing so. The goal of the player is to prevent such self-destructive behavior, since a given amount of lemmings has to reach the exit gate and the path to it is spiked with dangers and traps.

The main page will let you select the game mode you want to run, followed by a level picker to select difficulty, which once selected will start loading the game. The screen will then display the selected scenario as well as a set of buttons that we can use to assign certain tasks to the lemmings as mentioned above. Relating to *Image 1* as seen below, starting left to right, such tasks are:
- **Spawn lemming**: Clicking this button will create a new lemming that will fall from the scenario start point.
- **Stop**: This task will stop the lemming we select, therefore not allowing other lemmings to continue walking in that direction.
- **Dig**: By digging, a lemming will create a hole in the floor in order to reach a level below.
- **Build stairs**: This task will make the lemming create a staircase in the scenario in order to overcome obstacles or walk over the abyss.
- **Parachute**: Clicking this button will give a parachute to the lemming we select, enabling the lemming to fall safely to another level.

With the exception of the *spawn* button, the rest of the buttons will require you to click on them to select the task you want to assign, and then select the lemming you want to assign it to. More details on the specifics of each task can be found in section Terminal Commands Interaction.

<img src="https://user-images.githubusercontent.com/23021961/62221504-0ae76c00-b3b2-11e9-9256-4c7942cd8c08.jpg" title="final-game" width="512">
<em>Image 1: VR in-game screenshot.</em>


### Game Play

Playing the game in VR is heavily gaze-based. The player will need to focus their gaze on one of the cubes at the bottom of the screen to choose a functionality, spawn or using a role, and then focus their gaze on a lemming, if they want to assign it a role. While the focus can be done through the moving of their head in a head mounted display, in order to select anything, mouse clicking is still required. The player is also free to choose the distance and angle is wants to play and observe the game. 

In AR, normal buttons are used. Once a marker has been recognized, the game will load into the augmented reality. The buttons are fixed to the screen and can be selected like traditional buttons.


## Terminal Commands Interaction

While this game should be mostly played with the given buttons and selecting based on gaze, it is also possible to directly use the functions in the command window by reading the id from the existing lemmings. This is especially beneficial when trying to play it on the desktop, as the gaze-based interaction can be hard to navigate. The spawned lemmings all carry with them a number, that is visible to the player. These numbers are unique `id's`, that are needed as input argument to use the function for in the command window.

In order for the game to make sense, we need lemmings. These are usually automatically spawned. But using the below function, one more lemming can be spawned.
```
spawnLemming()
```

If more than one lemming is wanted, using the below function with the input argument `num` would be easier, as num takes an integer with the number of lemmings to be spawned.
```
spawnLemmings(num)
```

This function will make the specified lemming become a stopper, that blocks all the other lemmings from continuing their walk. The other lemmings will bounce off him and start walking into the opposite direction.
```
stopOthers(id)
```

This function makes the lemming start digging a hole at the current floor position he is in, allowing everyone to fall down, once the hole is dug through.
```
digDown(id)
```

Sometimes, lemmings fall from above. This would be ok, if the height was small. At higher heights, a lemming needs to be assigned a parachute in order to not die from the fall.
```
giveChute(id)
```

To overcome holes and making it to the other side of an abyss, this function will have the lemming start building stairs diagonally forward and up, with the reference to his orientation. Other lemmings will then be able to use the stairs to continue their journey.
```
buildStairs(id, counter)
```

## Built With

* [WebXR](https://www.w3.org/TR/webxr/) - API used to develop this project for mixed reality in browser
* [A-Frame](https://aframe.io/) - Web framework used to build the project with HTML and Entity-Component
* [Physics for A-Frame](https://github.com/donmccurdy/aframe-physics-system) - Used to simulate the physics in the game.

## Known Bugs

Some bugs were encountered during the play, that have not been addressed. These include:
In AR, we are not able to assign the lemming the role of digging downwards


## Authors

**Vladimir Alekseychuk, Anqi Chen, Adnan Raza, Bilal Shahid**
