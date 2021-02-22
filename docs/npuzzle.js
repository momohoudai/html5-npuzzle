function NPuzzle() {
    this.state = [];
    this.originState = [];
    this.width = 0;
    this.originHoleIndex = 0;
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
    this.holeIndex = this.originHoleIndex;
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
    this.holeIndex = this.originHoleIndex = 8;
    this.state = [0, 1, 2, 3, 4, 5, 6, 7, 8];
}

NPuzzle.prototype.generate = function() {
    this.holeIndex = this.originHoleIndex = Math.floor(Math.random() * this.width * this.width);
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

NPuzzle.prototype.compare = function(lhs, rhs) {
    if (lhs.length !== rhs.length)
        return false;
    for (let i = rhs.length; --i;) {
        if (lhs[i] !== rhs[i])
            return false;
    }

    return true;
}

NPuzzle.prototype.solve = function() {
    let parent = this;
    function Node(g, h, parent, state, holeIndex) {
        this.parent = parent;
        this.g = g;
        this.h = h;
        this.f = g + h;
        this.state = state;
        this.holeIndex = holeIndex;
    }
    
    let findInNodeList = (list, node) => {
        let result = list.find((element) => {
            return parent.compare(element.state, node.state);
        });
        return result;
    }

    let retraceSteps = (end_a_star_node) => {
        let result = [];
        let currentNode = end_a_star_node;
        while (currentNode.parent != null) {
            result.unshift(currentNode);
            currentNode = currentNode.parent;
        }

        return result;
    }

    let generateSuccessors = (node) => {
        let result = [];
        let swap = (a, b) => { return [b, a]; }
        let holeXY = [node.holeIndex % 3, Math.floor(node.holeIndex / 3)];
        
        let successorG = node.g + 1;

        // left
        if (holeXY[0] != 0) {
            let newState = node.state.slice();
            let newHoleIndex = node.holeIndex - 1;
            [newState[node.holeIndex], newState[newHoleIndex]] = swap(newState[node.holeIndex], newState[newHoleIndex]);
            let successorH = getHeuristics(newState, newHoleIndex);
            result.push(new Node(successorG, successorH, node, newState, newHoleIndex));
        }
        // right
        if (holeXY[0] != 2) {
            let newState = node.state.slice();
            let newHoleIndex = node.holeIndex + 1;
            [newState[node.holeIndex], newState[newHoleIndex]] = swap(newState[node.holeIndex], newState[newHoleIndex]);
            let successorH = getHeuristics(newState, newHoleIndex);
            result.push(new Node(successorG, successorH, node, newState, newHoleIndex));
        }

        // up
        if (holeXY[1] != 0) {
            let newState = node.state.slice();
            let newHoleIndex = node.holeIndex - 3;
            [newState[node.holeIndex], newState[newHoleIndex]] = swap(newState[node.holeIndex], newState[newHoleIndex]);
            let successorH = getHeuristics(newState, newHoleIndex);
            result.push(new Node(successorG, successorH, node, newState, newHoleIndex));
        }

        // down
        if (holeXY[1] != 2) {
            let newState = node.state.slice();
            let newHoleIndex = node.holeIndex + 3;
            [newState[node.holeIndex], newState[newHoleIndex]] = swap(newState[node.holeIndex], newState[newHoleIndex]);
            let successorH = getHeuristics(newState, newHoleIndex);
            result.push(new Node(successorG, successorH, node, newState, newHoleIndex));
        }


        return result;
    }

    let getHeuristics = (state, holeIndex) => {
        let result = 0;
        for (let i = 0; i < state.length; ++i) {
            if (i == holeIndex) {
                continue;
            }

            // Find out how far away current index is from origin
            let currentXY = [i % 3, Math.floor(i / 3)];
            let targetXY = [state[i] % 3, Math.floor(state[i] / 3)];

            result += Math.abs(targetXY[0] - currentXY[0]) + Math.abs(targetXY[1] - currentXY[1]);
        }

        return result;
    }

    let goal = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    let closedList = [];
    let openList = [new Node(0, 0, null, this.state.slice(), this.holeIndex)];
    while (openList.length != 0) {
        // Find the node with the least f on the open list, 'q', and pop it + add to closed list
        openList.sort((a, b) => {
            return a.f - b.f;
        });
        let currentNode = openList.shift();
        closedList.push(currentNode);
        // return if it is the goal
        if (this.compare(currentNode.state, goal)) {
            return retraceSteps(currentNode);
        }

        // generate q's successors and set their parents to q
        let successors = generateSuccessors(currentNode);
        
        // for each successor:
        for (let i = successors.length; i--;) {
            //if the state exists in the closed list, ignore
            if (findInNodeList(closedList, successors[i])) {
                continue;
            }


            // if the state is not in the open list, compute its score
            let openNode = findInNodeList(openList, successors[i]);
            if (openNode == undefined) {
                // add it and compute it's score
                openList.push(successors[i]);
            }
            else {
                // calculate new scores
                let successorH = getHeuristics(successors[i].state, successors[i].holeIndex);
                let successorG = currentNode.g + 1;

                // Check if the F is lower. If it is, update the score and parent
                let successorF = successorG + successorH;
                if (successorF < openNode.f) {
                    openNode.g = successorG;
                    openNode.h = successorH;
                    openNode.f = openNode.g + openNode.f;
                    openNode.parent = currentNode;
                }
            }

        }

    }

    return [];

}
