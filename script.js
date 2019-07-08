/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */
let selectedMode;

function showLevelSelector(gameMode) {
  selectedMode = gameMode;
  
  const levelButtonsContainer = document.getElementById('level-buttons-container');
  const levelButtons = getLevelSelectionButtons(3);
  levelButtons.forEach(button => levelButtonsContainer.appendChild(button))
}

function getLevelSelectionButtons(numberOfLevels) {
  
}

function createLevelButton(level) {
  const button = document.createElement('button');
  button.innerText = 'Level ' + level;
  button.onclick = alert(level);
  
  return button;
}
