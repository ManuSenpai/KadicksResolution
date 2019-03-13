const NUMBER_OF_ROOMS = 20;     // Número de habitaciones
const SIZE_OF_SCENARIO = 10;    // Tamaño de escenario en bloques 

var scenario;
var dungeon;
var contador;
var bifurcate;
class map_test extends Phaser.Scene {
    nodeList;
    constructor() {
        super({ key: "map_test" });

    }

    create() {
        scenario = [];  // Full nxn map
        dungeon = [];   // The actual dungeon
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
                    let maxNumberOfBifurcations = NUMBER_OF_ROOMS - contador > 3 ? 3 : NUMBER_OF_ROOMS - contador;
                    let numberOfBifurcations = Math.floor(Math.random() * maxNumberOfBifurcations) + 1;

                    let availableDoors = [];
                    if (!currentNode.left && currentNode.x != 0) availableDoors.push(scenario[currentNode.x - 1][currentNode.y]);
                    if (!currentNode.right && currentNode.x != (SIZE_OF_SCENARIO - 1)) availableDoors.push(scenario[currentNode.x + 1][currentNode.y]);
                    if (!currentNode.top && currentNode.y != 0) availableDoors.push(scenario[currentNode.x][currentNode.y - 1]);
                    if (!currentNode.bottom && currentNode.y != (SIZE_OF_SCENARIO - 1)) availableDoors.push(scenario[currentNode.x][currentNode.y + 1]);

                    if (numberOfBifurcations >= availableDoors.length) {
                        availableDoors.forEach((door) => {
                            this.pickDoor(door, currentNode);
                            dungeon.push(door);
                            contador++;
                        });
                    } else {
                        for (let i = 0; i < numberOfBifurcations; i++) {
                            let doorIndex = Math.floor(Math.random() * numberOfBifurcations);
                            let door = availableDoors[doorIndex];
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

        console.log(scenario[startingX][startingY]);

        var graphics = this.add.graphics({ lineStyle: { width: 2, color: 0x0000aa } });
        var rect = new Phaser.Geom.Rectangle(25, 25, 50, 50);
        for (var i = 0; i < SIZE_OF_SCENARIO; i++) {
            for (var j = 0; j < SIZE_OF_SCENARIO; j++) {
                if (scenario[i][j].visited) { graphics.lineStyle(5, 0xCCFCFF, 1.0); } else {
                    graphics.lineStyle(5, 0x0000aa, 1.0);
                }
                rect.setTo((i + 1) * 60, (j + 1) * 60, 50, 50);
                graphics.strokeRectShape(rect);
            }
        }
        console.log(scenario);
    }

    getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

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
    x = 0;
    y = 0;
    constructor(top, right, bottom, left, visited, isStart, isKey, isBoss, x, y) {
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
    };
}

class Scenario {
    scenario;
    constructor(nodeList) {
        this.scenario = nodeList;
    }
}

export default map_test;