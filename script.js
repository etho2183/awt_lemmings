/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */
let selectedMode;

function selectMode(gameMode) {
  selectedMode = gameMode;
  
  const levelButtonsContainer = document.getElementById('level-buttons-container');
  const levelButtons = getLevelSelectionButtons();
  levelButtons.forEach(button => levelButtonsContainer.appendChild(button))
}

function getLevelSelectionButtons() {
  
}
