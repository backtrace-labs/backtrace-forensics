import { Filters } from 'backtrace-forensics';
import { instance } from './instance';

(async () => {
    const response = await instance
        .limit(null)
        .filter('timestamp', Filters.time.from.last.days(7).to.now())
        .fold('callstack', 'head')
        .fold('version', 'tail')
        .post();

    if (!response.success) {
        console.error(response.json().error.message);
        return;
    }

    console.log(response.all().fold('callstack', 'head'));
    console.log(response.all().rows.map((r) => r.attributes.callstack.head?.[0].value));
})();
