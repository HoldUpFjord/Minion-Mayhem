const http = require('http');
const fs = require('fs')
const url = require('url');
const querystring = require('querystring');
const figlet = require('figlet');

const pageList = [''];
const fileList = ['css/style.css', 'js/main.js'];

const server = http.createServer((req, res) => {
  const page = url.parse(req.url).pathname.slice(1);
  const params = querystring.parse(url.parse(req.url).query);
  console.log(page + ' requested...');

  // ------- Helper Functions -------- //

  //helper function to load a page given a path
  function loadPage(path) {
    let fixedPath = path.slice();
    if(fixedPath == '') {
      fixedPath = 'index';
    }
    fs.readFile(process.cwd() + `/html/${fixedPath}.html`, function(err, data) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data);
      res.end();
    });
    console.log('Successfully served ' + fixedPath + '.html');
  }
  
  //helper function to serve files
  function loadFile(filename) {
    if(filename.includes('.js')) {
      fs.readFile(filename, function(err, data) {
        res.writeHead(200, {'Content-Type': 'text/javascript'});
        res.write(data);
        res.end();
      });
    } else if(filename.includes('.css')) {
      fs.readFile(filename, function(err, data) {
        res.write(data);
        res.end();
      })
    } else {
      console.log("An improper file is being requested");
      return;
    }
    console.log('Successfully served ' + filename);
  }

  class Card { 
    constructor(prefix, name, img, heroClass){
    this.name = `${prefix} ${name}`
    this.img = img
    this.heroClass = heroClass
    this.atk = Math.ceil(Math.random() * 25) + 50
    this.def = Math.ceil(Math.random() * 50) + 100
    }
  }

  let cardGenerator = {
    prefixes: ['Cackling', 'True-shot', 'Enraged', 'Hallowed', 'Tranquil', 'Grifter', 'Dire', 'Undead', 'Fledgling', 'Inspired', 'Plague', 'Boastful', 'Holy', 'Gifted', 'Swarthy', 'Sprightly', 'Menacing', 'Innocent', 'Enlightened', 'Educated', 'Savage', 'Clumsy', 'Consumed', 'Gourmond', 'Dull'],
    names: ['Mascot', 'Golfer', 'Swordsman', 'Sorcerer', 'Strongman', 'Monk', 'Juggler', 'Cleric', 'Sage', 'Magician', 'Proctor', 'Thief', 'Vagabond', 'Man'],
    heroClasses: ['Chef', 'Warrior', 'Mage', 'Ranger', 'Barbarian', 'Druid', 'Tank', 'Paladin', 'Necromancer'],
    images: ['https://www.wargamer.com/wp-content/uploads/2022/01/Best-mtg-cards-2021-main-image-900x506.jpg','https://www.wargamer.com/wp-content/uploads/2021/03/magic-the-gathering-strixhaven-dragonsguard-elite-alt-artwork-900x506.jpg', 'https://www.wargamer.com/wp-content/uploads/2021/12/magic-the-gathering-reserved-list-is-doomed-sword-angel-900x507.jpg', 'https://www.wargamer.com/wp-content/uploads/2021/09/magic-the-gathering-innistrad-midnight-hunt-teferi-planeswalker-580x334.jpg', 'https://leonnoel.com/photo2.png'],
    randPre(){
      return cardGenerator.prefixes[Math.floor(Math.random() * cardGenerator.prefixes.length)]
    },
    randName(){
      let roll = Math.floor(Math.random() * cardGenerator.names.length);
      // if it picked the 'uncommon' names, roll again and use that result
      if(roll == 0 || roll == 1) {
        roll = Math.floor(Math.random() * cardGenerator.names.length);
      }
      return cardGenerator.names[roll];
    },
    randHeroClass(){
      let roll = Math.floor(Math.random() * cardGenerator.heroClasses.length);
      if(roll == 0) {
        roll = Math.floor(Math.random() * cardGenerator.heroClasses.length);
        if(roll == 0) {
          roll = Math.floor(Math.random() * cardGenerator.heroClasses.length);
        }
      }
      return cardGenerator.heroClasses[roll]
    },
    randImg(){
      let roll = Math.floor(Math.random() * cardGenerator.images.length);
      console.log(roll);
      return cardGenerator.images[roll];
    }
  }
  
  function generateHand(reqCardAmount){
    let cardsArr = []
    for(let i = 1;i <= reqCardAmount;i++){
      cardsArr.push(new Card(cardGenerator.randPre(), cardGenerator.randName(), cardGenerator.randImg(), cardGenerator.randHeroClass()));
    }
    return cardsArr;
  }

  // ------- Server responses -------- //

  // Loading pages
  if (pageList.includes(page)) {
    loadPage(page);
  }
  // Responding to API requests
  else if (page == 'api') {
    console.log('In API. Params:');
    console.log(params);
    if('cards' in params) {
      res.writeHead(200, {'Content-Type': 'application/json'});
      const hand = generateHand(params['cards']);
      console.log('from server: ' + hand.toString());
      res.end(JSON.stringify(hand));
    }
  }
  // Serving files
  else if (fileList.includes(page)){
    loadFile(page);
  }
  // If we don't know what it is, return a 404
  else{
    figlet('404!!', function(err, data) {
      if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
      }
      res.write(data);
      res.end();
    });
  }
});

server.listen(8000);
