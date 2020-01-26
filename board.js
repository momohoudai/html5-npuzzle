

function Board(x, y, r, c, puzzleCount) {
    this.rows = r;
    this.cols = c;
    this.x = x;
    this.y = y;
    this.puzzleWidth = 480;
    this.puzzleHeight = 480;
    this.pieceWidth = 480 / c;
    this.pieceHeight = 480 / r;
    this.puzzleCount = puzzleCount;
}

Board.prototype.load = function(game) {
    game.load.setBaseURL('https://momodevelop.gitlab.io/html5-npuzzle/')    
    for (let i = 0; i <= this.puzzleCount; ++i) {
        game.load.image(
            'puzzle_' + i, 
            'assets/puzzle/' + i + '.png'
        )
    }
    
}


Board.prototype.init = function(game) {
    let puzzlePieceKey = 'puzzle_' + Math.floor(Math.random() * (this.puzzleCount + 1));
    let index = 0;
    //for (let r = 0; r < this.rows; ++r) {
    //    for (let c = 0; c < this.cols; ++c) {
            let r = 0;
            let c = 0;
            let position = (() => {
                let firstPiecePositionX = this.x - this.puzzleWidth/2;
                let firstPiecePositionY = this.y - this.puzzleHeight/2;
                return new Phaser.Geom.Point(
                    firstPiecePositionX + c * this.pieceWidth,
                    firstPiecePositionY + r * this.pieceHeight,
                )
            })();
            
            let sprite = game.add.sprite(0, 0, puzzlePieceKey);
            sprite.setOrigin(1/3 * c, 1/3 * r); // origin is top left corner of piece
            sprite.setPosition(position.x, position.y);
            sprite.setSize(this.pieceWidth, this.pieceHeight);
            sprite.id = index++;
            //sprite.setCrop(c * this.pieceWidth, r * this.pieceHeight, this.pieceWidth, this.pieceHeight);
            //sprite.setDisplaySize(this.pieceWidth, this.pieceHeight);
            sprite.setInteractive(
                new Phaser.Geom.Rectangle(c * this.pieceWidth, r * this.pieceHeight,this.pieceWidth,this.pieceHeight), 
                Phaser.Geom.Rectangle.Contains
            );
            
            sprite.on('pointerdown', function(pointer) {
                console.log("Hello: " + sprite.id);
            });

           
            
            
            // input
           /* sprite.inputEnabled = true;
            sprite.events.onInputDown.add((sprite, pointer) => {
                if (!this.m_isSolving) {
                    this.move_piece(sprite.data);
                }
            }, this);
            this.m_puzzleGroup.add(sprite);
            this.m_masterPuzzlePieces.push(sprite);*/
    //    }
    //}
}
