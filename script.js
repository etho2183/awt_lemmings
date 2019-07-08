/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */
let selectedMode;

function showLevelSelector(gameMode) {
  document.getElementById('mode-buttons-container').style = 'display: none;';
  selectedMode = gameMode;
  
  const levelButtonsContainer = document.getElementById('level-buttons-container');
  const levelButtons = getLevelSelectionButtons(3);
  levelButtons.forEach(button => levelButtonsContainer.appendChild(button));
}

function getLevelSelectionButtons(numberOfLevels) {
  const buttonsArray = [];
  for (let level = 1; level <=numberOfLevels; level++) {
    buttonsArray.push(createLevelButton(level));
  }
  
  return buttonsArray;
}

function createLevelButton(level) {
  const button = document.createElement('button');
  button.classList.add('button');
  button.innerText = 'Level ' + level;
  button.addEventListener('click', () => goToLevel(level));
  
  return button;
}

function goToLevel(level) {
  alert(level);
}
