/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */
let selectedMode;

function showLevelSelector(gameMode) {
  document.getElementById('mode-buttons-container').style = 'display: none;';
  selectedMode = gameMode;
  
  appendLevelButtonsContainer();
  const levelButtonsContainer = document.getElementById('level-buttons-container');
  levelButtonsContainer.appendChild(getBackButton());
  const levelButtons = getLevelSelectionButtons(3);
  levelButtons.forEach(button => levelButtonsContainer.appendChild(button));
}

function appendLevelButtonsContainer() {
  const levelButtonsContainer = document.createElement('div');
  levelButtonsContainer.id = 'level-buttons-container';
  document.getElementById('container').appendChild(levelButtonsContainer);
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
  window.location = encodeURIComponent()'/vr.html?level=';
}

function getBackButton() {
  const backButton = document.createElement('button');
  backButton.id = 'back-button';
  backButton.classList.add('button');
  backButton.innerText = 'Back';
  backButton.addEventListener('click', showModeSelectionButtons);
  
  return backButton;
}
                           
function showModeSelectionButtons() {
  document.getElementById('level-buttons-container').remove();
  document.getElementById('mode-buttons-container').style = '';
  selectedMode = null;
}
