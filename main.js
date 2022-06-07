// variables representing the player state
let userHand = [];
let selectedCard = -1;
let userPlayArea = [];
const _userHandLoc = document.getElementById('userHand');
const _userPlayAreaLoc = document.getElementById('userPlayArea');
// variables representing the cpu state
let cpuHand = [];
let cpuPlayArea = [];
const _cpuHandLoc = document.getElementById('cpuHand');
const _cpuPlayAreaLoc = document.getElementById('cpuPlayArea');
// variables holding UI DOM elements
const _startGame = document.getElementById('startGame');
const _turnCounter = document.getElementById('turnCounter');
const _selectCardStep = document.getElementById('selectCardStep');
const _playTurnStep = document.getElementById('playTurnStep');
const _damageStep = document.getElementById('damageStep');
const _cleanupStep = document.getElementById('cleanupStep');
const _cpuTurnStep = document.getElementById('cpuTurnStep');

// event listener to start the game and populate the hands.
_startGame.addEventListener('click', getInitDeal);

// event listener to end turn
_playTurnStep.addEventListener('click', endTurn);

// set initial hand size
const handSize = 5;

// set initial turn counter
let turn = 0;

async function drawCards(numCards){
  const cards = [];
  // fetch cards from the server
  const res = await fetch(`/api?cards=${numCards}`);
  // populate generatedCards with the cards from the server
  (await res.json()).forEach(x => cards.push(x));
  return cards;
}

// async function to deal initial hand to player and cpu
async function getInitDeal(){
  // hide the button so we can't draw another 5 cards
  _startGame.classList.remove('activePhase');
  _selectCardStep.classList.add('activePhase');
  _startGame.remove();

  // split initial draw between players
  userHand = await drawCards(handSize);
  cpuHand = await drawCards(handSize);

  // update DOM (nothing is in play areas, so those don't need updated)
  updateZone(_userHandLoc, userHand);
  updateZone(_cpuHandLoc, cpuHand);
  
}

// function to update a zone (either players' hand or play area)
async function updateZone(zone, data){
  // remove all existing children
  while (zone.firstChild) {
    zone.removeChild(zone.firstChild);
  }
  // refresh with new, better, more modern children
  console.log('in update: ' + data)
  data.forEach(cardData => zone.appendChild(createCardDOM(cardData)));

  // add focus event listener to player's cards

  if(zone === _userHandLoc){
    let cards = document.querySelectorAll('#userHand .cardContainer');
    // add an event listener to each card in userHand
    cards.forEach((card, index) => {
      // on click...
      card.addEventListener('click', () => {
        // remove 'selected' class from all of them
        cards.forEach(unselected => {
          unselected.classList.remove('selected')
        })
        // add 'selected' class to the one that was clicked
        card.classList.add('selected')
        // update the selectedCard variable to point to the index of the clicked card
        selectedCard = index;
        // update the active phase
        _selectCardStep.classList.toggle('activePhase', false);
        _playTurnStep.classList.toggle('activePhase', true);
      });
    })
  }
}
 
// creates the internal html structure of each card element based
//   on a card object's data and returns the 'cardContainer' element
function createCardDOM(card) {
  let cardContainer = document.createElement('div');
  cardContainer.classList += 'cardContainer';

  let cardTop = document.createElement('div');
  cardTop.classList += 'cardTop';
  
  let cardName = document.createElement('span');
  cardName.classList += 'cardTitle';
  cardName.innerText = card.name;
  
  let cardArt = document.createElement('div');
  cardArt.classList += 'cardArt';
  cardArt.style.backgroundImage = `url(${card.img})`;
  
  let heroClass = document.createElement('div');
  heroClass.classList += 'heroClass';
  heroClass.innerText = card.heroClass;

  let statContainer = document.createElement('div');
  statContainer.classList += 'statContainer';

  let attack = document.createElement('span');
  attack.classList += 'attackVal listItem';
  attack.innerText = card.atk;

  let defense = document.createElement('span');
  defense.classList += 'defenseVal listItem';
  defense.innerText = card.def;

  cardTop.append(cardName, cardArt, heroClass);
  statContainer.append(attack, defense);
  cardContainer.append(cardTop, statContainer);
  return cardContainer;
}

// All the things that need to happen when you end the turn
//   possibly add wait()s to let you see the turn play out?
async function endTurn() {
  if(selectedCard == -1 && userHand.length > 0) {
    return;
  } else if(userHand.length > 0){
    // Put the selected card in the play area
    userPlayArea.push(userHand[selectedCard]);
    // remove it from the hand
    userHand.splice(selectedCard, 1);
    // reset the selected card (to prevent 'ghost' selection on next turn)
    selectedCard = -1;
    console.log('user hand: ' + userHand.map(x => x.name));
    // Update the zones' DOM elements
    updateZone(_userHandLoc, userHand);
    updateZone(_userPlayAreaLoc, userPlayArea);
  }
  // Move to next phase
  _playTurnStep.classList.remove('activePhase');
  _damageStep.classList.add('activePhase');
  // Player damage
  let damage = userPlayArea.reduce((a, e) => a + +e.atk, 0);
  // only apply damage if there is a card to target (for now at least)
  if(cpuPlayArea[0]) {
    cpuPlayArea[0].def -= damage;
    // if damage was deadly
    if(cpuPlayArea[0].def <= 0) {
      // remove card from play area
      cpuPlayArea.splice(0, 1);
    }
    // update DOM
    await updateZone(_cpuPlayAreaLoc, cpuPlayArea);
  }
  // Cleanup
  if(cpuHand.length == 0 && cpuPlayArea.length == 0) {
    alert('You Win!!!');
  }
  // Move to next phase
  _damageStep.classList.remove('activePhase');
  _cpuTurnStep.classList.add('activePhase');
  
  // CPU turn
  if(cpuHand[0]) {
    cpuPlayArea.push(cpuHand[0]);
    cpuHand.splice(0, 1);
  }
  // update zones
  updateZone(_cpuHandLoc, cpuHand);
  updateZone(_cpuPlayAreaLoc, cpuPlayArea);
  // CPU damage
  damage = cpuPlayArea.reduce((a, e) => a + +e.atk, 0);
  // only apply damage if there is a card to target (for now at least)
  if(userPlayArea[0]) {
    userPlayArea[0].def -= damage;
    if(userPlayArea[0].def <= 0) {
      // remove card from play area
      userPlayArea.splice(0, 1);
    }
    // update DOM
    await updateZone(_userPlayAreaLoc, userPlayArea);
  }
  // Cleanup 
  console.log('Cleanup...\ncpuHand: ' + cpuHand.length + '\ncpuPlayArea: ' + cpuPlayArea.length + '\nuserHand: ' + userHand.length + '\nuserPlayArea: ' + userPlayArea.length);if(userHand.length == 0 && userPlayArea.length == 0) {
    alert('You Win!!!... at losing.');
  }
  // Increment the turn counter
  turn++;
  _turnCounter.innerText = "Turn: " + turn;
  // Move to next phase
  _cpuTurnStep.classList.remove('activePhase');
  if(userHand.length > 0) {
    _selectCardStep.classList.add('activePhase');
  } else {
    _playTurnStep.classList.add('activePhase');
  }
}

