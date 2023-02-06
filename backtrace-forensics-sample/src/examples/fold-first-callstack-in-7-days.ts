import { Filters } from 'backtrace-forensics';
import { instance } from './instance';

(async () => {
    const response = await instance
        .filter('timestamp', Filters.time.from.last.days(7).to.now())
        .fold('callstack', 'head')
        .fold('version', 'tail')
        .post();

    if (!response.success) {
        console.error(response.json().error.message);
        return;
    }

    console.log(response.first()?.fold('callstack', 'head'));
    console.log(response.first()?.attributes.callstack.head?.[0].value);
})();
