import { FoldOperator } from '../../coroner';

export function foldsEqual(a: FoldOperator, b: FoldOperator) {
    if (a.length !== b.length) {
        return false;
    }

    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
}
