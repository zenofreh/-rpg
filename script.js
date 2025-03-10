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
        sightRange: 5
    },
    goblin: {
        name: "ゴブリン",
        display: '🧌',
        hp: 50,
        attack: 10,
        defense: 3,
        speed: 30,
        sightRange: 8
    },
    // 新しい敵タイプを追加
    boss_ogre: {
        name: "オーガ",
        display: '👹',
        hp: 200,
        attack: 20,
        defense: 10,
        speed: 40,
        sightRange: 10
    }
};

let enemies = [];

let playerHp = 100;
let playerAttack = 10;
let playerDefense = 5;
let playerLevel = 1;
let playerExperience = 0;
const experienceToLevelUp = 100; // レベルアップに必要な経験値
let equippedWeapon = null;
let equippedArmor = null;
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
        display: '⚔️'
    },
    potion_heal: {
        name: "回復薬",
        type: "potion",
        healAmount: 30,
        display: '🧪'
    },
    bomb: {
        name: "爆弾",
        type: "consumable",
        display: '💣',
        damage: 50
    },
    armor_leather: {
        name: "革の鎧",
        type: "armor",
        defenseBonus: 3,
        display: '🛡️'
    }
};

let itemPositions = [
    { x: 5, y: 5, type: 'weapon_sword' },
    { x: 15, y: 10, type: 'potion_heal' },
    { x: 8, y: 12, type: 'bomb' },
    { x: 12, y: 5, type: 'armor_leather' }
];

