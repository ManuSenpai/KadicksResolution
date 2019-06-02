const NUMBER_OF_ROOMS = 20;     // Número de habitaciones
const SIZE_OF_SCENARIO = 10;    // Tamaño de escenario en bloques 

var score;
var configScoreText;
var playerStats;
var scenario;
var dungeon;
var level;
var contador;
var bifurcate;
var entrance;

var testText = {
    X: 64,
    style: {
        fontSize: 20,
        fontStyle: 'bold',
        align: 'left'
    }
}

const OKCOLOR = "#0cff00";
const NOTOKCOLOR = "#F00";

let yTestText = 64;
let bossCheck;
let keyAtStart;
let keysDeployed;
let keysAtWrongPosition;
let keyCells = [];

/** THIS CODE SERVES JUST TO TEST THE MAP GENERATION */
class mapUT extends Phaser.Scene {
    nodeList;
    constructor() {
        super({ key: "mapUT" });
    }

    init(data) {
        score = data.score;
        configScoreText = data.configScoreText;
        playerStats = data.playerStats;
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');
        let completedLevel;

        for (let testI = 0; testI < 25; testI++) {

            scenario = [];  // Full nxn map
            dungeon = [];   // The queue we will be using to create the level.
            level = [];     // The level
            contador = 0;
            for (let i = 0; i < SIZE_OF_SCENARIO; i++) {
                let row = [];
                for (let j = 0; j < SIZE_OF_SCENARIO; j++) {
                    row.push(new Scenario_Node(false, false, false, false, false, false, false, false, i, j));
                }
                scenario.push(row);
            }

            // We set the start point
            let startingX = this.getRandomNumber(2, SIZE_OF_SCENARIO - 3);
            let startingY = this.getRandomNumber(2, SIZE_OF_SCENARIO - 3);
            scenario[startingX][startingY].isStart = true;

            dungeon.push(scenario[startingX][startingY]);
            contador++;

            // Principal bucle of random generation
            while (dungeon.length > 0) {
                // We take the node outside of the queue
                let currentNode = dungeon.shift();
                level.push(currentNode)
                currentNode.visited = true;

                if (contador < NUMBER_OF_ROOMS) {
                    // The starting node will always bifurcate;
                    if (currentNode.isStart) {
                        bifurcate = 1;
                    } else {
                        bifurcate = contador < NUMBER_OF_ROOMS;
                    }

                    // Check how many bifurcations for the node
                    if (bifurcate) {
                        let maxNumberOfBifurcations = NUMBER_OF_ROOMS - contador > 3 ? 2 : NUMBER_OF_ROOMS - contador;
                        let numberOfBifurcations = currentNode.isStart ? this.getRandomNumber(2, 4) : Math.floor(Math.random() * maxNumberOfBifurcations) + 1;

                        let availableDoors = [];
                        if (!currentNode.left && currentNode.x != 0) {
                            // As we want to generate corridors, we check the proximities and randomize whether we want
                            // an adjacent room or not
                            if (this.availableByTopLeft(currentNode) && this.availableByBotLeft(currentNode)) {
                                availableDoors.push(scenario[currentNode.x - 1][currentNode.y]);
                            } else {
                                if (Math.random() >= 0.5) { availableDoors.push(scenario[currentNode.x - 1][currentNode.y]); }
                            }
                        };
                        if (!currentNode.right && currentNode.x != (SIZE_OF_SCENARIO - 1)) {
                            if (this.availableByTopRight(currentNode) && this.availableByBotRight(currentNode)) {
                                availableDoors.push(scenario[currentNode.x + 1][currentNode.y]);
                            } else {
                                if (Math.random() >= 0.5) { availableDoors.push(scenario[currentNode.x + 1][currentNode.y]); }
                            }
                        };
                        if (!currentNode.top && currentNode.y != 0) {
                            if (this.availableByTopRight(currentNode) && this.availableByTopLeft(currentNode)) {
                                availableDoors.push(scenario[currentNode.x][currentNode.y + 1]);
                            } else {
                                if (Math.random() >= 0.5) { availableDoors.push(scenario[currentNode.x][currentNode.y + 1]); }
                            }
                        };
                        if (!currentNode.bottom && currentNode.y != (SIZE_OF_SCENARIO - 1)) {
                            if (this.availableByBotRight(currentNode) && this.availableByBotLeft(currentNode)) {
                                availableDoors.push(scenario[currentNode.x][currentNode.y - 1]);
                            } else {
                                if (Math.random() >= 0.5) { availableDoors.push(scenario[currentNode.x][currentNode.y - 1]); }
                            }
                        };

                        if (numberOfBifurcations >= availableDoors.length ) {
                            if ( availableDoors.length > 0 ) {
                                availableDoors.forEach((door) => {
                                    this.pickDoor(door, currentNode);
                                    dungeon.push(door);
                                    contador++;
                                });
                            }
                        } else {
                            while (numberOfBifurcations > 0) {
                                let doorIndex = Math.floor(Math.random() * numberOfBifurcations);
                                let door = availableDoors[doorIndex];
                                if (door && currentNode) {
                                    this.pickDoor(door, currentNode);
                                    dungeon.push(door);
                                    numberOfBifurcations--;
                                    contador++;
                                    availableDoors.splice(doorIndex, 1);
                                }
                            }
                        }
                    }
                }

            }

            level[0].isClear = true;
            this.setKeyRooms(level);
            this.createBossChamber();
            this.checkLevel(level);
            this.printResults();
        }
    }

