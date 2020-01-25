namespace AStar {
    class node<T> {
        parent: node<T>;
        state: T;

        private _g: number;
        private _h: number;
        private _f: number;
        constructor(parent: node<T>, state: T, g: number, h: number) {
            this.parent = parent;
            this.state = state;
            this.set_score(g, h);
        }
        public set_score(g: number, h: number): void {
            this._g = g;
            this._h = h;
            this._f = g + h;
        }
        get f(): number {
            return this._f;
        }
        get g(): number {
            return this._g;
        }
    };

    // returns the indices of the pieeces that moved
    function retrace_steps<T>(end_a_star_node: node<T>): T[] {
        let result: T[] = [];
        let current_node: node<T> = end_a_star_node;
        while (current_node.parent != null) {
            result.unshift(current_node.state);
            current_node = current_node.parent;
        }

        return result;
    }

    function find_in_node_list<T>(node_list: node<T>[], state: T, compare_func: (a: T, b: T) => boolean): node<T> {
        let result: node<T> = node_list.find((element: node<T>): boolean => {
            return compare_func(element.state, state);
        });

        return result;
    }


    export function solve<T>(
        start: T,
        goal: T,
        compare_func: (a: T, b: T) => boolean,
        generate_successors: (a: T) => T[],
        get_cost: (parent_state: T, parent_cost: number, current_state: T) => number, // TODO: use get_cost
        get_heuristics: (a: T) => number
        ): T[] {
        let closed_list: node<T>[] = [];

        //put the starting node on the open list (you can leave its f at zero)
        let open_list: node<T>[] = [new node(null, start, 0, 0)];

        // while the open list is not empty
        while (open_list.length != 0) {
            // Find the node with the least f on the open list, 'q', and pop it + add to closed list
            open_list.sort((a: node<T>, b: node<T>): number => {
                return a.f - b.f;
            });
            let current_node: node<T> = open_list.shift();
            closed_list.push(current_node);
            //console.log(closed_list.length);

            // return if it is the goal
            if (compare_func(current_node.state, goal)) {
                return retrace_steps(current_node);
            }

            // generate q's successors and set their parents to q
            let successors: T[] = generate_successors(current_node.state);

            // for each successor:
            for (let i = successors.length; i--;) {
                //if the state exists in the closed list, ignore
                if (find_in_node_list(closed_list, successors[i], compare_func)) {
                    continue;
                }

                let successor_g_score: number = current_node.g + 1;
                let successor_h_score: number = get_heuristics(successors[i]);

                // if the state is not in the open list, compute its score
                let open_node: node<T> = find_in_node_list(open_list, successors[i], compare_func);
                if (!open_node) {
                    // add it and compute it's score
                    open_list.push(new node(current_node, successors[i], successor_g_score, successor_h_score));
                }
                else {
                    // Check if the F is lower. If it is, update the score and parent
                    let successor_f_score: number = successor_g_score + successor_h_score;
                    if (successor_f_score < open_node.f) {
                        open_node.set_score(successor_g_score, successor_h_score);
                        open_node.parent = current_node;
                    }
                }

            }

        }

        return [];
    }
}