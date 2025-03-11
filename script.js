const dungeonContainer = document.getElementById('dungeon');
const playerHpDisplay = document.getElementById('player-info');
const enemyHpDisplay = document.getElementById('enemy-info');
const messageArea = document.getElementById('message-area');
const toggleStatusButton = document.getElementById('toggle-status');
const statusArea = document.getElementById('status-area');
const effectCanvas = document.getElementById('effect-canvas');
const ctx = effectCanvas.getContext('2d');

const dungeonWidth = 20;
const dungeonHeight = 15;
let dungeonMap = [];
let playerPosition = { x: 1, y: 1 };

const enemyTypes = {
  slime: {
    name: "スライム",
    display: '🦠',
    hp: 30,
    attack: 5,
    defense: 1,
    speed: 20,
    sightRange: 5,
    minLevel: 1,
    xp: 20
  },
  goblin: {
    name: "ゴブリン",
    display: '🧌',
    hp: 50,
    attack: 10,
    defense: 3,
    speed: 30,
    sightRange: 8,
    minLevel: 1,
    xp: 50
  },
  wolf: {
    name: "ウルフ",
    display: '🐺',
    hp: 60,
    attack: 12,
    defense: 2,
    speed: 40,
    sightRange: 10,
    minLevel: 3,
    xp: 70
  },
  skeleton: {
    name: "スケルトン",
    display: '💀',
    hp: 80,
    attack: 15,
    defense: 5,
    speed: 25,
    sightRange: 7,
    minLevel: 4,
    xp: 90
  },
  spider: {
    name: "巨大グモ",
    display: '🕷️',
    hp: 70,
    attack: 13,
    defense: 3,
    speed: 35,
    sightRange: 9,
    poisonAttack: 5,
    poisonChance: 0.3,
    minLevel: 5,
    xp: 80
  },
  orc: {
    name: "オーク",
    display: '👹',
    hp: 100,
    attack: 18,
    defense: 7,
    speed: 30,
    sightRange: 8,
    minLevel: 6,
    xp: 110
  },
  golem: {
    name: "ゴーレム",
    display: '🗿',
    hp: 150,
    attack: 20,
    defense: 10,
    speed: 15,
    sightRange: 6,
    minLevel: 8,
    xp: 150
  },
  wraith: {
    name: "レイス",
    display: '👻',
    hp: 90,
    attack: 22,
    defense: 4,
    speed: 40,
    sightRange: 12,
    minLevel: 9,
    xp: 120
  },
  minotaur: {
    name: "ミノタウロス",
    display: '🐂',
    hp: 180,
    attack: 25,
    defense: 12,
    speed: 35,
    sightRange: 10,
    minLevel: 10,
    xp: 180
  },
  dragon: {
    name: "ドラゴン",
    display: '🐲',
    hp: 300,
    attack: 30,
    defense: 15,
    speed: 45,
    sightRange: 15,
    fireAttack: 10,
    minLevel: 12,
    xp: 250
  },
  boss_ogre: {
    name: "オーガ",
    display: '👹',
    hp: 200,
    attack: 20,
    defense: 10,
    speed: 40,
    sightRange: 10,
    minLevel: 5,
    xp: 200
  }
};

let enemies = [];

let playerHp = 100;
let playerAttack = 10;
let playerDefense = 5;
let playerAccuracy = 0.8;
let playerEvasion = 0.05;
let playerLevel = 1;
let playerExperience = 0;
const experienceToLevelUp = 100;
let equippedWeapon = null;
let equippedArmor = null;
let equippedShoes = null;
let inventory = [];
let isFighting = false;
let gameLoopInterval;