    checkLevel(level) {
        this.keysDeployed = 0;
        this.bossCheck = false;
        this.keyAtStart = false;
        this.keysAtWrongPosition = false;

        keyCells.forEach((cell) => {
            if (cell.isStart) { this.keyAtStart = true; }
            if (cell.isBoss) { this.keysAtWrongPosition = true; }
        })

        if ( level[ level.length -1 ].isBoss ) { this.bossCheck = true; }
    }

    printResults() {
        let keys3 = '3 LLAVES - OK';
        let notkeys3 = '< 3 LLAVES - NOT OK'
        let notKeyAtStartText = 'NO LLAVE EN START - OK';
        let keyAtStartText = 'LLAVE EN START - NOT OK'
        let bossLevelGenerated = 'FASE DE BOSS - OK';
        let notBossLevelGenerated = 'NO FASE DE BOSS - NOT OK';
        let keysRight = 'LLAVES - OK';
        let keysWrong = 'LLAVES - NOT OK';

        this.languageTitle = this.make.text(testText)
            .setText(keyCells.length === 3 ? keys3 : notkeys3)
            .setColor(keyCells.length === 3 ? OKCOLOR : NOTOKCOLOR)
            .setX(64)
            .setY(yTestText);
        this.languageTitle = this.make.text(testText)
            .setText(this.keyAtStart ? keyAtStartText : notKeyAtStartText)
            .setColor(this.keyAtStart ? NOTOKCOLOR : OKCOLOR)
            .setX(window.innerWidth / 4 + 64)
            .setY(yTestText);
        this.languageTitle = this.make.text(testText)
            .setText(this.bossCheck ? bossLevelGenerated : notBossLevelGenerated)
            .setColor(this.bossCheck ? OKCOLOR : NOTOKCOLOR)
            .setX(window.innerWidth / 2 + 64)
            .setY(yTestText);
        this.languageTitle = this.make.text(testText)
            .setText(this.keysAtWrongPosition ? keysWrong : keysRight)
            .setColor(this.keysAtWrongPosition ? NOTOKCOLOR : OKCOLOR)
            .setX(window.innerWidth * 3 / 4 + 64)
            .setY(yTestText);

        yTestText += 20;
    }

    setKeyRooms(level) {
        let KEYS = 0;
        keyCells = [];
        while (KEYS < 3) {
            let roomIndex = Phaser.Math.Between(1, level.length - 1);
            if (!level[roomIndex].isStart && !level[roomIndex].isKey && !level[roomIndex].isBoss) {
                level[roomIndex].isKey = true;
                KEYS++;
                keyCells.push(level[roomIndex]);
            }
        }
    }


    createBossChamber() {
        // The last chamber created will have the boss chamber attached;
        let bossChamberCreated = false;
        let index = level.length - 1;
        while (!bossChamberCreated && index > 1) {
            let room = level[index];
            if (!room.top && room.y > 0) {
                if (!scenario[room.x][room.y - 1].visited) {
                    scenario[room.x][room.y - 1].bottom = true;
                    room.top = true;
                    room.whereIsBoss = 'top';
                    this.setBossRoom(scenario[room.x][room.y - 1]);
                    bossChamberCreated = true;
                } else { index--; }
            } else if (!room.bottom && room.y < SIZE_OF_SCENARIO - 1) {
                if (!scenario[room.x][room.y + 1].visited) {
                    scenario[room.x][room.y + 1].top = true;
                    room.bottom = true;
                    room.whereIsBoss = 'bot';
                    this.setBossRoom(scenario[room.x][room.y + 1]);
                    bossChamberCreated = true;
                } else { index--; }
            } else if (!room.left && room.x > 0) {
                if (!scenario[room.x - 1][room.y].visited) {
                    scenario[room.x - 1][room.y].right = true;
                    room.left = true;
                    room.whereIsBoss = 'left';
                    this.setBossRoom(scenario[room.x - 1][room.y]);
                    bossChamberCreated = true;
                } else { index--; }
            } else if (!room.right && room.x < SIZE_OF_SCENARIO - 1) {
                if (!scenario[room.x + 1][room.y].visited) {
                    scenario[room.x + 1][room.y].left = true;
                    room.right = true;
                    room.whereIsBoss = 'right';
                    this.setBossRoom(scenario[room.x + 1][room.y]);
                    bossChamberCreated = true;
                } else { index--; }
            } else { index--; }
        }
    }

