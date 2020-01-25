/// <reference path="../lib/phaser.d.ts" />
/// <reference path="globals.ts" />
/// <reference path="helper.ts" />
/// <reference path="npuzzle.ts" />

let ART_MAX: number = 13;
let N_WH: Phaser.Point = new Phaser.Point(3, 3);
const BOARD_WH: Phaser.Point = new Phaser.Point(IDEAL_WH.x, IDEAL_WH.x);
const BOARD_MARGIN: number = 10;
const PIECE_WH: Phaser.Point = new Phaser.Point((BOARD_WH.x - 2 * BOARD_MARGIN) / N_WH.x, (BOARD_WH.y - 2 * BOARD_MARGIN) / N_WH.y);

class StateGame extends Phaser.State {
    private m_masterGroup: Phaser.Group;
    private m_puzzleGroup: Phaser.Group;
    private m_masterPuzzlePieces: Phaser.Sprite[];
    private m_puzzlePieces: Phaser.Sprite[];
    private m_firstPiecePos: Phaser.Point;
    private m_movesTaken: number;

    // states
    private m_originState: NPuzzle.puzzle_state;
    private m_currentState: NPuzzle.puzzle_state;
    private m_goalState: NPuzzle.puzzle_state;

    //buttons
    private m_returnButton: Phaser.Graphics;
    private m_solveButton: Phaser.Graphics;
    private m_resetButton: Phaser.Graphics;
    private m_shuffleButton: Phaser.Graphics;

    // title
    private m_title: Phaser.Text;

    // debug
    private m_debugKey: Phaser.Key;
    private m_debugRect: Phaser.Rectangle;

    // for solving
    private m_answers: NPuzzle.puzzle_state[] ;
    private m_answerCount: number;
    private m_isAnimating: boolean;
    private m_isSolving: boolean;

    constructor() {
        super();
    }

    public init() {
        this.m_currentState = null;
        this.m_originState = null;
        this.m_puzzlePieces = [];
        this.m_masterPuzzlePieces = [];
        this.m_movesTaken = 0;
        this.m_answerCount = 0;

        this.m_puzzleGroup = new Phaser.Group(this.game);
        this.m_masterGroup = new Phaser.Group(this.game);

        this.m_isAnimating = false;
        this.m_isSolving = false;
    }
    public render() {
        this.draw_debug();
    }


    private get_coord_by_index(x: number, y: number): Phaser.Point {
        return new Phaser.Point(
            this.m_firstPiecePos.x + x * PIECE_WH.x,
            this.m_firstPiecePos.y + y * PIECE_WH.y,
        )
    }
 
    private reset_puzzle() {
        this.m_currentState = this.m_originState.copy();
        this.m_puzzlePieces = this.m_masterPuzzlePieces.slice();
        // Loop through each sprite
        for (let i = 0; i < this.m_puzzlePieces.length; ++i) {
            let sprite: Phaser.Sprite = this.m_puzzlePieces[i];
            sprite.data = this.m_currentState.state.indexOf(i);

            sprite.inputEnabled = (this.m_currentState.hole_index != sprite.data);
            sprite.alpha = (this.m_currentState.hole_index == sprite.data) ? 0 : 1;           

            let xy = Helper.one_to_two(sprite.data, N_WH.x);
            sprite.position = this.get_coord_by_index(xy[0], xy[1]).add(BOARD_MARGIN, BOARD_MARGIN);
        }
        this.m_puzzlePieces.sort((a: Phaser.Sprite, b: Phaser.Sprite): number => {
            return a.data - b.data;
        });
        this.m_movesTaken = 0;
        this.updateText();
    }
    private check_goal() {
        // lock all sprites
        for (let i = 0; i < this.m_puzzlePieces.length; ++i) {
            let sprite: Phaser.Sprite = this.m_puzzlePieces[i];
            sprite.inputEnabled = false
        }

        // TODO: congratulations or something.
    }



    public update() {
        if (this.m_answers && this.m_answers.length > 0) {
            if (!this.m_isAnimating) {
                let current_node: NPuzzle.puzzle_state = this.m_answers.shift();
                this.move_piece(current_node.hole_index);
                if (this.m_answers.length == 0) {
                    this.m_isSolving = false;
                }
            }
        }
    }

