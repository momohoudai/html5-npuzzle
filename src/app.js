var config = {
    type: Phaser.AUTO,
    width: 600,
    height: 800,
    scene: {
        preload: preload,
        create: create
    }
};

var game = new Phaser.Game(config);

function preload()
{
    this.load.setBaseURL('./');
    this.load.image('board', 'assets/gameboard.png');
}

function create()
{
    this.add.image(0,0, 'board');

}
