import { BacktraceForensic } from '.';

// TESTING STUFF
(async () => {
    interface Test {
        timestamp: number;
        fingerprint: string;
        _deleted: boolean;
    }

    const coronerQuery = {} as BacktraceForensic;

    const staticQuery = coronerQuery.create();
    const dynamicQuery = coronerQuery.create();
    let runtimeStaticFold = staticQuery.fold<keyof Test>();
    let runtimeDynamicFold = dynamicQuery.fold();

    const attrs: (keyof Test)[] = ['timestamp', 'fingerprint', '_deleted'];
    for (const attr of attrs) {
        runtimeStaticFold = runtimeStaticFold.fold(attr, 'head');
        runtimeDynamicFold = runtimeDynamicFold.fold(attr, 'head');
    }

    runtimeStaticFold = runtimeStaticFold.group<string>('timestamp');
    runtimeDynamicFold = runtimeDynamicFold.group<string>('timestamp');

    const groupedFold = runtimeStaticFold.group('timestamp');

    runtimeStaticFold.getResponse().then((r) => !r.error && r.response.first()?.attributes.fingerprint.distribution);
    groupedFold.getResponse().then((r) => !r.error && r.response.first()?.attributes);

    const staticFold = staticQuery
        .fold('timestamp', 'distribution', 1)
        .fold('_deleted', 'max')
        .fold('_deleted', 'min')
        .fold('_deleted', 'head')
        .group('_deleted');

    const staticFoldResult = await staticFold.getResponse();

    if (!staticFoldResult.error) {
        const test = staticFoldResult.response;
        const simpleTest = test.first();
        simpleTest?.attributes.timestamp.distribution;
    }

    let runtimeStaticSelect = staticQuery.select<keyof Test>();
    let runtimeDynamicSelect = dynamicQuery.select();

    for (const attr of attrs) {
        runtimeStaticSelect = runtimeStaticSelect.select(attr);
        runtimeDynamicSelect = runtimeDynamicSelect.select(attr);
    }

    runtimeStaticSelect.getResponse().then((s) => !s.error && s.response.values[1]);
    runtimeDynamicSelect.getResponse().then((s) => !s.error && s.response.values[1][1]);

    const staticSelect = staticQuery.select('timestamp').select('_deleted');

    const selectResult = await staticSelect.getResponse();
    if (!selectResult.error) {
        const simple = selectResult.response.first();
    }

    const dynamicSelectQuery = coronerQuery
        .create()
        // .filter('b', 'greater-than', 456)
        // .filter('a', 'regular-expression', '123')
        // .filter('c', 'regular-expression', 'abx')
        // .filter('b', 'at-least', 456)
        .select('a')
        .select('b')
        .select('c');

    const dynamicSelectResult = await dynamicSelectQuery.getResponse();
    if (!dynamicSelectResult.error) {
        const test = dynamicSelectResult.response.first();
        // dynamicSelectResult.response.values[0][1].
    }

    const dynamicFoldQuery = coronerQuery
        .create()
        // .filter('b', 'greater-than', 456)
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

    const dynamicFoldResult = await dynamicFoldQuery.getResponse(); // const dynamicFoldResult = await coronerQuery.getResponse(dynamicFoldQuery);
    if (!dynamicFoldResult.error) {
        const test = dynamicFoldResult.response.first();
        if (test) {
            test.attributes.a.groupKey;
            test.attributes.a.min;
            test.attributes.a.head;
            test.attributes.c.sum;
        }
    }

    let semiRuntimeFold = staticQuery.fold('timestamp', 'head').fold('fingerprint', 'min');
    if (true) {
        semiRuntimeFold = semiRuntimeFold.fold('_deleted', 'max');
    }

    semiRuntimeFold.getResponse().then((r) => !r.error && r.response.first()?.attributes);
})();

type Test<A extends string, B extends boolean> = [A, B];
type TestArray = Test<string, boolean>[];

type TestObject<A extends Test<string, boolean>[]> = {
    [I in keyof A]: A[I];
};

const a = {} as TestObject<[['a', true], ['b', false]]>;
