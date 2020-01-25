namespace NPuzzle {
    export class puzzle_state {
        private _state: number[];
        private _width: number;

        public hole_index: number;

        constructor(state: number[], hole_index: number, width: number) {
            this._state = state;
            this.hole_index = hole_index;
            this._width = width;

            this.check_is_valid();
        }

        public copy(): puzzle_state {
            return new puzzle_state(this.state.slice(), this.hole_index, this.width);
        }

        get state(): number[] {
            return this._state;
        }
        set state(state: number[]) {
            this._state = state;
        }
        get width(): number {
            return this._width;
        }
        set width(w: number) {
            this._width = w;
        }

        private check_is_valid(): void {
            if (this._state.length % this._width != 0) {
                throw new Error("state.length cannot be divided by width");
            }
        }
    }

    function shuffle(array: number[]) {
        let currentIndex: number = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }


    function _merge(a: number[], temp: number[], left: number, mid: number, right: number): number {
        let i: number = left;
        let j: number = mid;
        let k: number = left;

        let inv_count: number = 0;
        while ((i <= mid - 1) && (j <= right)) {
            if (a[i] <= a[j]) {
                temp[k++] = a[i++]
            }
            else {
                temp[k++] = a[j++];
                inv_count = inv_count + (mid - i);
            }
        }

        while (i <= mid - 1) {
            temp[k++] = a[i++];
        }
        while (j <= right) {
            temp[k++] = a[j++];
        }
        for (let count: number = left; count <= right; ++count) {
            a[count] = temp[count];
        }

        return inv_count;

    }

    function _count_inversions_merge_sub(a: number[], temp: number[], left: number, right: number): number {
        let inv_count: number = 0;
        if (right > left) {
            let mid: number = Math.floor((right + left) / 2);

            inv_count += _count_inversions_merge_sub(a, temp, left, mid);
            inv_count += _count_inversions_merge_sub(a, temp, mid + 1, right);
            inv_count += _merge(a, temp, left, mid + 1, right);
        }

        return inv_count;
    }

    function _count_inversions_merge(a: number[], hole_index: number): number {
        let temp: number[] = a.slice();
        temp.splice(hole_index, 1);
        let arr: number[] = temp.slice();

        return _count_inversions_merge_sub(arr, temp, 0, arr.length - 1);
    }

    function _count_inversions_brute(arr: number[], hole: number) {
        let a = arr.slice();
        a.splice(hole, 1);
        var inv_count = 0;
        for (var i = 0; i < a.length - 1; i++) {
            for (var j = i + 1; j < a.length; j++) {
                if (a[i] > a[j]) {
                    inv_count++;
                }
            }
        }

        return inv_count;
    }

    // 1d to 2d array 
    function one_to_two(index: number, w: number): number[] {
        return [index % w, Math.floor(index / w)];
    }

    // 2d to 1d array
    function two_to_one(x: number, y: number, w: number): number {
        return x * w + y;
    }

    //swap
    function swap(a, b) {
        return [b, a];
    }

    // returns if the n-puzzle is solvable
    export function is_solveble(a: number[], hole_index: number): boolean {
        //console.log("merge: " + _count_inversions_merge(a, hole_index));
        //console.log("brute: " + _count_inversions_brute(a, hole_index));
        return (_count_inversions_merge(a, hole_index) % 2 == 0);
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

    // returns an array of contiguous unique numbers in ascending order
    // ie [0,1,2,3...]
    function get_goal_state(w: number, h: number): number[] {
        let length: number = w * h;
        let result: number[] = [];
        for (let i = 0; i < length; ++i) {
            result.push(i);
        }

        return result;
    }

    function is_array_identical(a: number[], b: number[]): boolean {
        if (a.length !== b.length)
            return false;
        for (let i: number = b.length; --i;) {
            if (a[i] !== b[i])
                return false;
        }

        return true;
    }

    // returns the heuristics using manhatten
    function calc_manhattan(puzzle: puzzle_state): number {
        if (puzzle == null) {
            return 0;
        }

        let result: number = 0;
        for (let i = 0; i < puzzle.state.length; ++i) {
            if (i == puzzle.hole_index) {
                continue;
            }

            // Find out how far away current index is from origin
            let currentXY: number[] = one_to_two(i, puzzle.width);
            let targetXY: number[] = one_to_two(puzzle.state[i], puzzle.width);

            result += Math.abs(targetXY[0] - currentXY[0]) + Math.abs(targetXY[1] - currentXY[1]);
        }

        return result;
    }

    function calc_node_cost(parent_state: puzzle_state, parent_cost: number, current_state: puzzle_state): number {
        return parent_cost + 1;
    }

    function generate_successors(puzzle: puzzle_state): puzzle_state[] {
        if (puzzle == null) {
            throw new Error("[generate_successors] puzzle is null");
        }

        let result: puzzle_state[] = [];
        let height: number = puzzle.state.length / puzzle.width;

        let holeXY: number[] = one_to_two(puzzle.hole_index, puzzle.width);

        // left
        if (holeXY[0] != 0) {
            let new_state: number[] = puzzle.state.slice();
            let new_hole_index: number = puzzle.hole_index - 1;
            [new_state[puzzle.hole_index], new_state[new_hole_index]] = swap(new_state[puzzle.hole_index], new_state[new_hole_index]);
            result.push(new puzzle_state(new_state, new_hole_index, puzzle.width));
        }
        // right
        if (holeXY[0] != puzzle.width - 1) {
            let new_state: number[] = puzzle.state.slice();
            let new_hole_index: number = puzzle.hole_index + 1;
            [new_state[puzzle.hole_index], new_state[new_hole_index]] = swap(new_state[puzzle.hole_index], new_state[new_hole_index]);
            result.push(new puzzle_state(new_state, new_hole_index, puzzle.width));
        }

        // up
        if (holeXY[1] != 0) {
            let new_state: number[] = puzzle.state.slice();
            let new_hole_index: number = puzzle.hole_index - puzzle.width;
            [new_state[puzzle.hole_index], new_state[new_hole_index]] = swap(new_state[puzzle.hole_index], new_state[new_hole_index]);
            result.push(new puzzle_state(new_state, new_hole_index, puzzle.width));
        }

        // down
        if (holeXY[1] != height - 1) {
            let new_state: number[] = puzzle.state.slice();
            let new_hole_index: number = puzzle.hole_index + puzzle.width;
            [new_state[puzzle.hole_index], new_state[new_hole_index]] = swap(new_state[puzzle.hole_index], new_state[new_hole_index]);
            result.push(new puzzle_state(new_state, new_hole_index, puzzle.width));
        }


        return result;
    }

    function compare_func(lhs: puzzle_state, rhs: puzzle_state): boolean {
        let a: number[] = lhs.state;
        let b: number[] = rhs.state;

        if (a.length !== b.length)
            return false;
        for (let i: number = b.length; --i;) {
            if (a[i] !== b[i])
                return false;
        }

        return true;
    }

    export function solve(start_puzzle: puzzle_state, end_puzzle: puzzle_state) : puzzle_state[] {
        return AStar.solve<puzzle_state>(start_puzzle, end_puzzle, compare_func, generate_successors, calc_node_cost, calc_manhattan);
        //return IDAStar.solve<puzzle_state>(start_puzzle, end_puzzle, compare_func, generate_successors, calc_node_cost, calc_manhattan);

    }
}