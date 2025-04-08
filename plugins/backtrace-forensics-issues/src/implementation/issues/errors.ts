import { CoronerError, CoronerErrorResponse } from '@backtrace/forensics';

export class FailedQueryError extends CoronerError {
    constructor(response: CoronerErrorResponse) {
        super(response);
    }
}
