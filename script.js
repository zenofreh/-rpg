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
    }
};

let itemPositions = [
    { x: 5, y: 5, type: 'weapon_sword' },
    { x: 15, y: 10, type: 'potion_heal' }
];

function generateDungeon() {
    dungeonMap = [];
    enemies = [];

    for (let y = 0; y < dungeonHeight; y++) {
        dungeonMap[y] = [];
        for (let x = 0; x < dungeonWidth; x++) {
            if (x === 0 || x === dungeonWidth - 1 || y === 0 || y === dungeonHeight - 1 || (Math.random() < 0.2 && (x % 2 !== 0 || y % 2 !== 0))) {
                dungeonMap[y][x] = '#';
            } else {
                dungeonMap[y][x] = '.';
            }
        }
    }
    itemPositions.forEach(itemPos => {
        if (dungeonMap[itemPos.y][itemPos.x] === '.') {
            dungeonMap[itemPos.y][itemPos.x] = itemPos.type;
        }
    });
    dungeonMap[playerPosition.y][playerPosition.x] = '.';

    for (let i = 0; i < 5; i++) {
        let enemyTypeKeys = Object.keys(enemyTypes);
        let randomEnemyTypeKey = enemyTypeKeys[Math.floor(Math.random() * enemyTypeKeys.length)];
        let enemyType = enemyTypes[randomEnemyTypeKey];

        let enemy = createEnemy(enemyType);

        let spawnPoint = getRandomFloorPosition();
        enemy.x = spawnPoint.x;
        enemy.y = spawnPoint.y;
        enemies.push(enemy);
        dungeonMap[enemy.y][enemy.x] = 'E';
    }


    itemPositions.forEach(itemPos => {
        if (dungeonMap[itemPos.y][itemPos.x] !== itemPos.type) {
            dungeonMap[itemPos.y][itemPos.x] = '.';
        }
    });
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


function createEnemy(enemyType) {
    return {
        type: enemyType,
        name: enemyType.name,
        display: enemyType.display,
        hp: enemyType.hp,
        maxHp: enemyType.hp,
        attack: enemyType.attack,
        defense: enemyType.defense,
        speed: enemyType.speed,
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

        if (cellType === 'weapon_sword' || cellType === 'potion_heal') {
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
    inventory.forEach(item => {
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
        let damageToEnemy = Math.max(playerAttack - enemy.type.defense, 1);
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
            isFighting = false;
            return;
        }

        // 敵の攻撃
        let damageToPlayer = Math.max(enemy.type.attack - playerDefense, 1);
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
    playerLevel++;
    playerExperience -= experienceToLevelUp;

    // ステータスアップ
    playerHp += 10;
    playerAttack += 2;
    playerDefense += 1;

    displayMessage(`レベルアップ！ 現在レベル: ${playerLevel}`);
}

function updateHpDisplay() {
    const experiencePercentage = Math.min(100, (playerExperience / experienceToLevelUp) * 100);

    playerHpDisplay.innerHTML = `
        <h2>🙂 プレイヤー</h2>
        <p>HP: ${playerHp}</p>
        <p>攻撃力: ${playerAttack}</p>
        <p>防御力: ${playerDefense}</p>
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
                    <p>HP: ${enemy.hp} / ${enemy.type.hp}</p>
                    <p>攻撃力: ${enemy.type.attack}</p>
                    <p>防御力: ${enemy.type.defense}</p>
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
