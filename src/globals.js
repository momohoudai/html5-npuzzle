let DEBUG: boolean = false;

const IDEAL_WH: Phaser.Point = new Phaser.Point(600, 800);
const IDEAL_AR: number = IDEAL_WH.x / IDEAL_WH.y;


const BTN_SIZE: number =  80;

// macro cus I'm lazy...
function PT(x: number, y: number): Phaser.Point {
    return new Phaser.Point(x, y);
}

function MKBTN(game: Phaser.Game, color:number, shape?: any): Phaser.Graphics {
    let button: Phaser.Graphics = game.add.graphics();
    button.beginFill(color, 1);
    button.drawCircle(0, 0, BTN_SIZE);
    button.inputEnabled = true;
    button.hitArea = new Phaser.Circle(0, 0, BTN_SIZE);
    button.endFill();

    button.events.onInputOver.add((butt: Phaser.Graphics) => {
        butt.clear();
        butt.beginFill(0x00FF00);
        butt.drawCircle(0, 0, BTN_SIZE);
        butt.endFill();
    })
    button.events.onInputOut.add((butt: Phaser.Graphics) => {
        butt.clear();
        butt.beginFill(color);
        butt.drawCircle(0, 0, BTN_SIZE);
        butt.endFill();
    })

    if (shape) {
        button.addChild(shape);
    }

    return button;
}

// returns workable width and height
function calculateDimensions() {
    let winWidth = window.innerWidth;
    let winHeight = window.innerHeight;

    //console.log("window wh:" + [winWidth, winHeight]);

    // we want it portrait, so we go by the height, then calculate the width we want.
    // aspect ratio is w/h, so we just multiply the height by the ratio to get the width we want
    let workable_width = IDEAL_AR * winHeight;
    let workable_height = winHeight;
    let workable_x = (winWidth - workable_width) * 0.5;
    let workable_y = (winHeight - workable_height) * 0.5;
    let scale = (winHeight / IDEAL_WH.y);

   // console.log("workable:" + [workable_x, workable_y, workable_width, workable_height, scale]);

    return [workable_x, workable_y, workable_width, workable_height, scale];
};


let boxes: Phaser.Graphics[] = [];
function renderLetterBox(game: Phaser.Game, color:number, workable_x: number, workable_y: number, workable_width: number, workable_height: number) {
    let winWidth: number = window.innerWidth;
    let winHeight: number = window.innerHeight;

    let box_pos: number[] = [0, workable_x + workable_width];
    for (let i = 0; i < 2; ++i) {
        if (boxes[i] != null)
            boxes[i].clear();
        boxes[i] = game.add.graphics(box_pos[i], 0);
        boxes[i].beginFill(0xFFFFFF);
        boxes[i].drawRect(0, 0, (winWidth - workable_width) * 0.5, workable_height);
    }


}