# Lemmings Game using WebXR

The project is a remake of the classig 1991 Lemmings game, developed through WebXR as part of the project "Advanced Web Technologies" at Technical University Berlin. The main goal of this project was to evaluate WebXR through hands-on development and thus understand how to use this JavaScript Web API as well as document down problems that were encountered.
This project allows the user to play the lemmings game in virtual as well as augmented reality through the browser. It includes a simple HTML webpage, that leads the user to playig one of three levels in either VR or AR. From there on, interaction with the game will depend on the mode. 
The project is written mostly in Javascript and uses Entity-Component.
**This project is still in its initial stage. It supports simple game play but does not cover all functionality from the original game. In terms of VR/AR, it has not fully explored many functionalities, provided through WebXR and thus is not optimised for actions, such as controller support.**

## Content

This repository contrain the source code as well as all the presentations and the final documentation about the project, where the developement is introduces in detail and discussion about the evaluation of WebXR is held.

## Getting Started

While the source code is provided, it is not necessary to install or set up anything. 
The source code contains two main js filed: `index.js` and `game.js`. `index.js` encapsulated the whole game into an HTML to navigate through, while `game.js` hold the game mechanics.

### Prerequisites

This game can be played on the desktop, in VR and in AR. Depending on the desired mode, different hardware will be needed.
For the desktop version, a simple computer with screen and a mouse would suffice.
To play in VR, some kind of head mouted device is required. Additionally, access to a mouse will still be necessary for now, in order to play the game.
Playing the game in AR, the user would need to allow access to the camera and some markers, that the project will recognise.

### Installing

No installation is necessary, as the beauty of WebXR lies in being able to access the project through a simple web browser. However, there are some problems, when using Google Chrome, which do not exist in Mozilla Firefox. The game can be accessed through [this webpage](https://etho2183.github.io/awt_lemmings/)

## Playing The Game

Explain how to run the automated tests for this system

### Game Play

## Terminal Commands Interaction

Explain what these tests test and why

```
stopOthers(id)
```

```
digDown(id)
```

```
giveChute(id)
```

```
buildStairs(id, counter)
```

```
spawnLemming()
```

```
spawnLemmings(num)
```

## Built With

* [WebXR](https://www.w3.org/TR/webxr/) - API used to develop this project for mixed reality in browser
* [A-Frame](https://aframe.io/) - Web framework used to build the project with HTML and Entity-Component
* [Physics for A-Frame](https://github.com/donmccurdy/aframe-physics-system) - Used to simulate the physics in the game.

## Versioning And Known Bugs

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Vladimir Alekseychuk, Anqi Chen, Adnan Raza, Bilal Shahid**
