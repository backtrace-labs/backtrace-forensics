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

export function foldStartsWith(fold: FoldOperator, test: Partial<FoldOperator>) {
    for (let i = 0; i < test.length; i++) {
        if (fold[i] !== test[i]) {
            return false;
        }
    }

    return true;
}