    setBossRoom(room) {
        level.push(room);
        room.visited = true;
        room.isBoss = true;
    }

    drawDoors(node) {
        var doorGraphics = this.add.graphics({ lineStyle: { width: 8, color: 0xffc260 } });
        if (node.top) {
            const topDoor = new Phaser.Geom.Line((node.x * 60) + 80, (node.y * 60) + 60, (node.x * 60) + 90, (node.y * 60) + 60);
            doorGraphics.strokeLineShape(topDoor);
        }
        if (node.bottom) {
            const botDoor = new Phaser.Geom.Line((node.x * 60) + 80, (node.y * 60) + 110, (node.x * 60) + 90, (node.y * 60) + 110);
            doorGraphics.strokeLineShape(botDoor);
        }
        if (node.left) {
            const leftDoor = new Phaser.Geom.Line((node.x * 60) + 60, (node.y * 60) + 80, (node.x * 60) + 60, (node.y * 60) + 90);
            doorGraphics.strokeLineShape(leftDoor);
        }
        if (node.right) {
            const rightDoor = new Phaser.Geom.Line((node.x * 60) + 110, (node.y * 60) + 80, (node.x * 60) + 110, (node.y * 60) + 90);
            doorGraphics.strokeLineShape(rightDoor);
        }

    }
    availableByBotLeft(currentNode) {
        if (currentNode.y === SIZE_OF_SCENARIO - 1) { return true; } else {
            return (currentNode.x === 0 || currentNode.y === 0) ? true : !scenario[currentNode.x - 1][currentNode.y - 1].visited;
        }
    }
    availableByTopLeft(currentNode) {
        if (currentNode.y === 0) { return true; } else {
            return (currentNode.x === 0 || currentNode.y === (SIZE_OF_SCENARIO - 1)) ? true : !scenario[currentNode.x - 1][currentNode.y + 1].visited;
        }
    }
    availableByTopRight(currentNode) {
        if (currentNode.y === 0) { return true; } else {
            return (currentNode.x === (SIZE_OF_SCENARIO - 1) || currentNode.y === (SIZE_OF_SCENARIO - 1)) ? true : !scenario[currentNode.x + 1][currentNode.y + 1].visited;
        }
    }
    availableByBotRight(currentNode) {
        if (currentNode.y === SIZE_OF_SCENARIO - 1) { return true; } else {
            return (currentNode.x === (SIZE_OF_SCENARIO - 1) || currentNode.y === 0) ? true : !scenario[currentNode.x + 1][currentNode.y - 1].visited;
        }
    }

    getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    pickDoor(door, currentNode) {
        if ( !door || !currentNode ) { debugger }
        if (door.x < currentNode.x) {
            currentNode.left = true;
            door.right = true;
        }
        if (door.x > currentNode.x) {
            currentNode.right = true;
            door.left = true;
        }
        if (door.y < currentNode.y) {
            currentNode.top = true;
            door.bottom = true;
        }
        if (door.y > currentNode.y) {
            currentNode.bottom = true;
            door.top = true;
        }
    }

}

class Scenario_Node {
    top = false;
    right = false;
    bottom = false;
    left = false;
    visited = false;
    isStart = false;
    isKey = false;
    isBoss = false;
    isClear = false;
    keyIsTaken = false;
    distribution = 0;
    whereIsBoss = "";
    x = 0;
    y = 0;
    constructor(top, right, bottom, left, visited, isStart, isKey, isBoss, x, y, keyIsTaken) {
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
        this.visited = visited;
        this.isStart = isStart;
        this.isKey = isKey;
        this.isBoss = isBoss;
        this.x = x;
        this.y = y;
        this.keyIsTaken = keyIsTaken;
    };
}

class Scenario {
    scenario;
    constructor(nodeList) {
        this.scenario = nodeList;
    }
}

export default mapUT;