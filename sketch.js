/*HELLO!
WELCOME TO BLOCK PUZZLE EQUIPMENT GAME!
The gems on the right side of the screen represent equipment, spells, skills, and other useful abilities. The goal of the game is to put gems together to make a useful combination of combat abilities. The exact workings of the abilities are intentionally vague, because there's no actual combat. They should be understandable enough.

CONTROLS
Press the play button in the top left of the page to start.
Clicking a gem on the right will cause it to appear in the grid. Clicking it again will remove it from the grid.
When a gem is in the grid, you can click and drag it around. While holding a gem this way, pressing any key will rotate it 90 degrees clockwise. Pressing the 'a' key will rotate it counter-clockwise instead.
Whenever you hover your mouse over a gem, its name and description will appear in a box at the bottom of the screen.
Click the "Next" button at the bottom-right to scroll the list of gems down. Pressing the 's' key will also scroll it down, and pressing the 'w' key will scroll it up.

RULES
Some gems are equipment, indicated by having an equipment type in its description: "Weapon", "Sidearm", "Armor", or "Accessory". You can only equip up to one of each equipment type; you can't wield two weapons, and you can't wear two sets of armor.
Gems aren't allowed to overlap. When two gems overlap, a yellow caution icon will appear to let you know where the overlap is.

Once you've finished putting together your abilities, you can press the 'p' key to print out a list of all your gems for convenient copy-pasting. The print-out will appear in the console below this window. I recommend expanding the console by dragging the top of it upward to see the full print-out.
*/

function preload() {
  redcross = loadImage('cross.png');
  warning = loadImage('warning.png');
}

function setup() {
  createCanvas(400, 400);
}

const _ = false; //for empty blocks in a gem or available spaces in a grid
const G = true; //for filled blocks in a gem
const U = true; //for unavailable spaces in a grid
const blockSize = 35; //Size of one block in the grid
const spaceOutline = 3; //strokeWeight of the outline of the spaces
const gridX = 5; //X offset of the grid
const gridY = 5;

const WEAPON = 0;
const ARMOR = 1;
const SIDEARM = 2;
const ACCESSORY = 3;

let heldGem = null;
let holdPosition = [0, 0];

//Returns the x coordinate of the xth block in the grid
function getGridX(x){
  return gridX + (x * blockSize);
}

function getGridY(y){
  return gridY + (y * blockSize);
}

//Returns the block in the grid where the given x coordinate lies
function reverseGridX(x){
  return floor((x - gridX)/blockSize);
}

function reverseGridY(y){
  return floor((y - gridY)/blockSize);
}

class Gem{
  constructor(name, gemColor, description, blocks){
    this.name = name;
    this.gemColor = gemColor;
    this.description = description;
    this.blocks = blocks;
    this.position = [0, 0];
    this.rotation = 0;
    this.equipped = false;
  }
  
  getBlocks() {
    let curBlocks = this.blocks;
    if(this.rotation % 2 === 1){
      let newBlocks = [];
      for(let i=0; i<this.blocks[0].length; i++){
        newBlocks[i] = [];
        for(let j=0; j<this.blocks.length; j++){
          newBlocks[i][j] = this.blocks.at(-j-1)[i];
        }
      }
      curBlocks = newBlocks;
    }
    
    if(this.rotation >= 2){
      let newBlocks = curBlocks.toReversed();
      for(let i=0; i<curBlocks.length; i++){
        newBlocks[i] = newBlocks[i].toReversed();
      }
      curBlocks = newBlocks;
    }
    
    return curBlocks;
  }
  
  isAtSpace(x, y) {
    if(this.position[0] > x || this.position[1] > y) {
      return false;
    }
    
    let gemX = x - this.position[0];
    let gemY = y - this.position[1];
    
    let curBlocks = this.getBlocks();
    
    if(gemY >= curBlocks.length || gemX >= curBlocks[gemY].length){
      return false
    }
    
    return curBlocks[gemY][gemX];
  }
  
  shiftPosition(x, y) {
    this.position[0] += x;
    this.position[1] += y;
    
    this.fixPosition()
  }
  
  gemRotate() {
    this.rotation++;
    this.rotation %= 4;
    
    this.fixPosition();
  }
  
  fixPosition() {
    let curBlocks = this.getBlocks();

    if(this.position[0] + curBlocks[0].length > 8){
      this.position[0] = 8 - curBlocks[0].length;
    }
    else if(this.position[0] < 0){
      this.position[0] = 0;
    }
    if(this.position[1] + curBlocks.length > 8){
      this.position[1] = 8 - curBlocks.length;
    }
    else if(this.position[1] < 0){
      this.position[1] = 0;
    }
  }
  
