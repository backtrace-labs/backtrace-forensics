import { Filters } from '@backtrace/forensics';
import { instance } from './instance';

(async () => {
    const response = await instance
        .limit(null)
        .filter('timestamp', Filters.time.from.last.days(7).to.now())
        .select('callstack', 'version')
        .post();

    if (!response.success) {
        console.error(response.json().error.message);
        return;
    }

    console.log(response.all().select('callstack'));
    console.log(response.all().rows.map((r) => r.values.callstack));
})();
