import { BacktraceForensic } from '../src';
import { Attribute } from '../src/queries/common';
import { Folds } from '../src/requests/fold';
import { CoronerResponse } from '../src/responses/common';
import { FoldQueryResponse } from '../src/responses/fold';
import { SelectQueryResponse } from '../src/responses/select';

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

const testFoldResponse: CoronerResponse<FoldQueryResponse<Attribute, Folds, string>> = {
    error: undefined,
    response: {
        toArray: () => {
            throw new Error('not implemented');
        },
        first: () => {
            throw new Error('not implemented');
        },
        version: '1.2.0',
        seq: 37,
        encoding: 'rle',
        columns: [
            ['head(callstack)', 'callstack'],
            ['head(randomInt)', 'none'],
            ['distribution(timestamp)', 'unix_timestamp'],
            ['range(timestamp)', 'unix_timestamp'],
            ['bin(timestamp)', 'unix_timestamp'],
            ['bin(version;first_seen)', 'unix_timestamp'],
        ],
        factors_desc: [{ name: 'fingerprint', format: 'sha256', type: 'dictionary' }],
        columns_desc: [
            { name: 'callstack', format: 'callstack', type: 'dictionary', op: 'head' },
            { name: 'randomInt', format: 'none', type: 'uint32', op: 'head' },
            { name: 'timestamp', format: 'unix_timestamp', type: 'uint64', op: 'distribution' },
            { name: 'timestamp', format: 'unix_timestamp', type: 'uint64', op: 'range' },
            { name: 'timestamp', format: 'unix_timestamp', type: 'uint64', op: 'bin' },
            { name: 'version;first_seen', format: 'unix_timestamp', type: 'uint64', op: 'bin' },
        ],
        pagination: { limit: 20, offset: 0 },
        values: [
            [
                'f9be5fab68692b9792f33335798a01e89a7e0b9a42ee75548b4517de9e5da3a0',
                [
                    ['{"frame":["main","processTicksAndRejections"]}'],
                    ['16395388'],
                    [
                        {
                            keys: 97,
                            tail: 195,
                            vals: [
                                ['1635846708', 3],
                                ['1635846714', 3],
                                ['1635846719', 3],
                            ],
                        },
                    ],
                    [1635846705, 1635846990],
                    [[1608831212, 1660728993, 204]],
                    [
                        [1635846705, 1635846710, 150],
                        [1635846860, 1635846865, 54],
                    ],
                ],
                204,
            ],
            [
                'fa3df054a1d6525b3ed5d16c39ecce2733de77b65f9eaa3b1cf0f7ccf830bf0d',
                [
                    ['{"frame":["processTicksAndRejections"]}'],
                    ['3536908636'],
                    [
                        {
                            keys: 48,
                            tail: 88,
                            vals: [
                                ['1635861297', 3],
                                ['1635861306', 3],
                                ['1635861333', 3],
                            ],
                        },
                    ],
                    [1635861293, 1635861340],
                    [[1608831212, 1660728993, 97]],
                    [
                        [1635846705, 1635846710, 72],
                        [1635846860, 1635846865, 25],
                    ],
                ],
                97,
            ],
            [
                '8a0a6ab2fe721db02a5eee325d55f1c2f33d982b6200b60394717bbc31eed476',
                [
                    [
                        '{"frame":["Route.dispatch","Function.process_params","next","expressInit","Layer.handle [as handle_request]"]}',
                    ],
                    ['0'],
                    [
                        {
                            keys: 13,
                            tail: 10,
                            vals: [
                                ['1635859420', 1],
                                ['1635859574', 1],
                                ['1635859739', 1],
                            ],
                        },
                    ],
                    [1635859420, 1635861292],
                    [[1608831212, 1660728993, 13]],
                    [
                        [1635846705, 1635846710, 4],
                        [1635846860, 1635846865, 6],
                    ],
                ],
                13,
            ],
            [
                '407c0e05304c264fb48a4f74003e8fd608ad69507608197e86bdd544ae4fad4f',
                [
                    [
                        '{"frame":["main","Object.<anonymous>","Module._compile","Object.Module._extensions..js","Module.load","Function.Module._load","Function.executeUserEntryPoint [as runMain]"]}',
                    ],
                    ['1765517764'],
                    [
                        {
                            keys: 4,
                            tail: 1,
                            vals: [
                                ['1635846705', 1],
                                ['1635846727', 1],
                                ['1635846840', 1],
                            ],
                        },
                    ],
                    [1635846705, 1635846988],
                    [[1608831212, 1660728993, 4]],
                    [[1635846705, 1635846706, 4]],
                ],
                4,
            ],
            [
                '0e2a4590cf070c5fbe86a9b000a27c414050f3347917fec191b8a70f2f3d83ee',
                [
                    [
                        '{"frame":["QueryFailedError.TypeORMError [as constructor]","new QueryFailedError","Statement.handler"]}',
                    ],
                    ['0'],
                    [
                        {
                            keys: 4,
                            tail: 1,
                            vals: [
                                ['1659367312', 1],
                                ['1659367323', 1],
                                ['1659367381', 1],
                            ],
                        },
                    ],
                    [1659367312, 1659367560],
                    [[1608831212, 1660728993, 4]],
                    [],
                ],
                4,
            ],
            [
                'd6eee36c3b255b27268091ad585e32e6bd9f9692eb8bb0c7f1cf3995cb8ff1bc',
                [
                    [
                        '{"frame":["getTargets","getDependencies","_createSubRequests","plan","Container._get","Container._getButThrowIfAsync","Container.get"]}',
                    ],
                    ['0'],
                    [
                        {
                            keys: 3,
                            vals: [
                                ['1659109367', 1],
                                ['1659367946', 1],
                                ['1659368090', 1],
                            ],
                        },
                    ],
                    [1659109367, 1659368090],
                    [[1608831212, 1660728993, 3]],
                    [],
                ],
                3,
            ],
            [
                '58785ec127bd48dc500da8972de467750178e5995e139733ac4fabae5da51ddd',
                [
                    [
                        '{"frame":["System.IO.FileStream..ctor ","System.IO.File.OpenRead ","System.IO.File.ReadAllBytes ","UnityEngine.Events.UnityAction.Invoke ","UnityEngine.Events.UnityEvent.Invoke ","UnityEngine.EventSystems.ExecuteEvents+EventFunction`1[T1].Invoke ","UnityEngine.EventSystems.ExecuteEvents.Execute[T] ","UnityEngine.EventSystems.StandaloneInputModule.ProcessTouchPress ","UnityEngine.EventSystems.StandaloneInputModule.ProcessTouchEvents ","UnityEngine.EventSystems.StandaloneInputModule.Process ","UnityEngine.EventSystems.StandaloneInputModule:Process"]}',
                    ],
                    ['0'],
                    [
                        {
                            keys: 3,
                            vals: [
                                ['1651766087', 1],
                                ['1651811199', 1],
                                ['1652113309', 1],
                            ],
                        },
                    ],
                    [1651766087, 1652113309],
                    [[1608831212, 1660728993, 3]],
                    [],
                ],
                3,
            ],
            [
                'ffe2703f36969f4d63d791bd5b680a284573d691c3125f3f59f803d6e8586ddc',
                [
                    [
                        '{"frame":["System.IO.FileStream..ctor "," System.IO.FileStream..ctor","System.IO.File.OpenRead ","System.IO.File.ReadAllBytes ","StartupSceneController.ReadFile ","StartupSceneController.InternalFileReader ","StartupSceneController.UnhandledException ","UnityEngine.Events.InvokableCall.Invoke ","UnityEngine.Events.UnityEvent.Invoke ","UnityEngine.UI.Button.Press ","UnityEngine.UI.Button.OnPointerClick ","UnityEngine.EventSystems.ExecuteEvents.Execute ","UnityEngine.EventSystems.ExecuteEvents.Execute[T] ","UnityEngine.EventSystems.EventSystem:Update"]}',
                    ],
                    ['0'],
                    [
                        {
                            keys: 2,
                            vals: [
                                ['1651675544', 1],
                                ['1651681597', 1],
                            ],
                        },
                    ],
                    [1651675544, 1651681597],
                    [[1608831212, 1660728993, 2]],
                    [],
                ],
                2,
            ],
            [
                '3ce749a3d93e774420add136113c143ce8320795da569e26d6ad13ee10e1b0af',
                [
                    [
                        '{"frame":["__pthread_kill","abort","CA::Display::DisplayLink::dispatch_items","display_timer_callback","GSEventRunModal","-[UIApplication _run]","UIApplicationMain","main"]}',
                    ],
                    ['0'],
                    [{ keys: 1, vals: [['1651811177', 1]] }],
                    [1651811177, 1651811177],
                    [[1608831212, 1660728993, 1]],
                    [[1651766288, 1651766289, 1]],
                ],
                1,
            ],
            [
                '9984467d362daa8d037e81ac100acce3c10298f09111a7d1122b93e9579e2416',
                [
                    [
                        '{"frame":["__abort","vsnprintf_l","CA::Display::DisplayLink::dispatch_items","display_timer_callback","GSEventRunModal","-[UIApplication _run]","UIApplicationMain","main"]}',
                    ],
                    ['0'],
                    [{ keys: 1, vals: [['1651766274', 1]] }],
                    [1651766274, 1651766274],
                    [[1608831212, 1660728993, 1]],
                    [[1651766288, 1651766289, 1]],
                ],
                1,
            ],
            [
                '82c60b2309a8e16fda421e07483681e75242560bf0484d5c88c4fb575dde845f',
                [
                    [
                        '{"frame":["-[PLCrashReporter generateLiveReportWithThread:error:]","-[OomWatcher sendOomReports]","-[OomWatcher startOomIntegration]","-[OomWatcher initWithCrashReporter:andAttributes:andApi:andAttachments:]","-[Backtrace initWithBacktraceUrl:andAttributes:andOomSupport:andAttachments:andClientSideUnwinding:]","StartBacktraceIntegration","NativeClient_Start_m410B1199507CD2195F690D2B1AE90251278140C3","NativeClient_HandleNativeCrashes_mAF321A2B4A9DE1A4D53B8C5DAF943D77F9FF056C","NativeClient__ctor_m7F4390125CC24EECAD0A1874AC8022258E7FD206","NativeClientFactory_CreateNativeClient_m2C3A77DF9B1AE76DECE81E66E660D69A2D54F2A4","BacktraceClient_Refresh_mE23B1D973AE968302EA66CC6F8447151AC7B3713","RuntimeInvoker_TrueVoid_t22962CB4C05B1D89B55A6E1139F0E87A90987017(void (*)","il2cpp::vm::Runtime::Invoke","scripting_method_invoke","Invoke","InvokeChecked","CallMethod","CallAwake","AddToManager","AwakeFromLoad","InvokePersistentManagerAwake","PersistentManagerAwakeFromLoad","CompleteAwakeSequence","CompletePreloadManagerLoadScene","PlayerLoadSceneFromThread","CompleteLoadFirstScene","IntegrateMainThread","UpdatePreloadingSingleStep","UpdatePreloading","UnityPlayerLoopImpl","UnityRepaint","-[UnityAppController","CA::Display::DisplayLink::dispatch_items","display_timer_callback","GSEventRunModal","-[UIApplication _run]","UIApplicationMain","-[UnityFramework runUIApplicationMainWithArgc:argv:]","main"]}',
                    ],
                    ['0'],
                    [{ keys: 1, vals: [['1652112748', 1]] }],
                    [1652112748, 1652112748],
                    [[1608831212, 1660728993, 1]],
                    [[1651766288, 1651766289, 1]],
                ],
                1,
            ],
            [
                'fc76efcf8f3800e47f233bc86eacecc598daadae886872e853d474c1550f1d26',
                [
                    [
                        '{"frame":["__psynch_cvwait","CA::Display::DisplayLink::dispatch_items","display_timer_callback","GSEventRunModal","-[UIApplication _run]","UIApplicationMain","main"]}',
                    ],
                    ['0'],
                    [{ keys: 1, vals: [['1651811191', 1]] }],
                    [1651811191, 1651811191],
                    [[1608831212, 1660728993, 1]],
                    [[1651766288, 1651766289, 1]],
                ],
                1,
            ],
            [
                '98728cd55a983f275f0d62819c3005fe7506a1c0c9bc52a87a93a8d3d10ee80c',
                [
                    [
                        '{"frame":["StartupSceneController.HandledException","UnityEngine.Events.UnityAction.Invoke","UnityEngine.Events.UnityEvent.Invoke","UnityEngine.EventSystems.ExecuteEvents+EventFunction`1[T1].Invoke","UnityEngine.EventSystems.ExecuteEvents.Execute","UnityEngine.EventSystems.StandaloneInputModule.ProcessTouchPress","UnityEngine.EventSystems.StandaloneInputModule.ProcessTouchEvents","UnityEngine.EventSystems.StandaloneInputModule.Process"]}',
                    ],
                    ['0'],
                    [{ keys: 1, vals: [['1651811205', 1]] }],
                    [1651811205, 1651811205],
                    [[1608831212, 1660728993, 1]],
                    [],
                ],
                1,
            ],
            [
                'b056f61acc4ec1eaf03f2d4df60ebe2911673536b7c89218374b0c1c762b38f7',
                [
                    [
                        '{"frame":["CA::Display::DisplayLink::dispatch_items","display_timer_callback","GSEventRunModal","-[UIApplication _run]","UIApplicationMain","main"]}',
                    ],
                    ['0'],
                    [{ keys: 1, vals: [['1651783407', 1]] }],
                    [1651783407, 1651783407],
                    [[1608831212, 1660728993, 1]],
                    [[1651766288, 1651766289, 1]],
                ],
                1,
            ],
            [
                'f2f558bafe87bff35387a31f8cd42cfa83d92ae1fa35d86fca66b888911d4e65',
                [
                    [
                        '{"frame":["System.IO.FileStream.ctor","System.IO.File.OpenRead","System.IO.File.ReadAllBytes","StartupSceneController.HandledException","UnityEngine.Events.UnityAction.Invoke","UnityEngine.Events.UnityEvent.Invoke","UnityEngine.EventSystems.ExecuteEvents+EventFunction`1[T1].Invoke","UnityEngine.EventSystems.ExecuteEvents.Execute","UnityEngine.EventSystems.StandaloneInputModule.ProcessTouchPress","UnityEngine.EventSystems.StandaloneInputModule.ProcessTouchEvents","UnityEngine.EventSystems.StandaloneInputModule.Process"]}',
                    ],
                    ['0'],
                    [{ keys: 1, vals: [['1651811205', 1]] }],
                    [1651811205, 1651811205],
                    [[1608831212, 1660728993, 1]],
                    [],
                ],
                1,
            ],
            [
                '3adc2af686e2fcb63c74c4c778753e0eb0248374c14243a72a3f7b8a119dfaa2',
                [
                    ['{"frame":["TCPConnectWrap.afterConnect [as oncomplete]"]}'],
                    ['0'],
                    [{ keys: 1, vals: [['1658242333', 1]] }],
                    [1658242333, 1658242333],
                    [[1608831212, 1660728993, 1]],
                    [],
                ],
                1,
            ],
            [
                '2a455dab41669d8b85ad2bfab6d47b010e4d0d76f7725182ca2a9af6f261ada5',
                [
                    [
                        '{"frame":["__pthread_kill","abort","DiagnosticsUtils_Bindings::ForceCrash","Utils_CUSTOM_ForceCrash","_UnityAction_Invoke_mC9FF5AA1F82FDE635B3B6644CE71C94C31C3E71A","_UnityEvent_Invoke_mB2FA1C76256FE34D5E7F84ABE528AC61CE8A0325","_EventFunction_1_Invoke_m7899B7663B08CD474B8FADD9D85FF446CD839FE6_gshared","_ExecuteEvents_Execute_TisRuntimeObject_mDA4CD02F963B6939F8D079993DC2DCD75AB524DD_gshared","_StandaloneInputModule_ProcessTouchPress_m74A52DA64B9C5EB8B5A38889F25BFEAFC284FB51","_StandaloneInputModule_ProcessTouchEvents_mFEED66642E804A218DD34A9C5F0F8EAA5CA3B019","_StandaloneInputModule_Process_mBF40EA3762B85C417E6F88D531174D05A7FFCE75","RuntimeInvoker_TrueVoid_t22962CB4C05B1D89B55A6E1139F0E87A90987017(void (*)","il2cpp::vm::Runtime::Invoke","scripting_method_invoke","ScriptingInvocation::Invoke","MonoBehaviour::CallUpdateMethod","void BaseBehaviourManager::CommonUpdate<BehaviourManager>","ExecutePlayerLoop","PlayerLoop","UnityPlayerLoopImpl","_UnityRepaint","-[UnityAppController","CA::Display::DisplayLink::dispatch_items","display_timer_callback","<redacted>","_CFRunLoopRunSpecific","GSEventRunModal","-[UIApplication _run]","UIApplicationMain","-[UnityFramework runUIApplicationMainWithArgc:argv:]","main"]}',
                    ],
                    ['0'],
                    [{ keys: 1, vals: [['1651766652', 1]] }],
                    [1651766652, 1651766652],
                    [[1608831212, 1660728993, 1]],
                    [[1651766288, 1651766289, 1]],
                ],
                1,
            ],
            [
                '178a0e02a20088b36618a36fbbfc0428302015305f1e7afe42f64ae0645af59d',
                [
                    [
                        '{"frame":["System.IO.FileStream.ctor","System.IO.File.OpenRead","System.IO.File.ReadAllBytes","StartupSceneController.ReadFile","StartupSceneController.InternalFileReader","StartupSceneController.HandledException"]}',
                    ],
                    ['0'],
                    [{ keys: 1, vals: [['1651675603', 1]] }],
                    [1651675603, 1651675603],
                    [[1608831212, 1660728993, 1]],
                    [],
                ],
                1,
            ],
            [
                'f7aad8d82d935a65e56eae9594b09c3ae008351aa6e9caa25b09aa53940e72ff',
                [
                    [
                        '{"frame":["StartupSceneController.HandledException","UnityEngine.Events.InvokableCall.Invoke","UnityEngine.Events.UnityEvent.Invoke","UnityEngine.UI.Button.Press","UnityEngine.UI.Button.OnPointerClick","UnityEngine.EventSystems.ExecuteEvents.Execute","UnityEngine.EventSystems.StandaloneInputModule.ReleaseMouse","UnityEngine.EventSystems.StandaloneInputModule.ProcessMousePress","UnityEngine.EventSystems.StandaloneInputModule.ProcessMouseEvent","UnityEngine.EventSystems.StandaloneInputModule.Process","UnityEngine.EventSystems.EventSystem.Update"]}',
                    ],
                    ['0'],
                    [{ keys: 1, vals: [['1651675603', 1]] }],
                    [1651675603, 1651675603],
                    [[1608831212, 1660728993, 1]],
                    [],
                ],
                1,
            ],
        ],
        cardinalities: {
            initial: { rows: 341, groups: 19 },
            having: { rows: 341, groups: 19 },
            pagination: { rows: 341, groups: 19 },
        },
    },
};

