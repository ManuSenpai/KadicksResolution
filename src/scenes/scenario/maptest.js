const NUMBER_OF_ROOMS = 20;     // Número de habitaciones
const SIZE_OF_SCENARIO = 10;    // Tamaño de escenario en bloques 

var scenario;
class map_test extends Phaser.Scene {
    nodeList;
    constructor() {
        super({ key: "map_test" });
        
    }

    create() {
        scenario = [];  // Full nxn map
        dungeon = [];   // The actual dungeon
        for (let i = 0; i < SIZE_OF_SCENARIO; i++) {
            let row = [];
            for (let j = 0; j < SIZE_OF_SCENARIO; j++) {
                row.push(new Scenario_Node(false, false, false, false, false, false, false, false));
            }
            scenario.push(row);
        }

        var graphics = this.add.graphics({ lineStyle: { width: 2, color: 0x0000aa } });
        var rect = new Phaser.Geom.Rectangle( 25, 25, 50, 50 );

        // We set the start point
        let startingX = this.getRandomNumber( 2, SIZE_OF_SCENARIO - 3 );
        let startingY = this.getRandomNumber( 2, SIZE_OF_SCENARIO - 3 );
        scenario[startingX][startingY].isStart = true;
        scenario[startingX][startingY].visited = true;

        dungeon.push( scenario[startingX][startingY] );

        console.log( scenario[startingX][startingY] );

        for ( var i = 0; i < SIZE_OF_SCENARIO; i++ ){
            for( var j = 0; j < SIZE_OF_SCENARIO; j++ ) {
                if( this.nodeList)
                rect.setTo( (i+1) * 60, (j+1) * 60, 50, 50 );
                graphics.strokeRectShape(rect);
                // Phaser.Geom.Rectangle.Offset(rect, 0, 60 );
            }
        }
        console.log(scenario);
    }

    getRandomNumber( min, max ) {
        return Math.floor(Math.random()*(max-min+1)+min);
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
    constructor(top, right, bottom, left, visited, isStart, isKey, isBoss) {
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
        this.visited = visited;
        this.isStart = isStart;
        this.isKey = isKey;
        this.isBoss = isBoss;
    };
}

class Scenario {
    scenario;
    constructor(nodeList) {
        this.scenario = nodeList;
    }
}

export default map_test;