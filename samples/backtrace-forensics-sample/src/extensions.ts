import BacktraceForensics from 'backtrace-forensics';
import 'backtrace-forensics-plugin-sample'; // Imports plugin methods
import 'backtrace-forensics-plugin-sample-2'; // Imports plugin methods

const selectQuery = BacktraceForensics.create()
    .filterAbcNotEmpty() // A plugin method imported from 'backtrace-forensics-plugin-sample-2'
    .selectKeys({ a: 123 }) // A plugin method imported from 'backtrace-forensics-plugin-sample'
    .select()
    .selectAbc() // A plugin method imported from 'backtrace-forensics-plugin-sample-2'
    .json();

console.log(JSON.stringify(selectQuery, null, '\t'));

const foldQuery = BacktraceForensics.create()
    .foldAbcHead() // A plugin method imported from 'backtrace-forensics-plugin-sample-2'
    .havingAbcHead('equal', 'test') // A plugin method imported from 'backtrace-forensics-plugin-sample-2'
    .filterAbcNotEmpty() // A plugin method imported from 'backtrace-forensics-plugin-sample-2'
    .foldHead('x', 'y', 'z') // A plugin method imported from 'backtrace-forensics-plugin-sample-1'
    .json();

console.log(JSON.stringify(foldQuery, null, '\t'));