function generateDungeon() {
    dungeonMap = [];
    enemies = [];

    // 壁で初期化
    for (let y = 0; y < dungeonHeight; y++) {
        dungeonMap[y] = [];
        for (let x = 0; x < dungeonWidth; x++) {
            dungeonMap[y][x] = '#';
        }
    }

    // 部屋を生成
    const roomCount = 4; // 部屋数
    for (let i = 0; i < roomCount; i++) {
        createRoom();
    }

    // 通路を生成（簡単な方法：部屋同士を繋ぐ）
    connectRooms();

    // プレイヤーの初期位置
    playerPosition = findValidSpawnPoint();
    dungeonMap[playerPosition.y][playerPosition.x] = '.';

    // 敵を配置
    let enemyCount = 5;

    for (let i = 0; i < enemyCount; i++) {
        let enemyTypeKeys = Object.keys(enemyTypes).filter(key => key !== 'boss_ogre'); // オーガ以外の敵を選択
        let randomEnemyTypeKey = enemyTypeKeys[Math.floor(Math.random() * enemyTypeKeys.length)];
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
        if (dungeonMap[itemPos.y][itemPos.x] !== itemPos.type) {
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
        let ogreModifier = playerLevel / 5; // 5レベルごとに倍増

        hp = Math.floor(enemyType.hp * ogrehpModifier);
        attack = Math.floor(enemyType.attack * ogreModifier);
        defense = Math.floor(enemyType.defense * ogreModifier);
        speed = Math.floor(enemyType.speed * ogreModifier);
    } else {
        // 他の敵はすべてのステータスがレベルに応じて上昇
        let levelModifier = 1 + (playerLevel * 0.5); // 1レベルあたり50%上昇
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

        if (cellType === 'weapon_sword' || cellType === 'potion_heal' || cellType === 'bomb' || cellType === 'armor_leather') {
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

    // インベントリをフィルタリングして、装備中のアイテムを除外
    const filteredInventory = inventory.filter(item => {
        if (item.type === 'weapon' && equippedWeapon === item) return false;
        if (item.type === 'armor' && equippedArmor === item) return false;
        return true;
    });

    filteredInventory.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.name} (${item.display})`;
        listItem.addEventListener('click', () => {
            useItem(item);
        });
        inventoryItemsList.appendChild(listItem);
    });
}

function useItem(item) {
    if (item.type === 'potion') {
        playerHp += item.healAmount;
        playerHp = Math.min(playerHp, 100);
        updateHpDisplay();
        removeItemFromInventory(item);
        displayMessage(`${item.name} を使って HP が ${item.healAmount} 回復した！`);
    } else if (item.type === 'weapon') {
        equipWeapon(item);
    } else if (item.type === 'consumable') {
        useConsumable(item);
    } else if (item.type === 'armor') {
        equipArmor(item);
    }
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
    inventory = inventory.filter(item => item !== itemToRemove);
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
        default:
            break;
    }

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
    messageArea.setAttribute('aria-label', message); // スクリーンリーダー向けにメッセージを設定
}

function startBattle(enemy) {
    if (isFighting) return;
    isFighting = true;
    displayMessage(`${enemy.name} との戦闘開始！`);

    let battleInterval = setInterval(() => {
        // プレイヤーの攻撃
        let damageToEnemy = Math.max(playerAttack - enemy.defense, 1); // 修正: enemy.type.defense -> enemy.defense
        const hitRoll = Math.random(); // 0-1
        if (hitRoll < 0.8) { //80% hit chance for now
            enemy.hp -= damageToEnemy;
            enemy.hp = Math.max(0, enemy.hp);
            displayMessage(`プレイヤーの攻撃！ ${enemy.name} に ${damageToEnemy} ダメージ！ (残りHP: ${enemy.hp})`, 'player');
        } else {
            displayMessage("プレイヤーの攻撃！ " + enemy.name + " は攻撃を回避した！", 'miss');
        }
        updateHpDisplay();

        if (enemy.hp <= 0) {
            clearInterval(battleInterval);
            displayMessage(`${enemy.name} を倒した！`);

            enemies = enemies.filter(e => e !== enemy);
            dungeonMap[enemy.y][enemy.x] = '.';
            drawDungeon();
            
            // 経験値の追加
            gainExperience(enemy);

            updateHpDisplay();

             // 敵が全滅しているかチェック
             if (enemies.length === 0) {
                displayMessage("ダンジョンクリア！次の階層へ！");
                generateDungeon(); // 新しいダンジョンを生成
                drawDungeon();
            }
            isFighting = false;
            return;
        }

        // 敵の攻撃
        let damageToPlayer = Math.max(enemy.attack - playerDefense, 1); // 修正: enemy.type.attack -> enemy.attack
        const enemyHitRoll = Math.random();
        if (enemyHitRoll < 0.7) { //70% hit chance
            playerHp -= damageToPlayer;
            playerHp = Math.max(0, playerHp);
            displayMessage(`敵の攻撃！ プレイヤーに ${damageToPlayer} ダメージ！ (残りHP: ${playerHp})`, 'enemy');
        } else {
            displayMessage(enemy.name + " の攻撃！プレイヤーは攻撃を回避した！", 'miss');
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
        ${equippedWeapon ? `<p>武器: ${equippedWeapon.name} (攻撃 +${equippedWeapon.attackBonus})</p>` : '<p>武器: なし</p>'}
        <p>防御力: ${playerDefense}</p>
        ${equippedArmor ? `<p>鎧: ${equippedArmor.name} (防御 +${equippedArmor.defenseBonus})</p>` : '<p>鎧: なし</p>'}
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
                    <p>HP: ${enemy.hp} / ${enemy.maxHp}</p> <!-- 修正: enemy.type.hp -> enemy.maxHp -->
                    <p>攻撃力: ${enemy.attack}</p> <!-- 修正: enemy.type.attack -> enemy.attack -->
                    <p>防御力: ${enemy.defense}</p> <!-- 修正: enemy.type.defense -> enemy.defense -->
                </div>
            `;
        }
    });
    updateInventoryUI();
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
}

toggleStatusButton.addEventListener('click', () => {
    statusArea.classList.toggle('collapsed');
});

document.addEventListener('DOMContentLoaded', () => {
    initGame();
});