const items = {
  weapon_sword: {
    name: "鉄の剣",
    type: "weapon",
    attackBonus: 5,
    hitRate: 0.8,
    display: '⚔️',
    rarity: 2,
    minLevel: 3
  },
  weapon_dagger: {
    name: "短剣",
    type: "weapon",
    attackBonus: 3,
    hitRate: 0.9,
    display: '🗡️',
    rarity: 2,
    minLevel: 2
  },
  weapon_lance: {
    name: "ランス",
    type: "weapon",
    attackBonus: 7,
    hitRate: 0.7,
    display: '🪖',
    rarity: 3,
    minLevel: 5
  },
  weapon_axe: {
    name: "戦斧",
    type: "weapon",
    attackBonus: 9,
    hitRate: 0.6,
    display: '🪓',
    rarity: 4,
    minLevel: 7
  },
  weapon_rare_katana: {
    name: "妖刀",
    type: "weapon",
    attackBonus: 10,
    hitRate: 0.85,
    display: '🔪',
    description: "攻撃力が高い",
    rarity: 5,
    minLevel: 8,
    fireDamage: 5,
    criticalRate: 0.1
  },
  weapon_wand: {
    name: "魔法の杖",
    type: "weapon",
    attackBonus: 4,
    hitRate: 0.95,
    display: '🪄',
    rarity: 3,
    minLevel: 4,
    poisonDamage: 3
  },
  weapon_bow: {
    name: "弓",
    type: "weapon",
    attackBonus: 6,
    hitRate: 0.75,
    display: '🏹',
    rarity: 3,
    minLevel: 4
  },
  armor_leather: {
    name: "革の鎧",
    type: "armor",
    defenseBonus: 3,
    display: '🛡️',
    rarity: 2,
    minLevel: 3
  },
  armor_shield: {
    name: "木の盾",
    type: "armor",
    defenseBonus: 2,
    display: '🪖',
    rarity: 2,
    minLevel: 2
  },
  shoes_leather: {
    name: "革の靴",
    type: "shoes",
    evasionBonus: 0.1,
    display: '👞',
    rarity: 2,
    minLevel: 2
  },
  shoes_boots: {
    name: "ブーツ",
    type: "shoes",
    evasionBonus: 0.15,
    display: '🥾',
    rarity: 3,
    minLevel: 5
  },
  potion_heal: {
    name: "回復薬",
    type: "potion",
    healAmount: 30,
    display: '🧪',
    rarity: 1,
    minLevel: 1
  },
  bomb: {
    name: "爆弾",
    type: "consumable",
    display: '💣',
    damage: 50,
    description: "周囲の敵と壁にダメージを与える",
    rarity: 2,
    minLevel: 2
  },
  scroll_teleport: {
    name: "テレポートの巻物",
    type: "scroll",
    display: '📜',
    description: "ランダムな場所にテレポートする",
    rarity: 3,
    minLevel: 5
  },
  ring_protection: {
    name: "守りの指輪",
    type: "ring",
    defenseBonus: 2,
    display: '💍',
    description: "防御力を少し上げる",
    rarity: 3,
    minLevel: 4
  },
  food_ration: {
    name: "携帯食料",
    type: "food",
    healAmount: 10,
    display: '🍞',
    description: "HPを少し回復する",
    rarity: 1,
    minLevel: 1
  }
};

function generateDungeon() {
  dungeonMap = [];
  for (let y = 0; y < dungeonHeight; y++) {
    dungeonMap[y] = Array(dungeonWidth).fill('#');
  }

  let rooms = [];

  function splitSpace(x, y, width, height) {
    if (width < 5 || height < 5) {
      let roomWidth = Math.floor(Math.random() * (width - 2)) + 2;
      let roomHeight = Math.floor(Math.random() * (height - 2)) + 2;
      let roomX = x + Math.floor(Math.random() * (width - roomWidth));
      let roomY = y + Math.floor(Math.random() * (height - roomHeight));

      rooms.push({ x: roomX, y: roomY, width: roomWidth, height: roomHeight });
      return;
    }

    let splitHorizontal = Math.random() < 0.5;
    if (splitHorizontal) {
      let splitY = y + Math.floor(Math.random() * (height - 1)) + 1;
      splitSpace(x, y, width, splitY - y);
      splitSpace(x, splitY, width, height - (splitY - y));
    } else {
      let splitX = x + Math.floor(Math.random() * (width - 1)) + 1;
      splitSpace(x, y, splitX - x, height);
      splitSpace(splitX, y, width - (splitX - x), height);
    }
  }

  splitSpace(1, 1, dungeonWidth - 2, dungeonHeight - 2);

  rooms.forEach(room => {
    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        dungeonMap[y][x] = '.';
      }
    }
  });

  for (let i = 0; i < rooms.length - 1; i++) {
    connectTwoPoints({x: Math.floor(rooms[i].x + rooms[i].width / 2), y: Math.floor(rooms[i].y + rooms[i].height / 2)},
      {x: Math.floor(rooms[i+1].x + rooms[i+1].width / 2), y: Math.floor(rooms[i+1].y + rooms[i+1].height / 2)});
  }

  playerPosition = findValidSpawnPoint();
  dungeonMap[playerPosition.y][playerPosition.x] = '.';

  spawnEnemies();
  spawnItems();
}

