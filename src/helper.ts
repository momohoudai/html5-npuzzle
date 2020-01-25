namespace Helper {
    // Takes in pixel coordinates and scale to sprite to it.
    export function sprite_scale_to(sprite: Phaser.Sprite, w: number, h: number): void {
        sprite.scale.x = w / sprite.width;
        sprite.scale.y = h / sprite.height;
    }

    // 1d to 2d array 
    export function one_to_two(index: number, w: number): number[] {
        return [index % w, Math.floor(index / w)];
    }

    // 2d to 1d array
    export function two_to_one(x: number, y: number, w: number): number {
        return x * w + y;
    }

    export function xor(a: any, b: any): boolean {
        return a ? !b : b;
    }

    export function log_number_array(prefix: string, array: number[]): void {
        let output: string = prefix;
        for (let i = 0; i < array.length; ++i) {
            output += array[i] + (i != array.length - 1 ? ',' : '');
        }
        console.log(output);
    }

    export function swap(a, b) {
        return [b, a];
    }

}