    private solve() : void {
        //let move_indices: number[] = NPuzzle.solve_a_star(this.m_currentState, this.m_goalState);
        //this.m_answers = NPuzzle.solve_a_star(this.m_currentState, this.m_goalState
        this.m_answers = NPuzzle.solve(this.m_currentState, this.m_goalState);
        if (this.m_answers && this.m_answers.length > 0) {
            this.m_isSolving = true;
            this.m_movesTaken = 0;
            this.updateText();
        }
    }

    private stop_solving(): void {
        this.m_answers = [];
        this.m_isSolving = false;
        this.m_isAnimating = false;
        this.game.tweens.removeAll();
    }

    private move_piece(index: number): void{
        // find the sprite with the correct index
        let sprite = this.m_puzzlePieces[index];

        let hole_pos: number[] = Helper.one_to_two(this.m_currentState.hole_index, N_WH.x);
        let sprite_pos: number[] = Helper.one_to_two(sprite.data, N_WH.x);

        let diff: number[] = [hole_pos[0] - sprite_pos[0], hole_pos[1] - sprite_pos[1]];
        // Either one must be 1 and 0
        if ((Math.abs(diff[0]) == 0 && Math.abs(diff[1]) == 1) ||
            (Math.abs(diff[1]) == 0 && Math.abs(diff[0]) == 1)) {

            let new_pos: Phaser.Point = this.get_coord_by_index(hole_pos[0], hole_pos[1]);

            let tween: Phaser.Tween = this.game.add.tween(sprite).to({
                x: new_pos.x + BOARD_MARGIN,
                y: new_pos.y + BOARD_MARGIN,
            }, 400, Phaser.Easing.Cubic.Out, true);

            tween.onComplete.add(() => {
                this.m_isAnimating = false;
            });
            this.m_isAnimating = true;

            //update current state
            [this.m_currentState.state[sprite.data], this.m_currentState.state[this.m_currentState.hole_index]] = Helper.swap(this.m_currentState.state[sprite.data], this.m_currentState.state[this.m_currentState.hole_index]);

            //update sprite data 
            [this.m_currentState.hole_index, sprite.data] = Helper.swap(this.m_currentState.hole_index, sprite.data);
            [this.m_puzzlePieces[this.m_currentState.hole_index], this.m_puzzlePieces[sprite.data]] = Helper.swap(this.m_puzzlePieces[this.m_currentState.hole_index], this.m_puzzlePieces[sprite.data]);        

            ++this.m_movesTaken;
            this.updateText();
        }
    }

    private generate_puzzle() {
        let puzzle_states: NPuzzle.puzzle_state[] = NPuzzle.generate_puzzle_and_goal(N_WH.x, N_WH.y);
        this.m_currentState = puzzle_states[0];
        this.m_originState = this.m_currentState.copy();
        this.m_goalState = puzzle_states[1];
    }

    private create_board() {
        this.m_firstPiecePos = new Phaser.Point(0, 0);
        
        
        this.generate_puzzle();

        // Background
        let background1: Phaser.Graphics = this.game.add.graphics(0, 0);
        background1.beginFill(0xDDDDDD, 1);
        background1.drawRoundedRect(0, 0, BOARD_WH.x, BOARD_WH.y, 10);

        let background2: Phaser.Graphics = this.game.add.graphics(0, 0);
        background1.beginFill(0x555555, 1);
        background1.drawRoundedRect(BOARD_MARGIN, BOARD_MARGIN, BOARD_WH.x - 2 * BOARD_MARGIN, BOARD_WH.y - 2 * BOARD_MARGIN, 10);

        this.m_puzzleGroup.add(background1);
        this.m_puzzleGroup.add(background2);

        // The puzzle pieces
        let puzzle_piece_key: string = 'puzzle_' + Math.floor(Math.random() * ART_MAX);
        let count: number = 0;
        for (let j = 0; j < N_WH.y; ++j) {
            for (let i = 0; i < N_WH.x; ++i, ++count) {
                let position: Phaser.Point = this.get_coord_by_index(i, j);
                let sprite: Phaser.Sprite = this.game.add.sprite(
                    position.x + BOARD_MARGIN,
                    position.y + BOARD_MARGIN,
                    puzzle_piece_key
                );

                // crop the sprite's texture
                let offset_x: number = sprite.width / N_WH.x;
                let offset_y: number = sprite.height / N_WH.y;
                let cropRect: Phaser.Rectangle = new Phaser.Rectangle(i * offset_x, j * offset_y, offset_x, offset_y);
                sprite.crop(cropRect, false);
                Helper.sprite_scale_to(sprite, PIECE_WH.x, PIECE_WH.y);

                // let the sprite know it's index
                sprite.data = count;

                // input
                sprite.inputEnabled = true;
                sprite.events.onInputDown.add((sprite: Phaser.Sprite, pointer: Phaser.Pointer) => {
                    if (!this.m_isSolving) {
                        this.move_piece(sprite.data);
                    }

                }, this);

                this.m_puzzleGroup.add(sprite);
                this.m_masterPuzzlePieces.push(sprite);
            }
        }

        this.m_masterGroup.add(this.m_puzzleGroup);

        this.reset_puzzle();
    }

