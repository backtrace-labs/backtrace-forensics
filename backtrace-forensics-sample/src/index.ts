import { stdin as input, stdout as output } from 'process';
import readline from 'readline';
import { BacktraceForensics, QuerySource } from '../../lib';
import { CoronerValueType } from '../../lib/requests/common';
import { FoldOperator } from '../../lib/requests/fold';

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

async function displayDetails(query: any) {
    const request = query.getRequest();
    console.log('Request: ', JSON.stringify(request, null, '\t'));

    const result = await query.getResponse();
    if (result.error) {
        throw new Error(`${result.error.message} (${result.error.code})`);
    }

    console.log('Response: ', JSON.stringify(result.response, null, '\t'));
    console.log('Rows: ', JSON.stringify(result.response.rows(), null, '\t'));
}

async function staticSelect() {
    const fp = await question('enter fingerprint: ');

    const query = BacktraceForensics.create({ defaultSource: source })
        .filter('fingerprint', 'equal', fp)
        .select('callstack', 'randomInt', 'fingerprint');

    const response = await query.getResponse();
    if (!response.error) {
        response.response.first()?.values.fingerprint;
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

    await displayDetails(selectQuery);
}

async function fold() {
    const fp = await question('enter fingerprint: ');

    const groupStr = await question('enter key to group on: ');
    const keysStr = await question('enter comma-delimited keys to fold on: ');
    const opStr = [await question('enter operator: ')] as FoldOperator<CoronerValueType>;

    let query = BacktraceForensics.create({ defaultSource: source }).fold().group(groupStr);

    for (const key of keysStr.split(',')) {
        query = query.fold(key, ...opStr);
    }

    if (fp) {
        query = query.filter('fingerprint', 'equal', fp);
    }

    // const response = await query.getResponse();
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
        .group('asdasd'); // TODO: Fix the group not appearing in attributes when it is not folded on

    // const response = await query.getResponse();
    // if (!response.error) {
    //     response.response.first()?.attributes.
    // }
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
