const dungeonContainer = document.getElementById('dungeon');
const playerHpDisplay = document.getElementById('player-info');
const enemyHpDisplay = document.getElementById('enemy-info');
const messageArea = document.getElementById('message-area');
const toggleStatusButton = document.getElementById('toggle-status');
const statusArea = document.getElementById('status-area');

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
        minLevel: 1
    },
    goblin: {
        name: "ゴブリン",
        display: '🧌',
        hp: 50,
        attack: 10,
        defense: 3,
        speed: 30,
        sightRange: 8,
        minLevel: 1
    },
    wolf: {
        name: "ウルフ",
        display: '🐺',
        hp: 60,
        attack: 12,
        defense: 2,
        speed: 40,
        sightRange: 10,
        minLevel: 3
    },
    skeleton: {
        name: "スケルトン",
        display: '💀',
        hp: 80,
        attack: 15,
        defense: 5,
        speed: 25,
        sightRange: 7,
        minLevel: 4
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
        minLevel: 5
    },
    orc: {
        name: "オーク",
        display: '👹',
        hp: 100,
        attack: 18,
        defense: 7,
        speed: 30,
        sightRange: 8,
        minLevel: 6
    },
    golem: {
        name: "ゴーレム",
        display: '🗿',
        hp: 150,
        attack: 20,
        defense: 10,
        speed: 15,
        sightRange: 6,
        minLevel: 8
    },
    wraith: {
        name: "レイス",
        display: '👻',
        hp: 90,
        attack: 22,
        defense: 4,
        speed: 40,
        sightRange: 12,
        minLevel: 9
    },
    minotaur: {
        name: "ミノタウロス",
        display: '🐂',
        hp: 180,
        attack: 25,
        defense: 12,
        speed: 35,
        sightRange: 10,
        minLevel: 10
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
        minLevel: 12
    },
    // ボス
    boss_ogre: {
        name: "オーガ",
        display: '👹',
        hp: 200,
        attack: 20,
        defense: 10,
        speed: 40,
        sightRange: 10,
        minLevel: 5 // オーガの最低レベル
    }
};

let enemies = [];

let playerHp = 100;
let playerAttack = 10;
let playerDefense = 5;
let playerEvasion = 0.05; // 初期回避率
let playerLevel = 1;
let playerExperience = 0;
const experienceToLevelUp = 100; // レベルアップに必要な経験値
let equippedWeapon = null;
let equippedArmor = null;
let equippedShoes = null; // 装備中の靴
let inventory = [];
let isFighting = false;
let gameLoopInterval;

const inventoryContainer = document.getElementById('inventory');
const inventoryItemsList = document.getElementById('inventory-items');