  toggleEquipped(array) {
    if(this.equipped){
      this.equipped = false;
      for(let i=0; i<array.length; i++){
        if(array[i] === this){
          array.splice(i, 1);
        }
      }
    }
    else{
      this.equipped = true;
      array.push(this);
    }
  }
}

class Equipment{
  constructor(name, type, description, spaces){
    this.name = name;
    this.type = type;
    this.description = description;
    this.spaces = spaces;
    this.rotation = 0;
    this.equipped = false;
  }
  
  toggleEquipped(array){
    if(this.equipped){
      this.equipped = false;
      array[this.type] = null;
    }
    else{
      this.equipped = true;
      if(array[this.type] !== null){
        array[this.type].toggleEquipped(array);
      }
      array[this.type] = this;
    }
  }
}

class Button{
  constructor(x, y, buttonWidth, buttonHeight, item){
    this.x = x;
    this.y = y;
    this.buttonWidth = buttonWidth;
    this.buttonHeight = buttonHeight;
    this.item = item;
  }
  
  inButton(x, y){
    return (x >= this.x && y >= this.y && x <= (this.x + this.buttonWidth) && y <= (this.y + this.buttonHeight))
  }
}

let gemsArray = [];
let equipArray = [];

function setUpStuff(){

//WEAPONS
  
gemsArray.push(new Gem(name="Shortsword", gemColor="gray", description="Weapon\n+2 Attack",
                    blocks=[
  [G],
  [G],
  [G],
  [G],
]));

gemsArray.push(new Gem(name="Warhammer", gemColor="gray", description="Weapon\n+4 Attack",
                    blocks=[
  [G, G, G],
  [G, G, G],
  [_, G, _],
  [_, G, _],
]));

gemsArray.push(new Gem(name="Large Shield", gemColor="gray", description="Sidearm\n+2 Defense, +2 Projectile Defense",
                    blocks=[
  [_, G, G, _],
  [G, G, G, G],
]));

gemsArray.push(new Gem(name="Water Spellbook", gemColor="gray", description="Sidearm\n+1 MP\nImproves water gems.",
                    blocks=[
  [_, _, G],
  [G, G, G],
]));

gemsArray.push(new Gem(name="Chain Mail", gemColor="black", description="Armor\n+3 Defense",
                    blocks=[
  [G, _, G],
  [G, G, G],
]));

gemsArray.push(new Gem(name="Mystic Robe", gemColor="black", description="Armor\n+2 Defense, +2 MP",
                    blocks=[
  [G, G, G, G],
  [G, G, G, _],
]));

gemsArray.push(new Gem(name="Cool Cape", gemColor="black", description="Accessory\n+1 Speed\nImproves mobility gems.",
                    blocks=[
  [_, G, _],
  [G, G, G],
]));

gemsArray.push(new Gem(name="Spirit Pendent", gemColor="black", description="Accessory\n+3 Element Resistance",
                    blocks=[
  [G, G, G],
  [G, _, _],
  [G, _, _],
]));
  
//FIRE
  
gemsArray.push(new Gem(name="Fireball", gemColor="red", description="Launch a projectile that explodes into fire.",
                    blocks=[
  [G, G, G],
  [_, G, _],
]));

gemsArray.push(new Gem(name="Flamethrower", gemColor="red", description="Shoot a wide cone of scorching flame.",
                    blocks=[
  [_, G, _, _],
  [G, G, G, _],
  [_, _, G, G],
  [_, _, G, _],
]));

gemsArray.push(new Gem(name="Scorched Earth", gemColor="red", description="Set a large area of ground on fire.",
                    blocks=[
  [G, _, G, _],
  [G, G, G, G],
]));
  
//LIGHTNING

gemsArray.push(new Gem(name="Bolt", gemColor="yellow", description="Strike a small lightning bolt nearby.",
                    blocks=[
  [G, G, _],
  [_, G, G],
]));

gemsArray.push(new Gem(name="Lightning Lv3", gemColor="yellow", description="Giant god damn lightning bolt.",
                    blocks=[
  [G, G, G, _, _],
  [_, _, G, _, _],
  [_, _, G, G, G],
]));

gemsArray.push(new Gem(name="Parry", gemColor="yellow", description="Time properly to fully negate an attack,\nreceiving no knockback or effects.",
                    blocks=[
  [G, G],
  [G, _],
]));
  
//PLANT

gemsArray.push(new Gem(name="Vine", gemColor="green", description="Lash out with a vine.",
                    blocks=[
  [G, G, G],
  [_, _, G],
]));

gemsArray.push(new Gem(name="Cure", gemColor="lightgreen", description="Cures one debuff.",
                    blocks=[
  [G, G],
  [G, _],
]));

gemsArray.push(new Gem(name="Heal", gemColor="lightgreen", description="Heal yourself or a distant ally.",
                    blocks=[
  [G, G, G],
  [_, _, G],
]));

gemsArray.push(new Gem(name="Halo", gemColor="lightgreen", description="Heal yourself and all nearby allies.",
                    blocks=[
  [G, _, _],
  [G, G, G],
  [G, _, _],
]));
  
//WIND

gemsArray.push(new Gem(name="Gust", gemColor="pink", description="A blast of air that pushes things away.",
                    blocks=[
  [G, G, G],
  [G, _, _],
]));

gemsArray.push(new Gem(name="Air Dash", gemColor="pink", description="An instant midair burst of speed.\nOne use per jump.",
                    blocks=[
  [G, G, G],
  [G, _, _],
]));

gemsArray.push(new Gem(name="Air Dash Lv2", gemColor="pink", description="An instant midair burst of speed.\nTwo uses per jump.",
                    blocks=[
  [G, G, G, G],
  [G, _, _, _],
  [G, _, _, _],
]));

gemsArray.push(new Gem(name="Wings", gemColor="pink", description="Fly freely through the air.",
                    blocks=[
  [G, G, _, G, G],
  [_, G, G, G, _],
  [_, _, G, _, _],
]));
  
//ICE

gemsArray.push(new Gem(name="Ice Lance", gemColor="cyan", description="Throw a spear of ice.",
                    blocks=[
  [G, G, G, G],
]));

gemsArray.push(new Gem(name="Icicle", gemColor="cyan", description="Thrust forward with a spear of ice.",
                    blocks=[
  [G, G, G],
]));

gemsArray.push(new Gem(name="Icicle Rain", gemColor="cyan", description="Launch a volley of ice spears.",
                    blocks=[
  [G, G, G],
  [G, _, G],
  [G, _, G],
]));

gemsArray.push(new Gem(name="Freeze", gemColor="cyan", description="A bolt of ice that briefly freezes the target.",
                    blocks=[
  [_, G, _],
  [G, G, G],
]));
  
//WATER

gemsArray.push(new Gem(name="Torrent", gemColor="blue", description="Conjure a rushing stream of water.",
                    blocks=[
  [_, G, G],
  [G, G, _],
]));

gemsArray.push(new Gem(name="Tidal Wave", gemColor="blue", description="Conjure a huge wave to crash down.",
                    blocks=[
  [_, G, G, G],
  [_, G, G, _],
  [G, G, G, _],
]));

gemsArray.push(new Gem(name="Absorb Element", gemColor="blue", description="Block an elemental attack and heal.",
                    blocks=[
  [G, G, G, G],
  [G, _, _, G],
]));
  
//STONE

gemsArray.push(new Gem(name="Stalagmite", gemColor="brown", description="Summon a stone spike to burst from the ground.",
                    blocks=[
  [G, G],
  [G, G],
]));

gemsArray.push(new Gem(name="Pillar", gemColor="brown", description="Grow a large stone pillar from the ground.\nCan be stood on or toppled over.",
                    blocks=[
  [_, G],
  [G, G],
  [G, G],
]));

gemsArray.push(new Gem(name="Endure", gemColor="brown", description="Briefly gain extreme defense and immunity\nto knockback.",
                    blocks=[
  [G, G],
  [G, G],
]));

gemsArray.push(new Gem(name="", gemColor="black", description=".",
                    blocks=[
  [_, _, _, _],
  [_, _, _, _],
  [_, _, _, _],
  [_, _, _, _],
]));
  
gemsArray.pop();

equipArray.push(new Equipment(name="Blank", type=ARMOR, description="Fits lots of gems",
                               spaces=[
  [_, _, _, _],
  [_, _, _, _],
  [_, _, _, _],
  [_, _, _, _],
]));

equipArray.push(new Equipment(name="Longsword", type=WEAPON, description="Atk: 3*",
                               spaces=[
  [_, _, U, _],
  [_, _, U, _],
  [_, U, U, U],
  [_, _, U, _],
]));

equipArray.push(new Equipment(name="Dragon Armor", type=ARMOR, description="Def: 4*\nFire Res +1",
                               spaces=[
  [U, U, _, U],
  [_, U, U, _],
  [_, U, U, _],
  [_, _, U, U],
]));

equipArray.push(new Equipment(name="Spare Dagger", type=SIDEARM, description="Atk: 1*",
                               spaces=[
  [_, _, _, U],
  [_, _, _, U],
  [_, _, _, _],
  [_, _, _, _],
]));

equipArray.push(new Equipment(name="Boots", type=ACCESSORY, description="Def: 2*\nSpd: 2*",
                         spaces=[
  [U, _, U, U],
  [U, _, U, U],
  [U, _, _, _],
  [U, _, _, _],
]));
}
setUpStuff();

