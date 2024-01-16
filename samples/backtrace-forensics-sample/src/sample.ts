import { BacktraceForensics, Filters } from '@backtrace/forensics';

// (async () => {
//     const response = await BacktraceForensics.create({
//         defaultSource: {
//             address: 'https://yolo.sp.backtrace.io',
//             token: 'de0161ac382986a0bfb09a1bfe7e5052c4a53b97178c8b7b11916c4a139f1398',
//             project: 'salex',
//         },
//     })
//         .filter('timestamp', 'at-least', '1660054293.')
//         .fold('hostname', 'unique')
//         .group('fingerprint')
//         .fold('timestamp', 'head')
//         .order('hostname', 'ascending', 'unique')
//         .template('workflows')
//         .post();

//     if (response.error) {
//         throw new Error(response.error.message);
//     }

//     console.log(response.response);
//     const all = response.response.all();
//     console.log(all.tryFold('blabla', 'head'));
//     const rows = all.rows;
//     console.log(rows[0].fold('timestamp', 'head'));
//     console.log(all.fold('timestamp', 'head'));
//     // for(const row of rows.) {
//     //     console.log(row?.attributes.timestamp.head[0].value);
//     //     console.log(row?.fold('hostname', 'unique'));
//     // }
// })();

(async () => {
    // const date = new Date(1660054293000);

    const request = BacktraceForensics.create({
        defaultSource: {
            address: 'https://yolo.sp.backtrace.io',
            token: 'de0161ac382986a0bfb09a1bfe7e5052c4a53b97178c8b7b11916c4a139f1398',
            project: 'salex',
        },
    })
        .limit(2)
        // .offset(20)
        .filter('timestamp', Filters.time.from.last.days(90).to.now())
        .filter('uname.sysname', 'not-equal', '中文')
        // .filter('_tx', Filters.range(100, 200))
        .select('timestamp', 'hostname', 'fingerprint');

    console.log(JSON.stringify(request.json(), null, '\t'));
    const response = await request.post();

    if (!response.success) {
        throw new Error(response.json().error.message);
    }

    let nextPageRequest = response.nextPage();
    console.log('next page', JSON.stringify(nextPageRequest.json(), null, '\t'));
    nextPageRequest = nextPageRequest.filter('callstack', 'contains', 'asasd');
    const nextPageResponse = await nextPageRequest.post();

    console.log(response.first());
})();
