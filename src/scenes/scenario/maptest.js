const NUMBER_OF_ROOMS = 20;     // Maximum number of rooms
const SIZE_OF_SCENARIO = 10;

var score;
var configScoreText;
var playerStats;
var scenario;
var dungeon;
var level;
var contador;
var bifurcate;
var entrance;
class map_test extends Phaser.Scene {
    nodeList;
    constructor() {
        super({ key: "map_test" });
    }

    init(data) {
        score = data.score;
        configScoreText = data.configScoreText;
        playerStats = data.playerStats;
    }

    create() {
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

        // Setting start point
        let startingX = this.getRandomNumber(2, SIZE_OF_SCENARIO - 3);
        let startingY = this.getRandomNumber(2, SIZE_OF_SCENARIO - 3);
        scenario[startingX][startingY].isStart = true;

        dungeon.push(scenario[startingX][startingY]);
        contador++;

        // Principal bucle of random generation
        while (dungeon.length > 0) {
            // Take node outside of the queue
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

                // Check number of bifurcationss for the node
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

                    if (numberOfBifurcations >= availableDoors.length) {
                        if (availableDoors.length > 0) {
                            availableDoors.forEach((door) => {
                                if (door && currentNode) {
                                    this.pickDoor(door, currentNode);
                                    dungeon.push(door);
                                    contador++;
                                }
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

        var graphics = this.add.graphics({ lineStyle: { width: 2, color: 0x0000aa } });
        var rect = new Phaser.Geom.Rectangle(25, 25, 50, 50);
        level[0].isClear = true;
        this.setKeyRooms(level);
        this.createBossChamber();
        playerStats.LEVEL++;
        playerStats.KEYCODES = 0;
        this.scene.start("Level" + playerStats.LEVEL, {
            score: score, configScoreText: configScoreText, playerStats: playerStats, scenario: scenario,
            currentPosition: level[0], entrance: 'center'
        });
    }

    /**
     * Sets random position of keys on level
     * @param {Array} level Filled level array of nodes. 
     */
    setKeyRooms(level) {
        let KEYS = 0;
        while (KEYS < 3) {
            let roomIndex = Phaser.Math.Between(1, level.length - 1);
            if (!level[roomIndex].isStart && !level[roomIndex].isKey && !level[roomIndex].isBoss) {
                level[roomIndex].isKey = true;
                KEYS++;
            }
        }
    }

    /** Generates Boss chamber */
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

    /** Sets boss room ready */
    setBossRoom(room) {
        level.push(room);
        room.visited = true;
        room.isBoss = true;
    }

    /** Draws door between rooms */
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

    /**
     * Checks if the bottom left node is available
     * @param {Node} currentNode Node that is being evaluated 
     */
    availableByBotLeft(currentNode) {
        if (currentNode.y === SIZE_OF_SCENARIO - 1) { return true; } else {
            return (currentNode.x === 0 || currentNode.y === 0) ? true : !scenario[currentNode.x - 1][currentNode.y - 1].visited;
        }
    }

    /**
     * Checks if the top left node is available
     * @param {Node} currentNode Node that is being evaluated 
     */
    availableByTopLeft(currentNode) {
        if (currentNode.y === 0) { return true; } else {
            return (currentNode.x === 0 || currentNode.y === (SIZE_OF_SCENARIO - 1)) ? true : !scenario[currentNode.x - 1][currentNode.y + 1].visited;
        }
    }

    /**
     * Checks if the top right node is available
     * @param {Node} currentNode Node that is being evaluated 
     */
    availableByTopRight(currentNode) {
        if (currentNode.y === 0) { return true; } else {
            return (currentNode.x === (SIZE_OF_SCENARIO - 1) || currentNode.y === (SIZE_OF_SCENARIO - 1)) ? true : !scenario[currentNode.x + 1][currentNode.y + 1].visited;
        }
    }

    /**
     * Checks if the bottom right node is available
     * @param {Node} currentNode Node that is being evaluated 
     */
    availableByBotRight(currentNode) {
        if (currentNode.y === SIZE_OF_SCENARIO - 1) { return true; } else {
            return (currentNode.x === (SIZE_OF_SCENARIO - 1) || currentNode.y === 0) ? true : !scenario[currentNode.x + 1][currentNode.y - 1].visited;
        }
    }

    /**
     * Obtains a random number between given range
     * @param {Number} min Minimum number
     * @param {Number} max Maximum number
     */
    getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    /**
     * Generates doors as new nodes are chosen for the level
     * @param {Door element} door Door item
     * @param {Node} currentNode Node that is being evaluated
     */
    pickDoor(door, currentNode) {
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

export default map_test;