function drawBoard(equipment, gems){
  noFill();
  stroke(150);
  strokeWeight(5);
  rect(5, 5, blockSize*8, blockSize*8);
  
  strokeWeight(0.5);
  for(let i=1; i<8; i++){
    line(5+blockSize*i, 5, 5+blockSize*i, 5+blockSize*8);
    line(5, 5+blockSize*i, 5+blockSize*8, 5+blockSize*i);
  }
  
  let grid = [];
  for(let i=0; i<8; i++){
    grid[i] = [];
  }
  
  //draw equipment
  for(let i=0; i<2; i++){
    for(let j=0; j<2; j++){
      let curEquipment = equipment[i+j*2];
      if(curEquipment === null){
        curEquipment = equipArray[0];
      }
      
      for(let k=0; k<4; k++){
        for(let l=0; l<4; l++){
          let fillColor = color(50, 50, 50);
          let outline = color('black');
          
          switch(curEquipment.spaces[k][l]){
            case _:
              fillColor.setAlpha(0);
              outline.setAlpha(0);
              break;
              
            case U:
              //black fill + dark outline are the default, all good
              break;
              
            default:
              print("Uh oh! Unrecognized space in an equipment!")
              print(curEquipment.spaces[k][l]);
          }
          
          let x = l + (j*4);
          let y = k + (i*4);
          
          drawSpace(x, y, fillColor, outline);
          grid[y][x] = [curEquipment.spaces[k][l]];
        }
      }
    }
  }
  
  //draw gems
  for(let i=0; i<gems.length; i++){
    let curGem = gems[i];
    let curBlocks = curGem.getBlocks();
    
    for(let j=0; j<curBlocks.length; j++){
      for(let k=0; k<curBlocks[j].length; k++){
        if(curBlocks[j][k] === _){
          continue;
        }
        
        let x = curGem.position[0] + k;
        let y = curGem.position[1] + j;
        
        let fillColor = curGem.gemColor;
        let outline = color(150, 150, 150);
        if(curGem === heldGem){
          outline = color('magenta')
        }
        
        drawSpace(x, y, fillColor, outline);
        grid[y][x].push(curGem);
      }
    }
  }
  
  for(let i=0; i<8; i++){
    for(let j=0; j<8; j++){
      let curArray = grid[i][j];
      let trues = 0;
      
      for(let k=0; k<curArray.length; k++){
        if(curArray[k] !== _){
          trues++;
        }
      }
      
      if(trues > 1){
        let drawImage = warning;
        if(curArray[0] !== _){
          drawImage = redcross;
        }
        
        image(drawImage, getGridX(j), getGridY(i), blockSize, blockSize);
      }
    }
  }
}