function connectTwoPoints(start, end) {
  let x = start.x, y = start.y;
  while (x !== end.x) {
    dungeonMap[y][x] = '.';
    x += (end.x > x) ? 1 : -1;
  }
  while (y !== end.y) {
    dungeonMap[y][x] = '.';
    y += (end.y > y) ? 1 : -1;
  }
  dungeonMap[y][x] = '.';
}

function findValidSpawnPoint() {
  let x, y;
  while (true) {
    x = Math.floor(Math.random() * dungeonWidth);
    y = Math.floor(Math.random() * dungeonHeight);
    if (dungeonMap[y][x] === '.') {
      return { x, y };
    }
  }
}

function getRandomFloorPosition() {
  let x, y;
  while (true) {
    x = Math.floor(Math.random() * dungeonWidth);
    y = Math.floor(Math.random() * dungeonHeight);
    if (dungeonMap[y][x] === '.') {
      return { x, y };
    }
  }
}

function createEnemy(enemyType, playerLevel) {
  let hp = enemyType.hp;
  let attack = enemyType.attack;
  let defense = enemyType.defense;
  let speed = enemyType.speed;

  if (enemyType.name === enemyTypes.boss_ogre.name) {
    let ogrehpModifier = playerLevel / 5;
    let ogreModifier = 0.5 + playerLevel / 10;

    hp = Math.floor(enemyType.hp * ogrehpModifier);
    attack = Math.floor(enemyType.attack * ogreModifier);
    defense = Math.floor(enemyType.defense * ogreModifier);
    speed = Math.floor(enemyType.speed * ogreModifier);
  } else {
    let levelModifier = 1 + (playerLevel * 0.2);
    let levelhpModifier = 1 + (playerLevel * 0.2);

    hp = Math.floor(enemyType.hp * levelhpModifier);
    attack = Math.floor(enemyType.attack * levelModifier);
    defense = Math.floor(enemyType.defense * levelModifier);
    speed = Math.floor(enemyType.speed * levelModifier);
  }

  return {
    type: enemyType,
    name: enemyType.name,
    display: enemyType.display,
    hp: hp,
    maxHp: hp,
    attack: attack,
    defense: defense,
    speed: speed,
    sightRange: enemyType.sightRange,
    fireAttack: enemyType.fireAttack || 0,
    poisonAttack: enemyType.poisonAttack || 0,
    poisonChance: enemyType.poisonChance || 0,
    x: 0,
    y: 0,
    isAggro: false,
    moveTimer: 0,
    element: null // 敵のDOM要素への参照
  };
}

function spawnEnemies() {
  enemies = [];
  let enemyCount = 5;

  for (let i = 0; i < enemyCount; i++) {
    let possibleEnemyTypes = Object.entries(enemyTypes)
      .filter(([key, enemyType]) => enemyType.minLevel <= playerLevel && key !== 'boss_ogre')
      .map(([key, enemyType]) => key);

    if (possibleEnemyTypes.length === 0) {
      possibleEnemyTypes = ['slime'];
    }

    let randomEnemyTypeKey = possibleEnemyTypes[Math.floor(Math.random() * possibleEnemyTypes.length)];
    let enemyType = enemyTypes[randomEnemyTypeKey];
    let enemy = createEnemy(enemyType, playerLevel);

    let spawnPoint = getRandomFloorPosition();
    enemy.x = spawnPoint.x;
    enemy.y = spawnPoint.y;
    enemies.push(enemy);
    dungeonMap[enemy.y][enemy.x] = 'E';
  }
}

function spawnItems() {
  for (let itemName in items) {
    let item = items[itemName];
    if (item.minLevel <= playerLevel) {
      let spawnPoint = getRandomFloorPosition();
      dungeonMap[spawnPoint.y][spawnPoint.x] = itemName;
    }
  }
}

function drawDungeon() {
  dungeonContainer.innerHTML = '';
  dungeonContainer.style.gridTemplateColumns = `repeat(${dungeonWidth}, 1fr)`;

  for (let y = 0; y < dungeonHeight; y++) {
    for (let x = 0; x < dungeonWidth; x++) {
      const cell = createDungeonCell(x, y);
      dungeonContainer.appendChild(cell);
    }
  }
}

