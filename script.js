/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */
let selectedMode;

function showLevelSelector(gameMode) {
  selectedMode = gameMode;
  
  const levelButtonsContainer = document.getElementById('level-buttons-container');
  const levelButtons = getLevelSelectionButtons(3);
  levelButtons.forEach(button => levelButtonsContainer.appendChild(button));
  debugger
  document.getElementById('mode-buttons-container').style = 'display: none;';
}

function getLevelSelectionButtons(numberOfLevels) {
  const buttonsArray = [];
  for (let i = 1; i<=numberOfLevels; i++) {
    buttonsArray.push(createLevelButton(level));
  }
  return new Array(numberOfLevels).map((item, index) => createLevelButton(index + 1));
}

function createLevelButton(level) {
  const button = document.createElement('button');
  button.innerText = 'Level ' + level;
  button.onclick = alert(level);
  
  return button;
}
