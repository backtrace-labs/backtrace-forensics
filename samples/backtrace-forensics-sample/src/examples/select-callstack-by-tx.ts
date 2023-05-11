import { instance } from './instance';

(async () => {
    const response = await instance.filter('_tx', 'equal', 12345).select('callstack', 'version').post();
    if (!response.success) {
        console.error(response.json().error.message);
        return;
    }

    console.log(response.first()?.select('callstack'));
    console.log(response.first()?.values.callstack);
})();