const items = {
    weapon_sword: {
        name: "鉄の剣",
        type: "weapon",
        attackBonus: 5,
        hitRate: 0.8, // 命中率
        display: '⚔️',
        rarity: 2,
        minLevel: 3
    },
    weapon_dagger: {
        name: "短剣",
        type: "weapon",
        attackBonus: 3,
        hitRate: 0.9, // 高い命中率
        display: '🗡️',
        rarity: 2,
        minLevel: 2
    },
    weapon_lance: {
        name: "ランス",
        type: "weapon",
        attackBonus: 7,
        hitRate: 0.7, // やや低い命中率
        display: '🪖',
        rarity: 3,
        minLevel: 5
    },
    weapon_axe: {
        name: "戦斧",
        type: "weapon",
        attackBonus: 9,
        hitRate: 0.6, // 低い命中率
        display: '🪓',
        rarity: 4,
        minLevel: 7
    },
    weapon_rare_katana: {
        name: "妖刀",
        type: "weapon",
        attackBonus: 10,
        hitRate: 0.85, // 高い命中率
        display: '🔪',
        description: "攻撃力が高い",
        rarity: 5,
        minLevel: 8,
        fireDamage: 5 // 火炎属性ダメージ
    },
    weapon_wand: {
        name: "魔法の杖",
        type: "weapon",
        attackBonus: 4,
        hitRate: 0.95, // 非常に高い命中率
        display: '🪄',
        rarity: 3,
        minLevel: 4,
        poisonDamage: 3 // 毒属性ダメージ
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
        evasionBonus: 0.1, // 回避率ボーナス
        display: '👞',
        rarity: 2,
        minLevel: 2
    },
    shoes_boots: {
        name: "ブーツ",
        type: "shoes",
        evasionBonus: 0.15, // より高い回避率ボーナス
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

let itemPositions = [
    { x: 5, y: 5, type: 'weapon_sword' },
    { x: 15, y: 10, type: 'potion_heal' },
    { x: 8, y: 12, type: 'bomb' },
    { x: 12, y: 5, type: 'armor_leather' },
    { x: 3, y: 7, type: 'scroll_teleport' },
    { x: 18, y: 3, type: 'ring_protection' },
    { x: 10, y: 8, type: 'food_ration' },
    { x: 6, y: 14, type: 'weapon_dagger' },
    { x: 14, y: 2, type: 'armor_shield' },
    { x: 2, y: 4, type: 'weapon_lance' },
    { x: 16, y: 12, type: 'weapon_axe' },
    { x: 9, y: 3, type: 'weapon_wand' },
    { x: 1, y: 13, type: 'weapon_bow' },
    { x: 17, y: 7, type: 'shoes_leather' },
    { x: 4, y: 9, type: 'shoes_boots' }
];

function generateDungeon() {
    dungeonMap = [];
    for (let y = 0; y < dungeonHeight; y++) {
        dungeonMap[y] = Array(dungeonWidth).fill('#');
    }

    let rooms = [];

    function splitSpace(x, y, width, height) {
        if (width < 5 || height < 5) {
            // 最小サイズに達したら部屋を作成
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

    // 部屋を描画
    rooms.forEach(room => {
        for (let y = room.y; y < room.y + room.height; y++) {
            for (let x = room.x; x < room.x + room.width; x++) {
                dungeonMap[y][x] = '.';
            }
        }
    });

    // 部屋を接続 (簡単な方法: 最も近い部屋と繋ぐ)
    for (let i = 0; i < rooms.length - 1; i++) {
        connectTwoPoints({x: Math.floor(rooms[i].x + rooms[i].width / 2), y: Math.floor(rooms[i].y + rooms[i].height / 2)},
                         {x: Math.floor(rooms[i+1].x + rooms[i+1].width / 2), y: Math.floor(rooms[i+1].y + rooms[i+1].height / 2)});
    }


    // プレイヤーの初期位置
    playerPosition = findValidSpawnPoint();
    dungeonMap[playerPosition.y][playerPosition.x] = '.';

    // 敵を配置
    let enemyCount = 5;

    for (let i = 0; i < enemyCount; i++) {
        // 出現可能な敵のタイプをフィルタリング
        let possibleEnemyTypes = Object.entries(enemyTypes)
            .filter(([key, enemyType]) => enemyType.minLevel <= playerLevel && key !== 'boss_ogre')
            .map(([key, enemyType]) => key);

        // 選択可能な敵がいなければ、スライムを生成
        if (possibleEnemyTypes.length === 0) {
            possibleEnemyTypes = ['slime'];
        }

        // ランダムに敵を選択
        let randomEnemyTypeKey = possibleEnemyTypes[Math.floor(Math.random() * possibleEnemyTypes.length)];
        let enemyType = enemyTypes[randomEnemyTypeKey];
        let enemy = createEnemy(enemyType, playerLevel);

        let spawnPoint = getRandomFloorPosition();
        enemy.x = spawnPoint.x;
        enemy.y = spawnPoint.y;
        enemies.push(enemy);
        dungeonMap[enemy.y][enemy.x] = 'E';
    }

    // アイテムを配置
    itemPositions.forEach(itemPos => {
        if (dungeonMap[itemPos.y][itemPos.x] === '.') {
            dungeonMap[itemPos.y][itemPos.x] = itemPos.type;
        }
    });

    itemPositions.forEach(itemPos => {
        if (dungeonMap[itemPos.y][itemPos.y] !== itemPos.type) {
            dungeonMap[itemPos.y][itemPos.y] = '.';
        }
    });
}

function createRoom() {
    const roomWidth = Math.floor(Math.random() * 6) + 4; // 4-9
    const roomHeight = Math.floor(Math.random() * 6) + 4; // 4-9
    const roomX = Math.floor(Math.random() * (dungeonWidth - roomWidth - 1)) + 1;
    const roomY = Math.floor(Math.random() * (dungeonHeight - roomHeight - 1)) + 1;

    for (let y = roomY; y < roomY + roomHeight; y++) {
        for (let x = roomX; x < roomX + roomWidth; x++) {
            dungeonMap[y][x] = '.';
        }
    }
}

function connectRooms() {
    // 簡単な接続：すべての部屋の中心点を計算し、それらを直線で繋ぐ
    const roomCenters = [];
    for (let y = 0; y < dungeonHeight; y++) {
        for (let x = 0; x < dungeonWidth; x++) {
            if (dungeonMap[y][x] === '.') {
                // 部屋の中心を探す（かなり大雑把）
                let roomX = x, roomY = y;
                while (x < dungeonWidth && dungeonMap[y][x] === '.') x++;
                while (y < dungeonHeight && dungeonMap[y][x] === '.') y++;
                roomCenters.push({ x: Math.floor((x + roomX) / 2), y: Math.floor((y+roomY) / 2) });
            }
        }
    }

    // 最初の部屋から順番に繋ぐ
    for (let i = 0; i < roomCenters.length - 1; i++) {
        connectTwoPoints(roomCenters[i], roomCenters[i + 1]);
    }
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
    dungeonMap[y][x] = '.'; // 最後の点
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
    // プレイヤーのレベルに応じて敵のステータスを調整
    let hp = enemyType.hp;
    let attack = enemyType.attack;
    let defense = enemyType.defense;
    let speed = enemyType.speed;

    if (enemyType.name === enemyTypes.boss_ogre.name) {
        // オーガのステータスをプレイヤーレベルを5で割った数倍にする
        let ogrehpModifier = playerLevel / 5; // 5レベルごとに倍増
        let ogreModifier = 0.5 + playerLevel / 10; // 5レベルごとに倍増

        hp = Math.floor(enemyType.hp * ogrehpModifier);
        attack = Math.floor(enemyType.attack * ogreModifier);
        defense = Math.floor(enemyType.defense * ogreModifier);
        speed = Math.floor(enemyType.speed * ogreModifier);
    } else {
        // 他の敵はすべてのステータスがレベルに応じて上昇
        let levelModifier = 1 + (playerLevel * 0.2); // 1レベルあたり50%上昇
        let levelhpModifier = 1 + (playerLevel * 0.2); // 1レベルあたり20%上昇

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
        x: 0,
        y: 0,
        isAggro: false,
        moveTimer: 0
    };
}

function drawDungeon() {
    dungeonContainer.innerHTML = '';
    dungeonContainer.style.gridTemplateColumns = `repeat(${dungeonWidth}, 1fr)`;

    for (let y = 0; y < dungeonHeight; y++) {
        for (let x = 0; x < dungeonWidth; x++) {
            const cell = createDungeonCell(x, y);

            const enemyAtCell = enemies.find(enemy => enemy.x === x && enemy.y === y);
            if (enemyAtCell) {
                cell.classList.add('enemy');
                cell.textContent = '';
                cell.innerHTML = enemyAtCell.type.display;
            }

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
        case 'weapon_sword': cell.classList.add('item-weapon'); break;
        case 'potion_heal': cell.classList.add('item-potion'); break;
        case 'bomb': cell.classList.add('item-bomb'); break;
        case 'armor_leather': cell.classList.add('item-armor'); break;
        case 'scroll_teleport': cell.classList.add('item-scroll'); break;
        case 'ring_protection': cell.classList.add('item-ring'); break;
        case 'food_ration': cell.classList.add('item-food'); break;
        case 'weapon_dagger': cell.classList.add('item-weapon'); break;
        case 'armor_shield': cell.classList.add('item-armor'); break;
        case 'weapon_lance': cell.classList.add('item-weapon'); break;
        case 'weapon_axe': cell.classList.add('item-weapon'); break;
        case 'weapon_wand': cell.classList.add('item-weapon'); break;
        case 'weapon_bow': cell.classList.add('item-weapon'); break;
        case 'shoes_leather': cell.classList.add('item-shoes'); break;
        case 'shoes_boots': cell.classList.add('item-shoes'); break;
        default: cell.classList.add('floor'); break;
    }

    if (playerPosition.x === x && playerPosition.y === y) {
        cell.classList.add('player');
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
        const itemType = Object.keys(items).find(key => key === cellType); // アイテムタイプのキーを取得

        if (itemType) {
            getItem(itemType);
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

     // 敵が全滅しているかチェック
     if (enemies.length === 0) {
        displayMessage("ダンジョンクリア！次の階層へ！");
        generateDungeon(); // 新しいダンジョンを生成
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

            }
        } else {
            chasePlayer(enemy);
        }
    });
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

    const newX = enemy.x + moveX;
    const newY = enemy.y + moveY;

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


function getItem(itemType) {
    const item = items[itemType];
    if (item) {
        inventory.push(item);
        updateInventoryUI();
        displayMessage(`${item.name} を手に入れた！`);
    }
}

function updateInventoryUI() {
    const inventoryItemsList = document.getElementById('inventory-items');
    if (!inventoryItemsList) return;
    inventoryItemsList.innerHTML = '';

    // インベントリ内のアイテムを種類ごとに集計
    const itemCounts = {};
    inventory.forEach(item => {
        if (itemCounts[item.name]) {
            itemCounts[item.name].count++;
        } else {
            itemCounts[item.name] = { item: item, count: 1 };
        }
    });

    // インベントリをフィルタリングして、装備中のアイテムを除外
    const filteredInventory = inventory.filter(item => {
        if (item.type === 'weapon' && equippedWeapon === item) return false;
        if (item.type === 'armor' && equippedArmor === item) return false;
        if (item.type === 'shoes' && equippedShoes === item) return false;
        return true;
    });

    // 集計されたアイテムを表示
    filteredInventory.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.name} (${item.display}) x${itemCounts[item.name].count}`; // アイテム名と個数を表示
        listItem.addEventListener('click', () => {
            useItem(item);
        });
        inventoryItemsList.appendChild(listItem);

        // アイテムを使用するボタン
        const useButton = document.createElement('button');
        useButton.textContent = '使う';
        useButton.addEventListener('click', () => {
            useItem(item);
        });

        // アイテムを捨てるボタン
        const dropButton = document.createElement('button');
        dropButton.textContent = '捨てる';
        dropButton.addEventListener('click', () => {
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
        inventory.splice(index, 1); // インベントリから1つ削除
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
        inventory.splice(index, 1); // インベントリから1つ削除
    }

    // 装備中の靴を外した場合、回避率を戻す
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
    }
    equippedWeapon = weapon;
    playerAttack += equippedWeapon.attackBonus;
    updateHpDisplay();
    updateInventoryUI();
    displayMessage(`${weapon.name} を装備した！ 攻撃力 +${weapon.attackBonus}`);
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
    if (item.name === "爆弾") { // アイテムの種類で条件分岐
        // 爆弾を使用
        displayMessage("爆弾を使った！");

        // 爆弾の効果範囲（例：周囲1マス）
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const targetX = playerPosition.x + dx;
                const targetY = playerPosition.y + dy;

                // ダンジョン範囲内か確認
                if (targetX >= 0 && targetX < dungeonWidth && targetY >= 0 && targetY < dungeonHeight) {
                    // 敵がいるか確認
                    const enemy = enemies.find(e => e.x === targetX && e.y === targetY);
                    if (enemy) {
                        // 敵にダメージ
                        const damage = item.damage;
                        enemy.hp -= damage;
                        displayMessage(`${enemy.name} に ${damage} ダメージ！`, 'critical');

                        // 敵が死亡した場合
                        if (enemy.hp <= 0) {
                            displayMessage(`${enemy.name} を倒した！`);
                            dungeonMap[enemy.y][enemy.x] = '.';
                            enemies = enemies.filter(e => e !== enemy);
                            gainExperience(enemy);
                        }
                    }
                    // 壁を破壊
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

         // 敵が全滅しているかチェック
        if (enemies.length === 0) {
            displayMessage("ダンジョンクリア！次の階層へ！");
            generateDungeon(); // 新しいダンジョンを生成
            drawDungeon();
        }
    }
}

function removeItemFromInventory(itemToRemove) {
    const index = inventory.findIndex(item => item === itemToRemove);
    if (index > -1) {
        inventory.splice(index, 1); // インベントリから1つ削除
    }

    // 装備中の靴を外した場合、回避率を戻す
    if (equippedShoes === itemToRemove) {
        playerEvasion -= equippedShoes.evasionBonus;
        equippedShoes = null;
        updateHpDisplay();
    }

    updateInventoryUI();
}

// メッセージを表示 (アクセシビリティ対応)
function displayMessage(message, type = 'normal') {
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageElement.classList.add('message');

    // メッセージタイプに基づいてスタイルを適用
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
        case 'item': // アイテム関連のメッセージ
            messageElement.classList.add('item-message');
            break;
        case 'levelUp': // レベルアップのメッセージ
            messageElement.classList.add('level-up-message');
            break;
        default:
            break;
    }

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
    messageArea.setAttribute('aria-label', message); // スクリーンリーダー向けにメッセージを設定
}


function dropItem(enemy) {
    const dropRate = 0.2; // 基本ドロップ率 (20%)

    if (Math.random() < dropRate) {
        // ドロップする可能性のあるアイテムをフィルタリング
        const possibleDrops = Object.values(items).filter(item => item.minLevel <= playerLevel);

        if (possibleDrops.length > 0) {
            // レアリティに基づいてドロップ率を調整
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
                // アイテムをドロップ
                dungeonMap[enemy.y][enemy.x] = Object.keys(items).find(key => items[key] === droppedItem);
                displayMessage(`${enemy.name} は ${droppedItem.name} をドロップした！`);
                drawDungeon();
            }
        }
    }
}

function startBattle(enemy) {
    if (isFighting) return;
    isFighting = true;
    displayMessage(`${enemy.name} との戦闘開始！`);

    let battleInterval = setInterval(() => {
        // プレイヤーの攻撃
        let damageToEnemy = Math.max(playerAttack - enemy.defense, 1);
        let hitRoll = Math.random();

        // 武器の命中率を考慮
        let weaponHitRate = equippedWeapon ? equippedWeapon.hitRate : 0.7; // デフォルトの命中率
        if (hitRoll < weaponHitRate) {
            // 命中
            enemy.hp -= damageToEnemy;
            enemy.hp = Math.max(0, enemy.hp);

            // 武器の属性ダメージ
            let elementalDamage = 0;
            if (equippedWeapon && equippedWeapon.fireDamage) {
                elementalDamage += equippedWeapon.fireDamage;
            }
            if (equippedWeapon && equippedWeapon.poisonDamage) {
                elementalDamage += equippedWeapon.poisonDamage;
            }
            enemy.hp -= elementalDamage;
            enemy.hp = Math.max(0, enemy.hp);

            displayMessage(`プレイヤーの攻撃！ ${enemy.name} に ${damageToEnemy} ダメージ！ (残りHP: ${enemy.hp})`, 'player');
            if (elementalDamage > 0) {
                displayMessage(`属性ダメージ！${enemy.name} に ${elementalDamage} ダメージ！ (残りHP: ${enemy.hp})`, 'critical');
            }
        } else {
            displayMessage("プレイヤーの攻撃！ " + enemy.name + " は攻撃を回避した！", 'miss');
        }
        updateHpDisplay();

        if (enemy.hp <= 0) {
            clearInterval(battleInterval);
            displayMessage(`${enemy.name} を倒した！`);

            // 敵を倒した際にアイテムをドロップ
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
        let damageToPlayer = Math.max(enemy.attack - playerDefense, 1);
        let enemyHitRoll = Math.random();

        // プレイヤーの回避率を考慮
        if (enemyHitRoll > playerEvasion) {
            // 命中
            playerHp -= damageToPlayer;
            playerHp = Math.max(0, playerHp);

            // 敵の属性攻撃
            let enemyElementalDamage = 0;
            if (enemy.type.fireAttack) {
                enemyElementalDamage += enemy.type.fireAttack;
            }
            if (enemy.type.poisonAttack) {
                enemyElementalDamage += enemy.type.poisonAttack;
            }
             playerHp -= enemyElementalDamage;
            playerHp = Math.max(0, playerHp);

            displayMessage(`敵の攻撃！ プレイヤーに ${damageToPlayer} ダメージ！ (残りHP: ${playerHp})`, 'enemy');
            if (enemyElementalDamage > 0) {
                displayMessage(`属性ダメージ！プレイヤーは ${enemyElementalDamage} ダメージを受けた！ (残りHP: ${playerHp})`, 'critical');
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
    // 敵の種類によって経験値を調整
    let experienceGain = 0;
    switch (enemy.type) {
        case enemyTypes.slime:
            experienceGain = 20;
            break;
        case enemyTypes.goblin:
            experienceGain = 50;
            break;
        case enemyTypes.boss_ogre:
            experienceGain = 100;
            break;
        default:
            experienceGain = 30; // デフォルトの経験値
            break;
    }

    playerExperience += experienceGain;
    displayMessage(`経験値を ${experienceGain} 獲得！`);

    // レベルアップ判定
    if (playerExperience >= experienceToLevelUp) {
        levelUp();
    }
}

function levelUp() {
    let prevLevel = playerLevel;
    playerLevel++;
    playerExperience -= experienceToLevelUp;

    // ステータスアップ
    playerHp += 10;
    playerAttack += 2;
    playerDefense += 1;

    displayMessage(`レベルアップ！ 現在レベル: ${playerLevel}`);

    // 5の倍数のレベルの時だけオーガを出現させる
    if (playerLevel % 5 === 0 && playerLevel != prevLevel) {
      spawnOgre();
    }

    if (enemies.length === 0) {
        displayMessage("ダンジョンクリア！次の階層へ！");
        generateDungeon(); // 新しいダンジョンを生成
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
        ${equippedWeapon && equippedWeapon.fireDamage ? `<p>火炎属性ダメージ: +${equippedWeapon.fireDamage}</p>` : ''}
        ${equippedWeapon && equippedWeapon.poisonDamage ? `<p>毒属性ダメージ: +${equippedWeapon.poisonDamage}</p>` : ''}
        <p>防御力: ${playerDefense}</p>
        <p>回避率: ${playerEvasion * 100}%</p>
        ${equippedArmor ? `<p>鎧: ${equippedArmor.name} (防御 +${equippedArmor.defenseBonus})</p>` : '<p>鎧: なし</p>'}
        ${equippedShoes ? `<p>靴: ${equippedShoes.name} (回避率 +${equippedShoes.evasionBonus * 100}%)</p>` : '<p>靴: なし</p>'}
        <p>レベル: ${playerLevel}</p>
        <p>経験値: ${playerExperience} (${experiencePercentage.toFixed(1)}%)</p>
        <div id="inventory">
            <h2>インベントリ</h2>
            <ul id="inventory-items"></ul>
        </div>
    `;

    enemyHpDisplay.innerHTML = `<h2>👿 敵</h2>`;
    enemies.forEach(enemy => {
        if (enemy.hp > 0) {
            enemyHpDisplay.innerHTML += `
                <div>
                    <h3>${enemy.name}</h3>
                    <p>HP: ${enemy.hp} / ${enemy.maxHp}</p>
                    <p>攻撃力: ${enemy.attack}</p>
                    <p>防御力: ${enemy.defense}</p>
                    ${enemy.type.fireAttack ? `<p>火炎属性ダメージ: +${enemy.type.fireAttack}</p>` : ''}
                    ${enemy.type.poisonAttack ? `<p>毒属性ダメージ: +${enemy.type.poisonAttack}</p>` : ''}
                </div>
            `;
        }
    });
    updateInventoryUI();
}

function useScroll(scroll) {
    if (scroll.name === "テレポートの巻物") {
        // ランダムな床を見つける
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
    // 守りの指輪を装備
    if (ring.name === "守りの指輪") {
        playerDefense += ring.defenseBonus;
        displayMessage(`${ring.name} を装備した！防御力 +${ring.defenseBonus}`);
        removeItemFromInventory(ring);
        updateHpDisplay();
    }
}

function eatFood(food) {
    // 携帯食料を食べる
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
    updateHpDisplay(); // 回避率を表示
}

toggleStatusButton.addEventListener('click', () => {
    statusArea.classList.toggle('collapsed');
});

document.addEventListener('DOMContentLoaded', () => {
    initGame();
});
