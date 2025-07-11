import {
    BacktraceForensics,
    Filters,
    FoldOperator,
    FoldedCoronerQuery,
    QuerySource,
    SelectedCoronerQuery,
} from '@backtrace/forensics';
import { stdin as input, stdout as output } from 'process';
import readline from 'readline';

const rl = readline.createInterface({ input, output });

const source: QuerySource = {
    address: 'http://yolo.sp.backtrace.io',
    token: 'f8a3b7cdd86417c38ff4d4ae513a48c5',
    project: 'salex',
};

let args = [...process.argv.slice(2)];

async function question(msg: string) {
    return new Promise<string>((resolve) => {
        const arg = args.shift();
        if (arg != null) {
            console.log(msg, arg);
            return resolve(arg);
        }

        rl.question(msg, resolve);
    });
}

async function displayDetails(query: FoldedCoronerQuery | SelectedCoronerQuery) {
    const request = query.json();
    console.log('Request: ', JSON.stringify(request, null, '\t'));

    const result = await query.post();
    if (!result.success) {
        throw new Error(`${result.json().error.message} (${result.json().error.code})`);
    }

    console.log('Response: ', JSON.stringify(result.json(), null, '\t'));
    console.log('Rows: ', JSON.stringify(result.all(), null, '\t'));
}

async function staticSelect() {
    const fp = await question('enter fingerprint: ');

    const query = BacktraceForensics.create({ defaultSource: source })
        .filter('fingerprint', 'equal', fp)
        .filter('timestamp', Filters.time.last.day())
        // .fold('callstack', 'bin')
        .select('callstack', 'randomInt', 'fingerprint')
        .select('awdwad');

    const response = await query.post();
    if (response.success) {
        response.first()?.values;
    }

    await displayDetails(query);
}

async function select() {
    const query = BacktraceForensics.create({ defaultSource: source });
    const fp = await question('enter fingerprint: ');

    let selectQuery = query.filter('fingerprint', 'equal', fp).select();

    const keysStr = await question('enter comma-delimited keys to select on: ');
    const keys = keysStr.split(',');

    for (const key of keys) {
        selectQuery = selectQuery.select(key);
    }

    const response = await selectQuery.post();
    if (response.success) {
        response.first()?.values;
    }

    await displayDetails(selectQuery);
}

async function fold() {
    const fp = await question('enter fingerprint: ');

    const groupStr = await question('enter key to group on: ');
    const keysStr = await question('enter comma-delimited keys to fold on: ');
    const opStr = [await question('enter operator: ')] as FoldOperator;

    let query = BacktraceForensics.create({ defaultSource: source }).group(groupStr);

    for (const key of keysStr.split(',')) {
        query = query.fold(key, ...opStr);
    }

    if (fp) {
        query = query.filter('fingerprint', 'equal', fp);
    }

    // const response = await query.post();
    await displayDetails(query);
}

async function staticFold() {
    const fp = await question('enter fingerprint: ');

    const query = BacktraceForensics.create({ defaultSource: source })
        .filter('fingerprint', 'equal', fp)
        .fold('callstack', 'head')
        .fold('fingerprint', 'head')
        .fold('timestamp', 'min')
        .fold('timestamp', 'range')
        .fold('randomInt', 'distribution', 3)
        .group('randomInt');

    const response = await query.post();
    if (response.success) {
        response.first()!.attributes.randomInt.groupKey;
    }
    await displayDetails(query);
}

(async () => {
    const choice = await question('select/staticSelect/fold/staticFold: ');
    switch (choice) {
        case 'select':
            await select();
            break;
        case 'staticSelect':
            await staticSelect();
            break;
        case 'fold':
            await fold();
            break;
        case 'staticFold':
            await staticFold();
            break;
        default:
            throw new Error('invalid option');
    }

    process.exit(0);
})();
