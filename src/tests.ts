import { CoronerQuery } from '.';

// TESTING STUFF
(async () => {
    interface Test {
        timestamp: number;
        fingerprint: string;
        _deleted: boolean;
    }

    const coronerQuery = {} as CoronerQuery;

    const staticQuery = coronerQuery.create<Test>();
    const dynamicQuery = coronerQuery.create();
    let runtimeStaticFold = staticQuery.fold();
    let runtimeDynamicFold = dynamicQuery.fold();

    const attrs: (keyof Test)[] = ['timestamp', 'fingerprint', '_deleted'];
    for (const attr of attrs) {
        runtimeStaticFold = runtimeStaticFold.fold(attr, 'head');
        runtimeDynamicFold = runtimeDynamicFold.fold(attr, 'head');
    }

    runtimeStaticFold = runtimeStaticFold.group('timestamp');
    runtimeDynamicFold = runtimeDynamicFold.group('timestamp');

    const staticFold = staticQuery
        .fold('timestamp', 'distribution', 1)
        .fold('_deleted', 'max')
        .fold('_deleted', 'min')
        .fold('_deleted', 'head')
        .group('_deleted');

    const staticFoldResult = await coronerQuery.execute(staticFold);

    if (!staticFoldResult.error) {
        const test = staticFoldResult.response;
        const simpleTest = test.first();
        simpleTest?.attributes._deleted;
    }

    let runtimeStaticSelect = staticQuery.select();
    let runtimeDynamicSelect = dynamicQuery.select<string>();

    for (const attr of attrs) {
        runtimeStaticSelect = runtimeStaticSelect.select(attr);
        runtimeDynamicSelect = runtimeDynamicSelect.select(attr);
    }

    coronerQuery.execute(runtimeStaticSelect).then((s) => !s.error && s.response.values[1]);
    coronerQuery.execute(runtimeDynamicSelect).then((s) => !s.error && s.response.values[1][1]);

    const staticSelect = staticQuery.select('timestamp');
    const selectResult = await coronerQuery.execute(staticSelect);
    if (!selectResult.error) {
        const simple = selectResult.response.first();
    }

    const dynamicSelectQuery = coronerQuery
        .create()
        .filter('b', 'greater-than', 456)
        // .filter('a', 'regular-expression', '123')
        // .filter('c', 'regular-expression', 'abx')
        // .filter('b', 'at-least', 456)
        .select('a')
        .select('b')
        .select('c');

    const dynamicSelectResult = await coronerQuery.execute(dynamicSelectQuery);
    if (!dynamicSelectResult.error) {
        const test = dynamicSelectResult.response.first();
        // b.response.values[2][1].
        if (test) {
            test;
        }
    }

    const dynamicFoldQuery = coronerQuery
        .create()
        .filter('b', 'greater-than', 456)
        // .filter('a', 'regular-expression', '123')
        // .filter('c', 'regular-expression', 'abx')
        // .filter('b', 'at-least', 456)
        // .select('a')
        // .select('b')
        // .select('c')
        .fold('a', 'head')
        .fold('a', 'min')
        .fold('c', 'sum')
        .group('a');

    const dynamicFoldResult = await coronerQuery.execute(dynamicFoldQuery);

    if (!dynamicFoldResult.error) {
        const test = dynamicFoldResult.response.first();
        // b.response.values[2][1].
        if (test) {
            test.attributes.a.groupKey;
        }
    }

    let semiRuntimeFold = staticQuery.fold('timestamp', 'head').fold('fingerprint', 'min');
    if (true) {
        semiRuntimeFold = semiRuntimeFold.fold('_deleted', 'max');
    }

    coronerQuery.execute(semiRuntimeFold).then((r) => !r.error && r.response.first()?.attributes);
})();

type Test<A extends string, B extends boolean> = [A, B];
type TestArray = Test<string, boolean>[];

type TestObject<A extends Test<string, boolean>[]> = {
    [I in keyof A]: A[I];
};

const a = {} as TestObject<[['a', true], ['b', false]]>;
