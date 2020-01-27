
var config = {
    type: Phaser.AUTO,
    width: 600,
    height: 800,
    scene: {
        preload: preload,
        create: create
    }
};
var board = new Board(0, 0, config.width, 3, 13);


function preload()
{
    board.load(this);
}

function create()
{
    board.init(this)
}


new Phaser.Game(config);