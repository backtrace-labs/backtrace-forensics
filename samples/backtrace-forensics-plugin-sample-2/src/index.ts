import {
    FoldFilterInput,
    FoldFilterOperatorInput,
    SelectedCoronerQuery,
    extendCoronerQuery,
    extendFoldedCoronerQuery,
} from 'backtrace-forensics';

// Need to define types for extensions
// Required only in Typescript, Javascript can omit this
// This can be in any file in the project, Typescript needs just to see it
declare module 'backtrace-forensics' {
    interface SelectCoronerQuery {
        // You can add your own documentation and it will be visible on the types
        /**
         * Selects attributes `a`, `b`, and `c`.
         *
         * This is a method from plugin 2.
         */
        selectAbc(): SelectedCoronerQuery;
    }

    interface FoldCoronerQuery {
        /**
         * This is a method from plugin 2.
         */
        foldAbcHead(): FoldedCoronerQuery;
    }

    interface FoldedCoronerQuery {
        /**
         * This is a method from plugin 2.
         */
        havingAbcHead(operator: FoldFilterOperatorInput, value: FoldFilterInput): this;
    }

    interface CommonCoronerQuery {
        /**
         * This is a method from plugin 2.
         */
        filterAbcNotEmpty(): this;
    }
}

// Globally extends folded query with "havingAbcHead" method
extendFoldedCoronerQuery({
    havingAbcHead(operator: FoldFilterOperatorInput, value: FoldFilterInput) {
        return this.having('a', 0, operator, value).having('b', 0, operator, value).having('c', 0, operator, value);
    },
});

// Globally extends common query with "filterAbcNotEmpty" method
extendCoronerQuery({
    filterAbcNotEmpty() {
        return this.filter('a', 'not-equal', '').filter('b', 'not-equal', '').filter('c', 'not-equal', '');
    },

    selectAbc() {
        return this.select('a').select('b').select('c');
    },

    foldAbcHead() {
        return this.fold('a', 'head').fold('b', 'head').fold('c', 'head');
    },
});
