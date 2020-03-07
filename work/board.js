

function Board(game, x, y, w, size, puzzleCount) {
    this.game = game;
    this.size = size;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = w / 3 * 4; // aspect ratio 3:4
    
    this.puzzleWidth = w * 0.8;
    this.puzzleHeight = this.puzzleWidth;
    this.pieceWidth = this.puzzleWidth / size;
    this.pieceHeight = this.puzzleHeight / size;
    this.puzzleCount = puzzleCount;
    this.puzzlePieces = [];
    this.puzzleX = this.x + this.w * 0.5;
    this.puzzleY = this.y + this.h * 0.375;

    this.npuzzle = new NPuzzle();
    this.originalPuzzle = new NPuzzle();
    this.movesTaken = 0;
    this.movesTakenText = null;
    
    // states
    this.isSolving = false;
    this.isAnimating = false;
}

Board.prototype.getCoordByIndex = function(index) {
    let x = index % this.size;
    let y = Math.floor(index / this.size)
    
    let firstPiecePositionX = this.puzzleX - this.puzzleWidth/2;
    let firstPiecePositionY = this.puzzleY - this.puzzleHeight/2;

    return new Phaser.Geom.Point(
        firstPiecePositionX + x * this.pieceWidth,
        firstPiecePositionY + y * this.pieceHeight,
    )
}

Board.prototype.load = function() {
    this.game.load.setBaseURL('https://momodevelop.gitlab.io/html5-npuzzle/')    
    for (let i = 0; i <= this.puzzleCount; ++i) {
        this.game.load.image(
            'puzzle_' + i, 
            'assets/puzzle/' + i + '.png'
        )
    }
    this.game.load.spritesheet('button_new', 'assets/button/button_new.png', {frameWidth:128,frameHeight:128})
    this.game.load.spritesheet('button_reset', 'assets/button/button_reset.png', {frameWidth:128,frameHeight:128})
    this.game.load.spritesheet('button_solve', 'assets/button/button_solve.png', {frameWidth:128,frameHeight:128})
}


Board.prototype.movePiece = function(spriteId) {
    let parent = this;
    // find the sprite with the correct index
    let sprite = this.puzzlePieces[spriteId];
    if (this.npuzzle.isMovePossible(sprite.place)) {
        // Swap between hole sprite and current sprite
        let swapFn = (a,b,) => { return [b, a]; }
        let spritePosition = this.getCoordByIndex(sprite.place);
        let holePosition = this.getCoordByIndex(this.npuzzle.holeIndex);
        let holeSprite = this.puzzlePieces[this.npuzzle.getHoleValue()];

        
        this.game.scene.scene.tweens.add({
            targets     : sprite,
            x           : holePosition.x,
            y           : holePosition.y,
            ease        : 'Cubic',
            duration    : 200,
            onComplete: function() {
                parent.isAnimating =  false;
            }
        });
        this.isAnimating = true;

        //sprite.setPosition(holeSprite.x, holeSprite.y);
        holeSprite.setPosition(spritePosition.x, spritePosition.y);
        this.npuzzle.move(sprite.place);
        
        [sprite.place, holeSprite.place] = swapFn(sprite.place, holeSprite.place);


        this.setMovesTakenText(++this.movesTaken);
        this.checkSolved();
    }
} 

Board.prototype.checkSolved = function() {
    if (this.npuzzle.isSolved()) {
        this.puzzlePieces[this.npuzzle.getHoleValue()].setAlpha(1);
        // disable interaction for all sprites
        for (let piece of this.puzzlePieces)
            piece.disableInteractive();
    }
}

Board.prototype.init = function() {
    // Puzzle Board
   
    let parent = this;
    this.puzzlePieces.length = 0; // clears the array
    let puzzlePieceKey = 'puzzle_' + Math.floor(Math.random() * (this.puzzleCount + 1));
    let index = 0;

    for (let r = 0; r < this.size; ++r) {
        for (let c = 0; c < this.size; ++c) {       
            let position = this.getCoordByIndex(index);
            let sprite = this.game.add.sprite(0, 0, puzzlePieceKey);
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
                if (this.isSolving == false)
                    this.movePiece(sprite.id);
            });

            // Finally set the size to the appropriate size
            sprite.setSize(this.pieceWidth, this.pieceHeight);
            this.puzzlePieces.push(sprite);

            ++index;
        }
    }

    // Text
    this.movesTakenText = this.game.add.text(this.x, this.y + this.h * 0.7, 'Hello', { 
        fontFamily: 'Verdana',
        fontSize: this.w * 0.075,
        align: "center",
        color: "#ffff00",
        fixedWidth: this.w - this.x
    });

    // Buttons
    let newButton = this.game.add.sprite(0, 0, 'button_new');
    newButton.setPosition(this.x + this.w * 0.2, this.y + this.h * 0.875)
    newButton.setInteractive();
    newButton.on('pointerdown', function() {
        newButton.setFrame(1)
    });
    newButton.on('pointerup', function() {
        parent.generate();
        parent.isSolving = false;
        newButton.setFrame(0)
    });
    newButton.on('pointerout', function() {
        newButton.setFrame(0)
    });

    let resetButton = this.game.add.sprite(0, 0, 'button_reset');
    resetButton.setPosition(this.x + this.w * 0.5, this.y + this.h * 0.875)
    resetButton.setInteractive();
    resetButton.on('pointerdown', function() {
        parent.reset()
        resetButton.setFrame(1)
    });
    resetButton.on('pointerup', function() {
        parent.reset()
        parent.isSolving = false;
        resetButton.setFrame(0)
    });
    resetButton.on('pointerout', function() {
        resetButton.setFrame(0)
    });


    let solveButton = this.game.add.sprite(0, 0, 'button_solve');
    solveButton.setPosition(this.x + this.w * 0.8, this.y + this.h * 0.875)
    solveButton.setInteractive();
    solveButton.on('pointerdown', function() {
        solveButton.setFrame(1)
    });
    solveButton.on('pointerup', function() {
        if (parent.isSolving == false) {
            parent.solve();
        }
        solveButton.setFrame(0)
    });
    solveButton.on('pointerout', function() {
        solveButton.setFrame(0)
    });


    this.generate();
}

Board.prototype.update = function() {
   
    if (this.answers && this.answers.length > 0) {
        if (!this.isAnimating) {
            let currentNode = this.answers.shift();
            this.movePiece(this.npuzzle.state[currentNode.holeIndex]);
            if (this.answers.length == 0) {
                this.isSolving = false;
            }
        }
    }
}
Board.prototype.solve = function() {
    this.answers = this.npuzzle.solve();
    if (this.answers && this.answers.length > 0) {
        this.isSolving = true;
    }
}

Board.prototype.generate = function() {
    this.npuzzle.init(this.size)
    this.npuzzle.generate();
    this.syncPuzzleWithBoard();
}


Board.prototype.reset = function() {
    this.npuzzle.reset();
    this.syncPuzzleWithBoard();
}

Board.prototype.syncPuzzleWithBoard = function() {
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
    this.movesTaken = 0;
    this.setMovesTakenText(0);
}

Board.prototype.setMovesTakenText = function(n) {
    this.movesTakenText.text = "Moves: " + n;
}