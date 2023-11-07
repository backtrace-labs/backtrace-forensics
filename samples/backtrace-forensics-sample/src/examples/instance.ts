import { BacktraceForensics } from '@backtrace/forensics';

export const instance = BacktraceForensics.create({
    defaultSource: {
        address: 'https://sample.sp.backtrace.io',
        project: 'project',
        token: 'query token here',
    },
});
