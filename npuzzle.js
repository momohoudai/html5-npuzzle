function NPuzzle() {
    this.state = [];
    this.originState = [];
    this.width = 0;
    this.holeIndex = 0;
    this.goal = []
}

NPuzzle.prototype.init = function(width) {
    this.width = width;
    this.state.length = 0;
    this.goal.length = 0;
    for (let i = 0; i < width * width; ++i) {
        this.state.push(i);
        this.originState.push(i);
        this.goal.push(i);
    }
}

NPuzzle.prototype.reset = function() {
    this.state.length = 0;
    this.state = this.originState.slice();
}

NPuzzle.prototype.isSolved = function() {
    for (let i = 0; i < this.width * this.width; ++i) {
        if (this.state[i] !== this.goal[i]) 
            return false;
    }
    return true;
}

NPuzzle.prototype.getHoleValue = function() {
    return this.state[this.holeIndex];
}

NPuzzle.prototype.isMovePossible = function(index) {
    let oneToTwoFn = (idx) => { return [idx % this.width, Math.floor(idx / this.width)]; }
    let hole2id = oneToTwoFn(this.holeIndex, this.width);
    let item2id = oneToTwoFn(index, this.width);
    let diff = [hole2id[0] - item2id[0], hole2id[1] - item2id[1]];

    return (Math.abs(diff[0]) == 0 && Math.abs(diff[1]) == 1) || (Math.abs(diff[1]) == 0 && Math.abs(diff[0]) == 1);
}

NPuzzle.prototype.move = function(index) {
    if(this.isMovePossible(index)) {
        let swapFn = (a,b) => { return [b, a] };
        [this.state[index], this.state[this.holeIndex]] = swapFn(this.state[index], this.state[this.holeIndex]);
        this.holeIndex = index;
    }
}

NPuzzle.prototype.generateSimple = function() {
    this.holeIndex = 8;
    this.state = [0, 1, 2, 3, 4, 5, 6, 7, 8];
}

NPuzzle.prototype.generate = function() {
    this.holeIndex = Math.floor(Math.random() * this.width * this.width);
    let swapFn = (a, b) => { return [b, a]; }


    let isSolvableFn = (state, holeIndex) => {
        
        let countInversionsFn = (a, holeIndex) => {
            let temp = a.slice();
            temp.splice(holeIndex, 1);
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
        
        return (countInversionsFn(state, holeIndex) % 2 == 0);
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
    this.originState = this.state.slice();

}


