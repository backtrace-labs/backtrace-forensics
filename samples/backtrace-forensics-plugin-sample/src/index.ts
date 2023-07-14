import {
    FoldedCoronerQuery,
    SelectedCoronerQuery,
    extendCoronerQuery,
    extendFoldCoronerQuery,
    extendSelectCoronerQuery,
} from '@backtrace/forensics';

// Need to define types for extensions
// Required only in Typescript, Javascript can omit this
// This can be in any file in the project, Typescript needs just to see it
declare module '@backtrace/forensics' {
    interface SelectCoronerQuery {
        // You can add your own documentation and it will be visible on the types
        /**
         * Selects keys from object as attributes.
         *
         * This is a method from plugin 1.
         */
        selectKeys(obj: object): SelectedCoronerQuery;
    }

    interface FoldCoronerQuery {
        /**
         * Selects all attributes as HEAD.
         *
         * This is a method from plugin 1.
         */
        foldHead(...attrs: string[]): FoldedCoronerQuery;
    }

    interface CommonCoronerQuery {
        /**
         * Verifies if all used attributes exist on the hostname.
         */
        verifyAttributes(): Promise<boolean>;
    }
}

extendSelectCoronerQuery({
    selectKeys(obj: object) {
        let query = this;
        for (const key in obj) {
            query = query.select(key);
        }
        return query;
    },
});

extendFoldCoronerQuery({
    foldHead(...attrs: string[]) {
        let query = this;
        for (const attr of attrs) {
            query = query.fold(attr, 'head');
        }
        return query;
    },
});

extendCoronerQuery({
    async verifyAttributes() {
        // Make an API call

        return true;
    },
});
