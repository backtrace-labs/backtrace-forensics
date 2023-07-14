import { Filters } from '@backtrace/forensics';
import { instance } from './instance';

const query = instance.filter('timestamp', Filters.time.from.last.days(7).to.now()).select('callstack', 'version');

const queryObj = query.json();

// You can post this exact request to Coroner and it will return the same values as Forensics
const json = JSON.stringify(queryObj, null, '\t');
console.log(json);