function createDungeonCell(x, y) {
  const cell = document.createElement('div');
  cell.classList.add('cell');
  const cellType = dungeonMap[y][x];

  switch (cellType) {
    case '#': cell.classList.add('wall'); break;
    case '.': cell.classList.add('floor'); break;
    default:
      if (items[cellType]) {
        cell.classList.add('item-' + items[cellType].type);
      } else {
        cell.classList.add('floor');
      }
      break;
  }

  if (playerPosition.x === x && playerPosition.y === y) {
    cell.classList.add('player');
  }

  const enemyAtCell = enemies.find(enemy => enemy.x === x && enemy.y === y);
  if (enemyAtCell) {
    cell.classList.add('enemy');
    cell.textContent = '';
    cell.innerHTML = enemyAtCell.type.display;
    enemyAtCell.element = cell; // 敵のDOM要素を記録
  }

  return cell;
}

function movePlayer(dx, dy) {
  if (isFighting) return;

  const newX = playerPosition.x + dx;
  const newY = playerPosition.y + dy;

  if (newX >= 0 && newX < dungeonWidth && newY >= 0 && newY < dungeonHeight && dungeonMap[newY][newX] !== '#') {
    playerPosition.x = newX;
    playerPosition.y = newY;

    const cellType = dungeonMap[playerPosition.y][playerPosition.x];

    if (items[cellType]) {
      getItem(cellType);
      dungeonMap[playerPosition.y][playerPosition.x] = '.';
      drawDungeon();
    }

    const contactedEnemy = enemies.find(enemy => enemy.x === playerPosition.x && enemy.y === playerPosition.y && enemy.hp > 0);
    if (contactedEnemy) {
      startBattle(contactedEnemy);
    } else {
      drawDungeon();
    }
  }

  if (enemies.length === 0) {
    displayMessage("ダンジョンクリア！次の階層へ！");
    generateDungeon();
    drawDungeon();
  }
}

function updateEnemyAI() {
  enemies.forEach(enemy => {
    if (enemy.hp <= 0) return;

    enemy.moveTimer++;
    if (enemy.moveTimer % enemy.type.speed !== 0) return;

    if (!enemy.isAggro) {
      if (isPlayerInSight(enemy)) {
        enemy.isAggro = true;
        displayMessage(`${enemy.name} が プレイヤーを見つけた！`);
      } else {
        // ランダムな移動 (徘徊)
        let randomMove = Math.floor(Math.random() * 4);
        let dx = 0, dy = 0;
        switch (randomMove) {
          case 0: dx = 1; break;
          case 1: dx = -1; break;
          case 2: dy = 1; break;
          case 3: dy = -1; break;
        }
        moveEnemy(enemy, dx, dy);
      }
    } else {
      chasePlayer(enemy);
    }
  });
}

function moveEnemy(enemy, dx, dy) {
  const newX = enemy.x + dx;
  const newY = enemy.y + dy;

  if (newX >= 0 && newX < dungeonWidth && newY >= 0 && newY < dungeonHeight && dungeonMap[newY][newX] !== '#') {
    dungeonMap[enemy.y][enemy.x] = '.';
    enemy.x = newX;
    enemy.y = newY;
    dungeonMap[enemy.y][enemy.x] = 'E';

    if (enemy.x === playerPosition.x && enemy.y === playerPosition.y) {
      startBattle(enemy);
    }
    drawDungeon();
  }
}

function isPlayerInSight(enemy) {
  const dx = playerPosition.x - enemy.x;
  const dy = playerPosition.y - enemy.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance <= enemy.type.sightRange;
}

function chasePlayer(enemy) {
  const dx = playerPosition.x - enemy.x;
  const dy = playerPosition.y - enemy.y;

  let moveX = 0;
  let moveY = 0;

  if (Math.abs(dx) > Math.abs(dy)) {
    moveX = dx > 0 ? 1 : -1;
  } else {
    moveY = dy > 0 ? 1 : -1;
  }

  moveEnemy(enemy, moveX, moveY);
}

function getItem(itemType) {
  const item = items[itemType];
  if (item) {
    inventory.push(item);
    updateInventoryUI();
    displayMessage(`${item.name} を手に入れた！`, 'item');
  }
}