const testSelectResponse: CoronerResponse<SelectQueryResponse<Attribute, string[]>> = {
    error: undefined,
    response: {
        toArray: () => {
            throw new Error('doopa');
        },
        first: () => {
            throw new Error('doopa');
        },
        version: '1.2.0',
        seq: 37,
        encoding: 'rle',
        columns: [
            ['timestamp', 'unix_timestamp'],
            ['fingerprint', 'sha256'],
            ['callstack', 'callstack'],
            ['randomInt', 'none'],
            ['_tx', ''],
            ['_deleted', ''],
        ],
        columns_desc: [
            { name: 'timestamp', format: 'unix_timestamp', type: 'uint64' },
            { name: 'fingerprint', format: 'sha256', type: 'dictionary' },
            { name: 'callstack', format: 'callstack', type: 'dictionary' },
            { name: 'randomInt', format: 'none', type: 'uint32' },
            { name: '_tx', format: '', type: 'uint64' },
            { name: '_deleted', format: '', type: 'bitmap' },
        ],
        pagination: { limit: 20, offset: 0 },
        order: [{ name: 'timestamp', order: 'descending' }],
        objects: [
            [
                '*',
                [
                    [341],
                    [340],
                    [339],
                    [338],
                    [337],
                    [336],
                    [335],
                    [334],
                    [333],
                    [332],
                    [331],
                    [330],
                    [329],
                    [328],
                    [327],
                    [326],
                    [325],
                    [324],
                    [323],
                    [322],
                ],
            ],
        ],
        values: [
            [
                '*',
                [1659368090, 1],
                [1659367946, 1],
                [1659367560, 1],
                [1659367381, 1],
                [1659367323, 1],
                [1659367312, 1],
                [1659109367, 1],
                [1658242333, 1],
                [1652113309, 1],
                [1652112748, 1],
                [1651811205, 2],
                [1651811199, 1],
                [1651811191, 1],
                [1651811177, 1],
                [1651783407, 1],
                [1651766652, 1],
                [1651766274, 1],
                [1651766087, 1],
                [1651681597, 1],
            ],
            [
                '*',
                ['d6eee36c3b255b27268091ad585e32e6bd9f9692eb8bb0c7f1cf3995cb8ff1bc', 2],
                ['0e2a4590cf070c5fbe86a9b000a27c414050f3347917fec191b8a70f2f3d83ee', 4],
                ['d6eee36c3b255b27268091ad585e32e6bd9f9692eb8bb0c7f1cf3995cb8ff1bc', 1],
                ['3adc2af686e2fcb63c74c4c778753e0eb0248374c14243a72a3f7b8a119dfaa2', 1],
                ['58785ec127bd48dc500da8972de467750178e5995e139733ac4fabae5da51ddd', 1],
                ['82c60b2309a8e16fda421e07483681e75242560bf0484d5c88c4fb575dde845f', 1],
                ['98728cd55a983f275f0d62819c3005fe7506a1c0c9bc52a87a93a8d3d10ee80c', 1],
                ['f2f558bafe87bff35387a31f8cd42cfa83d92ae1fa35d86fca66b888911d4e65', 1],
                ['58785ec127bd48dc500da8972de467750178e5995e139733ac4fabae5da51ddd', 1],
                ['fc76efcf8f3800e47f233bc86eacecc598daadae886872e853d474c1550f1d26', 1],
                ['3ce749a3d93e774420add136113c143ce8320795da569e26d6ad13ee10e1b0af', 1],
                ['b056f61acc4ec1eaf03f2d4df60ebe2911673536b7c89218374b0c1c762b38f7', 1],
                ['2a455dab41669d8b85ad2bfab6d47b010e4d0d76f7725182ca2a9af6f261ada5', 1],
                ['9984467d362daa8d037e81ac100acce3c10298f09111a7d1122b93e9579e2416', 1],
                ['58785ec127bd48dc500da8972de467750178e5995e139733ac4fabae5da51ddd', 1],
                ['ffe2703f36969f4d63d791bd5b680a284573d691c3125f3f59f803d6e8586ddc', 1],
            ],
            [
                '*',
                [
                    '{"frame":["getTargets","getDependencies","_createSubRequests","plan","Container._get","Container._getButThrowIfAsync","Container.get"]}',
                    2,
                ],
                [
                    '{"frame":["QueryFailedError.TypeORMError [as constructor]","new QueryFailedError","Statement.handler"]}',
                    4,
                ],
                [
                    '{"frame":["getTargets","getDependencies","_createSubRequests","plan","Container._get","Container._getButThrowIfAsync","Container.get"]}',
                    1,
                ],
                ['{"frame":["TCPConnectWrap.afterConnect [as oncomplete]"]}', 1],
                [
                    '{"frame":["System.IO.FileStream..ctor ","System.IO.File.OpenRead ","System.IO.File.ReadAllBytes ","UnityEngine.Events.UnityAction.Invoke ","UnityEngine.Events.UnityEvent.Invoke ","UnityEngine.EventSystems.ExecuteEvents+EventFunction`1[T1].Invoke ","UnityEngine.EventSystems.ExecuteEvents.Execute[T] ","UnityEngine.EventSystems.StandaloneInputModule.ProcessTouchPress ","UnityEngine.EventSystems.StandaloneInputModule.ProcessTouchEvents ","UnityEngine.EventSystems.StandaloneInputModule.Process ","UnityEngine.EventSystems.StandaloneInputModule:Process"]}',
                    1,
                ],
                [
                    '{"frame":["-[PLCrashReporter generateLiveReportWithThread:error:]","-[OomWatcher sendOomReports]","-[OomWatcher startOomIntegration]","-[OomWatcher initWithCrashReporter:andAttributes:andApi:andAttachments:]","-[Backtrace initWithBacktraceUrl:andAttributes:andOomSupport:andAttachments:andClientSideUnwinding:]","StartBacktraceIntegration","NativeClient_Start_m410B1199507CD2195F690D2B1AE90251278140C3","NativeClient_HandleNativeCrashes_mAF321A2B4A9DE1A4D53B8C5DAF943D77F9FF056C","NativeClient__ctor_m7F4390125CC24EECAD0A1874AC8022258E7FD206","NativeClientFactory_CreateNativeClient_m2C3A77DF9B1AE76DECE81E66E660D69A2D54F2A4","BacktraceClient_Refresh_mE23B1D973AE968302EA66CC6F8447151AC7B3713","RuntimeInvoker_TrueVoid_t22962CB4C05B1D89B55A6E1139F0E87A90987017(void (*)","il2cpp::vm::Runtime::Invoke","scripting_method_invoke","Invoke","InvokeChecked","CallMethod","CallAwake","AddToManager","AwakeFromLoad","InvokePersistentManagerAwake","PersistentManagerAwakeFromLoad","CompleteAwakeSequence","CompletePreloadManagerLoadScene","PlayerLoadSceneFromThread","CompleteLoadFirstScene","IntegrateMainThread","UpdatePreloadingSingleStep","UpdatePreloading","UnityPlayerLoopImpl","UnityRepaint","-[UnityAppController","CA::Display::DisplayLink::dispatch_items","display_timer_callback","GSEventRunModal","-[UIApplication _run]","UIApplicationMain","-[UnityFramework runUIApplicationMainWithArgc:argv:]","main"]}',
                    1,
                ],
                [
                    '{"frame":["StartupSceneController.HandledException","UnityEngine.Events.UnityAction.Invoke","UnityEngine.Events.UnityEvent.Invoke","UnityEngine.EventSystems.ExecuteEvents+EventFunction`1[T1].Invoke","UnityEngine.EventSystems.ExecuteEvents.Execute","UnityEngine.EventSystems.StandaloneInputModule.ProcessTouchPress","UnityEngine.EventSystems.StandaloneInputModule.ProcessTouchEvents","UnityEngine.EventSystems.StandaloneInputModule.Process"]}',
                    1,
                ],
                [
                    '{"frame":["System.IO.FileStream.ctor","System.IO.File.OpenRead","System.IO.File.ReadAllBytes","StartupSceneController.HandledException","UnityEngine.Events.UnityAction.Invoke","UnityEngine.Events.UnityEvent.Invoke","UnityEngine.EventSystems.ExecuteEvents+EventFunction`1[T1].Invoke","UnityEngine.EventSystems.ExecuteEvents.Execute","UnityEngine.EventSystems.StandaloneInputModule.ProcessTouchPress","UnityEngine.EventSystems.StandaloneInputModule.ProcessTouchEvents","UnityEngine.EventSystems.StandaloneInputModule.Process"]}',
                    1,
                ],
                [
                    '{"frame":["System.IO.FileStream..ctor ","System.IO.File.OpenRead ","System.IO.File.ReadAllBytes ","UnityEngine.Events.UnityAction.Invoke ","UnityEngine.Events.UnityEvent.Invoke ","UnityEngine.EventSystems.ExecuteEvents+EventFunction`1[T1].Invoke ","UnityEngine.EventSystems.ExecuteEvents.Execute[T] ","UnityEngine.EventSystems.StandaloneInputModule.ProcessTouchPress ","UnityEngine.EventSystems.StandaloneInputModule.ProcessTouchEvents ","UnityEngine.EventSystems.StandaloneInputModule.Process ","UnityEngine.EventSystems.StandaloneInputModule:Process"]}',
                    1,
                ],
                [
                    '{"frame":["__psynch_cvwait","CA::Display::DisplayLink::dispatch_items","display_timer_callback","GSEventRunModal","-[UIApplication _run]","UIApplicationMain","main"]}',
                    1,
                ],
                [
                    '{"frame":["__pthread_kill","abort","CA::Display::DisplayLink::dispatch_items","display_timer_callback","GSEventRunModal","-[UIApplication _run]","UIApplicationMain","main"]}',
                    1,
                ],
                [
                    '{"frame":["CA::Display::DisplayLink::dispatch_items","display_timer_callback","GSEventRunModal","-[UIApplication _run]","UIApplicationMain","main"]}',
                    1,
                ],
                [
                    '{"frame":["__pthread_kill","abort","DiagnosticsUtils_Bindings::ForceCrash","Utils_CUSTOM_ForceCrash","_UnityAction_Invoke_mC9FF5AA1F82FDE635B3B6644CE71C94C31C3E71A","_UnityEvent_Invoke_mB2FA1C76256FE34D5E7F84ABE528AC61CE8A0325","_EventFunction_1_Invoke_m7899B7663B08CD474B8FADD9D85FF446CD839FE6_gshared","_ExecuteEvents_Execute_TisRuntimeObject_mDA4CD02F963B6939F8D079993DC2DCD75AB524DD_gshared","_StandaloneInputModule_ProcessTouchPress_m74A52DA64B9C5EB8B5A38889F25BFEAFC284FB51","_StandaloneInputModule_ProcessTouchEvents_mFEED66642E804A218DD34A9C5F0F8EAA5CA3B019","_StandaloneInputModule_Process_mBF40EA3762B85C417E6F88D531174D05A7FFCE75","RuntimeInvoker_TrueVoid_t22962CB4C05B1D89B55A6E1139F0E87A90987017(void (*)","il2cpp::vm::Runtime::Invoke","scripting_method_invoke","ScriptingInvocation::Invoke","MonoBehaviour::CallUpdateMethod","void BaseBehaviourManager::CommonUpdate<BehaviourManager>","ExecutePlayerLoop","PlayerLoop","UnityPlayerLoopImpl","_UnityRepaint","-[UnityAppController","CA::Display::DisplayLink::dispatch_items","display_timer_callback","<redacted>","_CFRunLoopRunSpecific","GSEventRunModal","-[UIApplication _run]","UIApplicationMain","-[UnityFramework runUIApplicationMainWithArgc:argv:]","main"]}',
                    1,
                ],
                [
                    '{"frame":["__abort","vsnprintf_l","CA::Display::DisplayLink::dispatch_items","display_timer_callback","GSEventRunModal","-[UIApplication _run]","UIApplicationMain","main"]}',
                    1,
                ],
                [
                    '{"frame":["System.IO.FileStream..ctor ","System.IO.File.OpenRead ","System.IO.File.ReadAllBytes ","UnityEngine.Events.UnityAction.Invoke ","UnityEngine.Events.UnityEvent.Invoke ","UnityEngine.EventSystems.ExecuteEvents+EventFunction`1[T1].Invoke ","UnityEngine.EventSystems.ExecuteEvents.Execute[T] ","UnityEngine.EventSystems.StandaloneInputModule.ProcessTouchPress ","UnityEngine.EventSystems.StandaloneInputModule.ProcessTouchEvents ","UnityEngine.EventSystems.StandaloneInputModule.Process ","UnityEngine.EventSystems.StandaloneInputModule:Process"]}',
                    1,
                ],
                [
                    '{"frame":["System.IO.FileStream..ctor "," System.IO.FileStream..ctor","System.IO.File.OpenRead ","System.IO.File.ReadAllBytes ","StartupSceneController.ReadFile ","StartupSceneController.InternalFileReader ","StartupSceneController.UnhandledException ","UnityEngine.Events.InvokableCall.Invoke ","UnityEngine.Events.UnityEvent.Invoke ","UnityEngine.UI.Button.Press ","UnityEngine.UI.Button.OnPointerClick ","UnityEngine.EventSystems.ExecuteEvents.Execute ","UnityEngine.EventSystems.ExecuteEvents.Execute[T] ","UnityEngine.EventSystems.EventSystem:Update"]}',
                    1,
                ],
            ],
            ['*', [0, 20]],
            [
                '*',
                [341, 1],
                [340, 1],
                [339, 1],
                [338, 1],
                [337, 1],
                [336, 1],
                [335, 1],
                [334, 1],
                [333, 1],
                [332, 1],
                [331, 1],
                [330, 1],
                [329, 1],
                [328, 1],
                [327, 1],
                [326, 1],
                [325, 1],
                [324, 1],
                [323, 1],
                [322, 1],
            ],
            ['*', [0, 8], [1, 12]],
        ],
    },
};