function drawSpace(x, y, fillColor, outline, drawScale=1){
  fill(fillColor);
  stroke(outline);
  strokeWeight(spaceOutline*drawScale);
  rect((getGridX(x)+spaceOutline/2)*drawScale, (getGridY(y)+spaceOutline/2)*drawScale, (blockSize-spaceOutline)*drawScale, (blockSize-spaceOutline)*drawScale);
}

let gemsInUse = [];
let equipsInUse = [null, null, null, null];

let gemInventoryIndex = 0;
let gemButtons = [];

function drawGemInventory(x, y, gemsPerColumn, gems=gemsArray, drawScale=0.3) {
  gemButtons = [];
  if(gemInventoryIndex*gemsPerColumn > gems.length || gemInventoryIndex < 0){
    gemInventoryIndex = 0;
  }
  for(let i=0; i<gemsPerColumn && i+gemInventoryIndex*gemsPerColumn < gems.length; i++){
    let curGem = gems[i+gemInventoryIndex*gemsPerColumn];
    
    let curBlocks = curGem.blocks;
    
    for(let j=0; j<curBlocks.length; j++){
      for(let k=0; k<curBlocks[j].length; k++){
        if(curBlocks[j][k] === _){
          continue;
        }
        
        let curX = x + k;
        let curY = y + j + i*6;
        
        let fillColor = curGem.gemColor;
        let outline = color(150, 150, 150);
        
        drawSpace(curX, curY, fillColor, outline, drawScale);
      }
    }
    
    let help = blockSize * drawScale * 6;
    gemButtons.push(new Button(322, (y*blockSize*drawScale)+(i*help) - blockSize*drawScale/2, help, help, curGem));
    
    //Box around equipped gems, also shows button hitbox
    if(curGem.equipped){
      noFill();
      stroke(color(150, 150, 150));
      strokeWeight(spaceOutline);
      rect(322, (y*blockSize*drawScale)+(i*help) - blockSize*drawScale/2, help, help);
    }
  }
  
  let help = blockSize * drawScale * 6;
  noFill();
  stroke(color(150, 150, 150));
  strokeWeight(spaceOutline);
  rect(322, (y*blockSize*drawScale)+(5*help) - blockSize*drawScale/2, help, help);
  
  noStroke();
  fill(150, 150, 150);
  text("Next", 338, (y*blockSize*drawScale)+(5.47*help));
  
  gemButtons.push(new Button(322, (y*blockSize*drawScale)+(5*help) - blockSize*drawScale/2, help, help, 'arrow'));
}

