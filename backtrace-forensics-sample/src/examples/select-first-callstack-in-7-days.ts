import { Filters } from 'backtrace-forensics';
import { instance } from './instance';

(async () => {
    const response = await instance
        .filter('timestamp', Filters.time.from.last.days(7).to.now())
        .select('callstack', 'version')
        .post();

    if (!response.success) {
        console.error(response.json().error.message);
        return;
    }

    console.log(response.first()?.select('callstack'));
    console.log(response.first()?.values.callstack);
})();
