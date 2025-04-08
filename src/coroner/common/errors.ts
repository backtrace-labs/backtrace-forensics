import { CoronerErrorResponse } from './responses';

export class CoronerError extends Error {
    public readonly code: number;

    constructor(error: CoronerErrorResponse) {
        super(error.message);
        this.code = error.code;
    }
}
