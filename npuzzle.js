function NPuzzle() {
    this.state = [];
    this.width = 0;
    this.holeIndex = 0;
    this.goal = []
}

NPuzzle.prototype.init = function(width) {
    this.width = width;
    this.state.length = 0;
    this.goal.length = 0;
    for (let i = 0; i < width * width; ++i) {
        this.state.add(i);
        this.goal.add(i);
    }
}

NPuzzle.prototype.generate = function() {
    this.holeIndex = Math.floor(Math.random() * this.width * this.width);
    let swapFn = (a, b) => { return [b, a]; }


    let isSolvableFn = (state, holeINdex) => {
        
        let countInversionsFn = (a, hole_index) => {
            let temp = a.slice();
            temp.splice(hole_index, 1);
            let arr = temp.slice();

            let mergeFn = (a, temp, left, mid, right) => {
                let i = left;
                let j = mid;
                let k = left;
                let inv_count = 0;
                while ((i <= mid - 1) && (j <= right)) {
                    if (a[i] <= a[j]) 
                        temp[k++] = a[i++]
                    else {
                        temp[k++] = a[j++];
                        inv_count = inv_count + (mid - i);
                    }
                }
                while (i <= mid - 1) 
                    temp[k++] = a[i++];
                while (j <= right) 
                    temp[k++] = a[j++];
                for (let count = left; count <= right; ++count) 
                    a[count] = temp[count];
                return inv_count;
            }
            
            let countInversionsSubFn = (a, temp, left, right) => {
                let inv_count = 0;
                if (right > left) {
                    let mid = Math.floor((right + left) / 2);
                    inv_count += countInversionsSubFn(a, temp, left, mid);
                    inv_count += countInversionsSubFn(a, temp, mid + 1, right);
                    inv_count += mergeFn(a, temp, left, mid + 1, right);
                }
                return inv_count;
            }
            return countInversionsSubFn(arr, temp, 0, arr.length - 1);
        }
        
        return (countInversionsFn(this.state, holeIndex) % 2 == 0);
    }

    do {
        let currentIndex = this.state.length;
         // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            let randomIndex = Math.floor(Math.random() * currentIndex);
            --currentIndex;

            // And swap it with the current element.
            [this.state[randomIndex], this.state[currentIndex]] = swapFn(this.state[randomIndex], this.state[currentIndex]);
        }
    } while (isSolvableFn(this.state, this.holeIndex) == false);

}


    // 1d to 2d array 
    function one_to_two(index: number, w: number): number[] {
        return [index % w, Math.floor(index / w)];
    }


    // returns an array of contiguous unique shuffled numbers.
    // [0] is the puzzle
    // [1] is the goal
    export function generate_puzzle_and_goal(w: number, h: number): puzzle_state[] {
        let result: puzzle_state[] = [];
        let hole_index: number = Math.floor(Math.random() * w * h);
        let puzzle: puzzle_state = new puzzle_state(get_goal_state(w, h), hole_index, w);       

        do {
            shuffle(puzzle.state);
        } while (is_solveble(puzzle.state, puzzle.hole_index) == false);

        result.push(puzzle);
        
        let goal: puzzle_state = new puzzle_state(get_goal_state(w, h), puzzle[puzzle.hole_index], w);
        result.push(goal);

        return result;
    }