let hoverGem = null;
function drawGemDesc(gem){
  fill('white');
  stroke(150, 150, 150);
  strokeWeight(spaceOutline);
  rect(10, 300, 300, 80);
  
  fill('black');
  noStroke();
  let string = gem.name + "\n" + gem.description;
  text(string, 15, 315);
}

function checkButtons(buttonList){
  for(let i=0; i<buttonList.length; i++){
    if(buttonList[i].inButton(mouseX, mouseY)){
      return buttonList[i].item;
    }
  }
  
  return null;
}

mousePressed = function() {
  let x = reverseGridX(mouseX);
  let y = reverseGridY(mouseY);
  
  for(let i=1; i<=gemsInUse.length; i++){
    if(gemsInUse.at(i * -1).isAtSpace(x, y)){
      heldGem = gemsInUse.at(i * -1);
      hoverGem = heldGem;
      gemsInUse.splice(i * -1, 1);
      gemsInUse.push(heldGem);
      holdPosition = [x, y];
      break;
    }
  }
  
  if(heldGem === null){
    let gemButton = checkButtons(gemButtons);
    
    if(gemButton === "arrow"){
      gemInventoryIndex++;
    }
    else if(gemButton !== null){
      gemButton.toggleEquipped(gemsInUse);
    }
  }
}

mouseMoved = function(){
  if(heldGem === null){
    let x = reverseGridX(mouseX);
    let y = reverseGridY(mouseY);
    
    for(let i=1; i<=gemsInUse.length; i++){
      if(gemsInUse.at(i * -1).isAtSpace(x, y)){
        hoverGem = gemsInUse.at(i * -1);
        
        return;
      }
    }
    
    let gemButton = checkButtons(gemButtons);
    
    if(gemButton !== 'arrow' && gemButton !== null){
      hoverGem = gemButton;
    }
  }
}

mouseDragged = function() {
  if(heldGem !== null){
    let x = reverseGridX(mouseX);
    let y = reverseGridY(mouseY);
    
    if(x !== holdPosition[0] ||
       y !== holdPosition[1]){
      
      heldGem.shiftPosition(x - holdPosition[0], y - holdPosition[1]);

      holdPosition = [x, y];
    }
  }
}

keyPressed = function() {
  if(heldGem !== null){
    heldGem.gemRotate();
    if(key === 'a' || key === 'A'){
      heldGem.gemRotate();
      heldGem.gemRotate();
    }
  }
  
  if(key === 'p' || key === 'P'){
    let output = "";
    for(let i=0; i<gemsInUse.length; i++){
      let gem = gemsInUse[i];
      output += gem.name + "\n" + gem.description + "\n\n";
    }
    
    print(output);
  }
  
  if(key === 's' || key === 'S'){
    gemInventoryIndex++;
  }
  
  if(key === 'w' || key === 'W'){
    gemInventoryIndex--;
  }
}

mouseReleased = function() {
  heldGem = null;
}

function draw() {
  background(200);
  drawBoard(equipsInUse, gemsInUse);
  drawGemInventory(31, 1, 5);
  if(hoverGem !== null){
    drawGemDesc(hoverGem);
  }
}