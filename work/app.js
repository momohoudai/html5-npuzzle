
var config = {
    type: Phaser.AUTO,
    width: 600,
    height: 800,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: {
        preload: preload,
        create: create
    }
};
var board;

function preload()
{
    board = new Board(this, 0, 0, config.width, 3, 13);
    board.load();
}

function create()
{
    board.init()
}


new Phaser.Game(config);