    private create_text() {
        this.m_title = this.game.add.text();
        this.updateText();
        this.m_title.anchor.setTo(0.5);
        this.m_title.font = 'Verdana';
        this.m_title.fontSize = 80;
        this.m_title.fill = '#ffff00';
        this.m_masterGroup.add(this.m_title);

    }
    private updateText() {
        this.m_title.text = ""+ this.m_movesTaken;
    }
    public create() { 
        this.create_text();
        this.create_board();
        this.create_buttons();

        this.resize(this.game.world.width, this.game.world.height);
    }

    private create_buttons() {
        let back_sprite: Phaser.Sprite = this.game.add.sprite(0, 0, 'button_back');
        let solve_sprite: Phaser.Sprite = this.game.add.sprite(0, 0, 'button_solve');
        let reset_sprite: Phaser.Sprite = this.game.add.sprite(0, 0, 'button_reset');

        back_sprite.scale.x = back_sprite.scale.y =
        solve_sprite.scale.x = solve_sprite.scale.y =
        reset_sprite.scale.x = reset_sprite.scale.y = 0.1;

        back_sprite.anchor.x = back_sprite.anchor.y =
        solve_sprite.anchor.x = solve_sprite.anchor.y =
        reset_sprite.anchor.x = reset_sprite.anchor.y = 0.5;

        this.m_returnButton = MKBTN(this.game, 0xFFFF00, back_sprite);
        this.m_returnButton.events.onInputUp.add(() => {
            this.stop_solving();
            this.generate_puzzle();
            this.reset_puzzle();
            
        });

        this.m_solveButton = MKBTN(this.game, 0xFFFF00, solve_sprite);
        this.m_solveButton.events.onInputUp.add(() => {
            if (!this.m_isSolving) {
                this.solve();
            }
            
        });

        this.m_resetButton = MKBTN(this.game, 0xFFFF00, reset_sprite);
        this.m_resetButton.events.onInputUp.add(() => {
            this.stop_solving();
            this.reset_puzzle();
        });
    }
    public resize(width: number, height: number) {
        let x: number, y: number, w: number, h: number, s: number;
        [x, y, w, h, s] = calculateDimensions();

        let board_width: number = BOARD_WH.x / 2 * s;

        // title
        this.m_title.position.x = x + w / 2;
        this.m_title.position.y = y + h * 0.065;
        this.m_title.scale.x = s;
        this.m_title.scale.y = s;

        // puzzle
        this.m_puzzleGroup.x = x;
        this.m_puzzleGroup.y = h / 2 - board_width;
        this.m_puzzleGroup.scale.x = s;
        this.m_puzzleGroup.scale.y = s;
        

        // buttons
        let button_y: number = h * 0.935;

        this.m_returnButton.x = x + w * 0.2;
        this.m_returnButton.y = button_y;
        this.m_returnButton.scale.x = s;
        this.m_returnButton.scale.y = s;

        this.m_resetButton.x = x + w * 0.5;
        this.m_resetButton.y = button_y;
        this.m_resetButton.scale.x = s;
        this.m_resetButton.scale.y = s;

        this.m_solveButton.x = x + w * 0.8;
        this.m_solveButton.y = button_y;
        this.m_solveButton.scale.x = s;
        this.m_solveButton.scale.y = s;

        //renderLetterBox(this.game, 0xFFFFFF, x, y, w, h);
    }
}