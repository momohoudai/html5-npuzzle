

function Board(x, y, size, puzzleCount) {
    this.size = size;
    this.x = x;
    this.y = y;
    this.puzzleWidth = 480;
    this.puzzleHeight = 480;
    this.pieceWidth = 480 / size;
    this.pieceHeight = 480 / size;
    this.puzzleCount = puzzleCount;
    this.puzzlePieces = [];
    this.npuzzle = new NPuzzle();
}

Board.prototype.getCoordByIndex = function(index) {
    let x = index % this.size;
    let y = Math.floor(index / this.size)
    
    let firstPiecePositionX = this.x - this.puzzleWidth/2;
    let firstPiecePositionY = this.y - this.puzzleHeight/2;

    return new Phaser.Geom.Point(
        firstPiecePositionX + x * this.pieceWidth,
        firstPiecePositionY + y * this.pieceHeight,
    )
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


Board.prototype.movePiece = function(spriteId) {
    // find the sprite with the correct index
    let sprite = this.puzzlePieces[spriteId];
    if (this.npuzzle.canMove(sprite.place)) {
        let holeIndex = this.npuzzle.holeIndex;
        let holePos = this.getCoordByIndex(this.npuzzle.holeIndex);
        
        sprite.setPosition(holePos.x, holePos.y);
        this.npuzzle.move(sprite.place);
        sprite.place = holeIndex;


        /*let tween  = this.game.add.tween(sprite).to({
            x: new_pos.x + BOARD_MARGIN,
            y: new_pos.y + BOARD_MARGIN,
        }, 400, Phaser.Easing.Cubic.Out, true);

        tween.onComplete.add(() => {
            this.m_isAnimating = false;
        });
        this.m_isAnimating = true;*/

        //update current state
        //[this.npuzzle.state[sprite.id], this.npuzzle.state[this.m_currentState.hole_index]] = Helper.swap(this.m_currentState.state[sprite.data], this.m_currentState.state[this.m_currentState.hole_index]);

        //update sprite data 
        //[this.m_currentState.hole_index, sprite.data] = Helper.swap(this.m_currentState.hole_index, sprite.data);
        //[this.m_puzzlePieces[this.m_currentState.hole_index], this.m_puzzlePieces[sprite.data]] = Helper.swap(this.m_puzzlePieces[this.m_currentState.hole_index], this.m_puzzlePieces[sprite.data]);        

        //++this.m_movesTaken;
        //this.updateText();
     }
} 



Board.prototype.init = function(game) {
    this.puzzlePieces.length = 0; // clears the array

    let puzzlePieceKey = 'puzzle_' + Math.floor(Math.random() * (this.puzzleCount + 1));
    let index = 0;

    for (let r = 0; r < this.size; ++r) {
        for (let c = 0; c < this.size; ++c) {       
            let position = this.getCoordByIndex(index);
            let sprite = game.add.sprite(0, 0, puzzlePieceKey);
            sprite.setScale(this.puzzleWidth / sprite.width);
            
            // Cropping does not change the position, size and anchor of the sprite.
            // So we must set those manually to fit the actual sprite size we want...
            let rect = new Phaser.Geom.Rectangle(c * sprite.width / this.size, r * sprite.height / this.size, sprite.width / this.size, sprite.height / this.size);
            sprite.setCrop(rect.x, rect.y, rect.width, rect.height);
            sprite.setOrigin(1/3 * c, 1/3 * r); // origin is top left corner of piece
            
            sprite.setPosition(position.x, position.y);
            
            sprite.id = index;
            sprite.place = index;
            sprite.setInteractive(
                rect,
                Phaser.Geom.Rectangle.Contains
            );
            
            
            sprite.on('pointerdown', () => {
                console.log("sprite: id = " + sprite.id + ", p =  " + sprite.place)
                this.movePiece(sprite.id);
            });

            // Finally set the size to the appropriate size
            sprite.setSize(this.pieceWidth, this.pieceHeight);
            this.puzzlePieces.push(sprite);

            ++index;
        }
    }
    this.generate();
}

Board.prototype.generate = function() {
    this.npuzzle.init(this.size)
    this.npuzzle.generate();
    console.log(this.npuzzle);;
    this.reset();
}

Board.prototype.reset = function() {
    for (let i = 0; i < this.npuzzle.state.length; ++i) {
        let sprite = this.puzzlePieces[this.npuzzle.state[i]];

        if (this.npuzzle.getHoleValue() == sprite.id) {
            sprite.disableInteractive();
            sprite.setAlpha(0);
        }
        else {
            sprite.setInteractive();
            sprite.setAlpha(1);
        };
    
       let position = this.getCoordByIndex(i);
       sprite.setPosition(position.x, position.y);
       sprite.place = i;
    }

    /*
    this.m_movesTaken = 0;
    this.updateText();
    */

}