function updateInventoryUI() {
    const inventoryItemsList = document.getElementById('inventory-items');
    if (!inventoryItemsList) return;
    inventoryItemsList.innerHTML = '';

    const itemCounts = {};
    inventory.forEach(item => {
        if (itemCounts[item.name]) {
            itemCounts[item.name].count++;
        } else {
            itemCounts[item.name] = { item: item, count: 1 };
        }
    });

    const filteredInventory = inventory.filter(item => {
        if (item.type === 'weapon' && equippedWeapon === item) return false;
        if (item.type === 'armor' && equippedArmor === item) return false;
        if (item.type === 'shoes' && equippedShoes === item) return false;
        return true;
    });

    filteredInventory.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.name} (${item.display}) x${itemCounts[item.name].count}`;

        // アイテムを使用するボタン
        const useButton = document.createElement('button');
        useButton.textContent = '使う';
        useButton.addEventListener('click', (event) => {
            event.stopPropagation(); // イベントのバブリングを防ぐ
            useItem(item);
        });

        // アイテムを捨てるボタン
        const dropButton = document.createElement('button');
        dropButton.textContent = '捨てる';
        dropButton.addEventListener('click', (event) => {
            event.stopPropagation(); // イベントのバブリングを防ぐ
            dropItemFromInventory(item);
        });

        listItem.appendChild(useButton);
        listItem.appendChild(dropButton);
        inventoryItemsList.appendChild(listItem);
    });
}

function dropItemFromInventory(item) {
    const index = inventory.findIndex(i => i === item);
    if (index > -1) {
        inventory.splice(index, 1);
        displayMessage(`${item.name} を捨てた！`);
        updateInventoryUI();
    }
}

function useItem(item) {
    if (item.type === 'potion') {
        playerHp += item.healAmount;
        playerHp = Math.min(playerHp, 100);
        updateHpDisplay();
        displayMessage(`${item.name} を使って HP が ${item.healAmount} 回復した！`, 'item');
    } else if (item.type === 'weapon') {
        equipWeapon(item);
    } else if (item.type === 'consumable') {
        useConsumable(item);
    } else if (item.type === 'armor') {
        equipArmor(item);
    } else if (item.type === 'scroll') {
        useScroll(item);
    } else if (item.type === 'ring') {
        equipRing(item);
    } else if (item.type === 'food') {
        eatFood(item);
    } else if (item.type === 'shoes') {
        equipShoes(item);
    }

    // 消耗品のみインベントリから1つだけ消費
    if (item.type === 'potion' || item.type === 'consumable' || item.type === 'scroll' || item.type === 'food') {
        removeItemFromInventory(item);
    }
}
    
    function removeItemFromInventory(itemToRemove) {
      const index = inventory.findIndex(item => item === itemToRemove);
      if (index > -1) {
        inventory.splice(index, 1);
      }
    
      if (equippedShoes === itemToRemove) {
        playerEvasion -= equippedShoes.evasionBonus;
        equippedShoes = null;
        updateHpDisplay();
      }
    
      updateInventoryUI();
    }
    
    function equipWeapon(weapon) {
      if (equippedWeapon) {
        playerAttack -= equippedWeapon.attackBonus;
        playerAccuracy -= equippedWeapon.hitRate;
      }
      equippedWeapon = weapon;
      playerAttack += equippedWeapon.attackBonus;
      playerAccuracy += equippedWeapon.hitRate;
      updateHpDisplay();
      updateInventoryUI();
      displayMessage(`${weapon.name} を装備した！ 攻撃力 +${weapon.attackBonus}、命中率 +${weapon.hitRate}`);
    }
    
    function equipArmor(armor) {
      if (equippedArmor) {
        playerDefense -= equippedArmor.defenseBonus;
      }
      equippedArmor = armor;
      playerDefense += equippedArmor.defenseBonus;
      updateHpDisplay();
      updateInventoryUI();
      displayMessage(`${armor.name} を装備した！ 防御力 +${armor.defenseBonus}`);
    }
    
    function equipShoes(shoes) {
      if (equippedShoes) {
        playerEvasion -= equippedShoes.evasionBonus;
      }
    
      equippedShoes = shoes;
      playerEvasion += equippedShoes.evasionBonus;
      updateHpDisplay();
      updateInventoryUI();
      displayMessage(`${shoes.name} を装備した！回避率 +${shoes.evasionBonus * 100}%`);
    }
    
    function useConsumable(item) {
      if (item.name === "爆弾") {
        displayMessage("爆弾を使った！");
    
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const targetX = playerPosition.x + dx;
            const targetY = playerPosition.y + dy;
    
            if (targetX >= 0 && targetX < dungeonWidth && targetY >= 0 && targetY < dungeonHeight) {
              const enemy = enemies.find(e => e.x === targetX && e.y === targetY);
              if (enemy) {
                const damage = item.damage;
                enemy.hp -= damage;
                displayMessage(`${enemy.name} に ${damage} ダメージ！`, 'critical');
                createDamagePopup(enemy, damage);
    
                if (enemy.hp <= 0) {
                  displayMessage(`${enemy.name} を倒した！`);
                  dungeonMap[enemy.y][enemy.x] = '.';
                  enemies = enemies.filter(e => e !== enemy);
                  gainExperience(enemy);
                }
              }
              if (dungeonMap[targetY][targetX] === '#') {
                dungeonMap[targetY][targetX] = '.';
                displayMessage(`壁を破壊した！`);
              }
            }
          }
        }
        drawDungeon();
        removeItemFromInventory(item);
        updateHpDisplay();
    
        if (enemies.length === 0) {
          displayMessage("ダンジョンクリア！次の階層へ！");
          generateDungeon();
          drawDungeon();
        }
      }
    }
    
    function displayMessage(message, type = 'normal') {
      const messageElement = document.createElement('p');
      messageElement.textContent = message;
      messageElement.classList.add('message');
    
      switch (type) {
        case 'player':
          messageElement.classList.add('player-message');
          break;
        case 'enemy':
          messageElement.classList.add('enemy-message');
          break;
        case 'critical':
          messageElement.classList.add('critical-message');
          break;
        case 'miss':
          messageElement.classList.add('miss-message');
          break;
        case 'item':
          messageElement.classList.add('item-message');
          break;
        case 'levelUp':
          messageElement.classList.add('level-up-message');
          break;
        default:
          break;
      }
    
      messageArea.appendChild(messageElement);
      messageArea.scrollTop = messageArea.scrollHeight;
      messageArea.setAttribute('aria-label', message);
    }
    
    function dropItem(enemy) {
      const dropRate = 0.2;
    
      if (Math.random() < dropRate) {
        const possibleDrops = Object.values(items).filter(item => item.minLevel <= playerLevel);
    
        if (possibleDrops.length > 0) {
          let totalRarity = possibleDrops.reduce((sum, item) => sum + item.rarity, 0);
          let randomNumber = Math.random() * totalRarity;
          let droppedItem = null;
    
          for (let item of possibleDrops) {
            randomNumber -= item.rarity;
            if (randomNumber <= 0) {
              droppedItem = item;
              break;
            }
          }
    
          if (droppedItem) {
            dungeonMap[enemy.y][enemy.x] = Object.keys(items).find(key => items[key] === droppedItem);
            displayMessage(`${enemy.name} は ${droppedItem.name} をドロップした！`);
            drawDungeon();
          }
        }
      }
    }
    
    function calculateDamage(attacker, defender) {
        // 基本ダメージは攻撃力 - 防御力
        let damage = attacker.attack - defender.defense;
        // 最低でも1のダメージを保証
        return Math.max(1, damage);
    }
    
    function startBattle(enemy) {
        if (isFighting) return;
        isFighting = true;
        displayMessage(`${enemy.name} との戦闘開始！`);
    
        let battleInterval = setInterval(() => {
            // プレイヤーの攻撃
            let damageToEnemy = calculateDamage({attack: playerAttack, accuracy: playerAccuracy}, {defense: enemy.defense});
            let hitRoll = Math.random();
    
            // 命中判定
            if (hitRoll < playerAccuracy) {
                enemy.hp -= damageToEnemy;
                enemy.hp = Math.max(0, enemy.hp);
                displayMessage(`プレイヤーの攻撃！ ${enemy.name} に ${damageToEnemy} ダメージ！ (残りHP: ${enemy.hp})`, 'player');
                createDamagePopup(enemy, damageToEnemy);
    
                // 武器の属性ダメージ
                let elementalDamage = 0;
                if (equippedWeapon && equippedWeapon.fireDamage) {
                    elementalDamage += equippedWeapon.fireDamage;
                }
                if (equippedWeapon && equippedWeapon.poisonDamage) {
                    elementalDamage += equippedWeapon.poisonDamage;
                }
    
                if (elementalDamage > 0) {
                    enemy.hp -= elementalDamage;
                    enemy.hp = Math.max(0, enemy.hp);
                    displayMessage(`属性ダメージ！${enemy.name} に ${elementalDamage} ダメージ！ (残りHP: ${enemy.hp})`, 'critical');
                    createDamagePopup(enemy, elementalDamage, 'fire');
                }
            } else {
                displayMessage("プレイヤーの攻撃！ " + enemy.name + " は攻撃を回避した！", 'miss');
            }
            updateHpDisplay();
    
            if (enemy.hp <= 0) {
                clearInterval(battleInterval);
                displayMessage(`${enemy.name} を倒した！`);
    
                dropItem(enemy);
    
                enemies = enemies.filter(e => e !== enemy);
                dungeonMap[enemy.y][enemy.x] = '.';
                drawDungeon();
    
                gainExperience(enemy);
                updateHpDisplay();
                isFighting = false;
                return;
            }
    
            // 敵の攻撃
            let damageToPlayer = calculateDamage({attack: enemy.attack}, {defense: playerDefense});
            let enemyHitRoll = Math.random();
    
            if (enemyHitRoll > playerEvasion) {
                playerHp -= damageToPlayer;
                playerHp = Math.max(0, playerHp);
                displayMessage(`敵の攻撃！ プレイヤーに ${damageToPlayer} ダメージ！ (残りHP: ${playerHp})`, 'enemy');
    
                // 敵の属性攻撃
                let enemyElementalDamage = 0;
                if (enemy.type.fireAttack) {
                    enemyElementalDamage += enemy.type.fireAttack;
                }
                if (enemy.type.poisonAttack) {
                    enemyElementalDamage += enemy.type.poisonAttack;
                }
    
                if (enemyElementalDamage > 0) {
                    playerHp -= enemyElementalDamage;
                    playerHp = Math.max(0, playerHp);
                    displayMessage(`属性ダメージ！プレイヤーは ${enemyElementalDamage} ダメージを受けた！ (残りHP: ${playerHp})`, 'critical');
                    createDamagePopup({element: document.querySelector('.player')}, enemyElementalDamage, 'fire');
                }
            } else {
                displayMessage("敵の攻撃！プレイヤーは攻撃を回避した！", 'miss');
            }
            updateHpDisplay();
    
            if (playerHp <= 0) {
                clearInterval(battleInterval);
                displayMessage("プレイヤーは倒れた...");
                playerHp = 0;
                updateHpDisplay();
                isFighting = false;
                displayMessage("ゲームオーバー...");
                stopGameLoop();
                return;
            }
    
        }, 1500);
    }
    
    function gainExperience(enemy) {
      let experienceGain = enemy.type.xp || 30; // 敵のタイプに基づいて経験値を取得。ない場合はデフォルト値を使用
      playerExperience += experienceGain;
      displayMessage(`経験値を ${experienceGain} 獲得！`);
    
      if (playerExperience >= experienceToLevelUp) {
        levelUp();
      }
    }
    
    function levelUp() {
      let prevLevel = playerLevel;
      playerLevel++;
      playerExperience -= experienceToLevelUp;
    
      playerHp += 10;
      playerAttack += 2;
      playerDefense += 1;
    
      displayMessage(`レベルアップ！ 現在レベル: ${playerLevel}`);
    
      if (playerLevel % 5 === 0 && playerLevel != prevLevel) {
        spawnOgre();
      }
    
      if (enemies.length === 0) {
        displayMessage("ダンジョンクリア！次の階層へ！");
        generateDungeon();
        drawDungeon();
      }
    }
    
    function spawnOgre() {
      let ogre = createEnemy(enemyTypes.boss_ogre, playerLevel);
      let spawnPoint = getRandomFloorPosition();
      ogre.x = spawnPoint.x;
      ogre.y = spawnPoint.y;
      enemies.push(ogre);
      dungeonMap[ogre.y][ogre.x] = 'E';
      displayMessage("恐ろしいオーガが現れた！");
      drawDungeon();
    }
    
    function updateHpDisplay() {
      const experiencePercentage = Math.min(100, (playerExperience / experienceToLevelUp) * 100);
    
      playerHpDisplay.innerHTML = `
            <h2>🙂 プレイヤー</h2>
            <p>HP: ${playerHp}</p>
            <p>攻撃力: ${playerAttack}</p>
            ${equippedWeapon ? `<p>武器: ${equippedWeapon.name} (攻撃 +${equippedWeapon.attackBonus}、命中率: ${equippedWeapon.hitRate * 100}%)` : '<p>武器: なし</p>'}
            <p>防御力: ${playerDefense}</p>
            <p>回避率: ${playerEvasion * 100}%</p>
            ${equippedArmor ? `<p>鎧: ${equippedArmor.name} (防御 +${equippedArmor.defenseBonus})</p>` : '<p>鎧: なし</p>'}
            ${equippedShoes ? `<p>靴: ${equippedShoes.name} (回避率 +${equippedShoes.evasionBonus * 100}%)</p>` : '<p>靴: なし</p>'}
            <p>レベル: ${playerLevel}</p>
            <p>経験値: ${playerExperience} (${experiencePercentage.toFixed(1)}%)</p>
        `;
      const playerAccuracyDisplay = document.getElementById('player-accuracy');
      const playerEvasionDisplay = document.getElementById('player-evasion');
    
      if (playerAccuracyDisplay) {
        playerAccuracyDisplay.textContent = (playerAccuracy * 100).toFixed(1) + "%";
      }
    
      if (playerEvasionDisplay) {
        playerEvasionDisplay.textContent = (playerEvasion * 100).toFixed(1) + "%";
      }
    
      enemyHpDisplay.innerHTML = `<h2>👿 敵</h2>`;
      enemies.forEach(enemy => {
        if (enemy.hp > 0) {
          enemyHpDisplay.innerHTML += `
                    <div>
                        <h3>${enemy.name}</h3>
                        <p>HP: ${enemy.hp} / ${enemy.maxHp}</p>
                        <p>攻撃力: ${enemy.attack}</p>
                        <p>防御力: ${enemy.defense}</p>
                    </div>
                `;
        }
      });
      updateInventoryUI();
    }
    
    function createDamagePopup(target, damage, type = 'physical') {
        if (!target.element) return;
    
        const damageText = document.createElement('span');
        damageText.classList.add('damage-text');
        damageText.textContent = damage;
        damageText.style.left = target.element.offsetLeft + target.element.offsetWidth / 2 + 'px';
        damageText.style.top = target.element.offsetTop + 'px';
    
        if (type === 'fire') {
            damageText.style.color = 'orange'; // 炎ダメージ用の色
        }
    
        document.getElementById('dungeon-wrapper').appendChild(damageText);
    
        // アニメーション終了後に要素を削除
        damageText.addEventListener('animationend', () => {
            damageText.remove();
        });
    }
    
    function useScroll(scroll) {
      if (scroll.name === "テレポートの巻物") {
        let newPosition = getRandomFloorPosition();
        playerPosition.x = newPosition.x;
        playerPosition.y = newPosition.y;
        displayMessage("テレポートした！");
        removeItemFromInventory(scroll);
        drawDungeon();
        updateHpDisplay();
      }
    }
    
    function equipRing(ring) {
      if (ring.name === "守りの指輪") {
        playerDefense += ring.defenseBonus;
        displayMessage(`${ring.name} を装備した！防御力 +${ring.defenseBonus}`);
        removeItemFromInventory(ring);
        updateHpDisplay();
      }
    }
    
    function eatFood(food) {
      if (food.name === "携帯食料") {
        playerHp += food.healAmount;
        playerHp = Math.min(playerHp, 100);
        displayMessage(`${food.name} を食べて HP が ${food.healAmount} 回復した！`);
        removeItemFromInventory(food);
        updateHpDisplay();
      }
    }
    
    document.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'ArrowUp':
        case 'w':
          movePlayer(0, -1);
          break;
        case 'ArrowDown':
        case 's':
          movePlayer(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
          movePlayer(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
          movePlayer(1, 0);
          break;
      }
    });
    
    function initUI() {
      messageArea.innerHTML = '';
    }
    
    function startGameLoop() {
      gameLoopInterval = setInterval(() => {
        updateEnemyAI();
      }, 100);
    }
    
    function stopGameLoop() {
      clearInterval(gameLoopInterval);
    }
    
    function initGame() {
      initUI();
      generateDungeon();
      drawDungeon();
      updateHpDisplay();
      displayMessage("ゲーム開始！");
      startGameLoop();
      updateHpDisplay();
    }
    
    toggleStatusButton.addEventListener('click', () => {
      statusArea.classList.toggle('collapsed');
    });
    
    document.addEventListener('DOMContentLoaded', () => {
      initGame();
    });
