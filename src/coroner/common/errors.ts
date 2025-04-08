import { CoronerErrorResponse } from './responses';

export class CoronerError extends Error {
    constructor(public readonly response: CoronerErrorResponse, message?: string) {
        super(message ?? response.message);
    }

    public static ofResponse(response: CoronerErrorResponse): CoronerError {
        if (response.message === 'invalid token') {
            return new InvalidTokenError(response);
        }

        if (response.message.startsWith('no such universe')) {
            const universe = response.message.match(/'(.+)'/)?.[1] ?? '<unknown>';
            return new UniverseNotFoundError(response, universe);
        }

        if (response.message.startsWith('no such project')) {
            const project = response.message.match(/'(.+)'/)?.[1] ?? '<unknown>';
            return new ProjectNotFoundError(response, project);
        }

        if (response.message.startsWith('invalid parameter')) {
            const parameter = response.message.match(/'(.+)'/)?.[1] ?? '<unknown>';
            switch (parameter) {
                case 'table':
                    return new InvalidTableError(response);
                default:
                    return new InvalidParameterError(response, parameter);
            }
        }

        if (response.message === 'regexec unsupported') {
            return new InvalidFilterError(response);
        }

        if (response.message.includes('column not found')) {
            if (response.message.startsWith('Filter column not found')) {
                return new FilterColumnNotFoundError(response);
            }

            if (response.message.startsWith('aggregation column not found')) {
                return new AggregationColumnNotFoundError(response);
            }

            if (response.message.includes('backing column not found')) {
                if (response.message.includes('quantize_uint')) {
                    return new QuantizeUintBackingColumnNotFoundError(response);
                } else if (response.message.includes('truncate_timestamp')) {
                    return new TruncateTimestampBackingColumnNotFoundError(response);
                }

                return new BackingColumnNotFoundError(response);
            }

            if (response.message === 'column not found for aggregate value term') {
                return new AggregateTermColumnNotFoundError(response);
            }

            if (response.message === 'index not found for aggregate value term') {
                return new AggregateTermIndexNotFoundError(response);
            }

            return new ColumnNotFoundError(response);
        }

        if (response.message.startsWith('Query must contain at least one filter that rejects missing data')) {
            return new MissingFilterError(response);
        }

        if (response.message === 'truncate_timestamp vcol: unrecognized granularity') {
            return new TruncateTimestampInvalidGranularityError(response);
        }

        if (response.message === 'offset must be positive') {
            return new InvalidOffsetError(response);
        }

        if (response.message === 'limit must be positive') {
            return new InvalidLimitError(response);
        }

        if (response.message === 'Template not found') {
            return new TemplateNotFoundError(response);
        }

        return new CoronerError(response);
    }
}

export class InvalidTokenError extends CoronerError {
    constructor(response: CoronerErrorResponse) {
        super(response);
    }
}

export class InvalidInputError extends CoronerError {
    constructor(response: CoronerErrorResponse) {
        super(response);
    }
}

export class NotFoundError extends CoronerError {
    constructor(response: CoronerErrorResponse) {
        super(response);
    }
}

export class UniverseNotFoundError extends NotFoundError {
    constructor(response: CoronerErrorResponse, public readonly universe: string) {
        super(response);
    }
}

export class ProjectNotFoundError extends NotFoundError {
    constructor(response: CoronerErrorResponse, public readonly project: string) {
        super(response);
    }
}

export class TemplateNotFoundError extends NotFoundError {
    constructor(response: CoronerErrorResponse) {
        super(response);
    }
}

export class ColumnNotFoundError extends NotFoundError {
    constructor(response: CoronerErrorResponse) {
        super(response);
    }
}

export class FilterColumnNotFoundError extends ColumnNotFoundError {
    constructor(response: CoronerErrorResponse) {
        super(response);
    }
}

export class AggregationColumnNotFoundError extends ColumnNotFoundError {
    constructor(response: CoronerErrorResponse) {
        super(response);
    }
}

export class BackingColumnNotFoundError extends ColumnNotFoundError {
    constructor(response: CoronerErrorResponse) {
        super(response);
    }
}

export class AggregateTermColumnNotFoundError extends ColumnNotFoundError {
    constructor(response: CoronerErrorResponse) {
        super(response);
    }
}

export class AggregateTermIndexNotFoundError extends NotFoundError {
    constructor(response: CoronerErrorResponse) {
        super(response);
    }
}

export class MissingFilterError extends InvalidInputError {
    constructor(response: CoronerErrorResponse) {
        super(response);
    }
}

export class InvalidFilterError extends InvalidInputError {
    constructor(response: CoronerErrorResponse) {
        super(response);
    }
}

export class TruncateTimestampBackingColumnNotFoundError extends BackingColumnNotFoundError {
    constructor(response: CoronerErrorResponse) {
        super(response);
    }
}

export class TruncateTimestampInvalidGranularityError extends InvalidInputError {
    constructor(response: CoronerErrorResponse) {
        super(response);
    }
}

export class QuantizeUintBackingColumnNotFoundError extends BackingColumnNotFoundError {
    constructor(response: CoronerErrorResponse) {
        super(response);
    }
}

export class InvalidParameterError extends InvalidInputError {
    constructor(response: CoronerErrorResponse, public readonly parameter: string) {
        super(response);
    }
}

export class InvalidOffsetError extends InvalidInputError {
    constructor(response: CoronerErrorResponse) {
        super(response);
    }
}

export class InvalidLimitError extends InvalidInputError {
    constructor(response: CoronerErrorResponse) {
        super(response);
    }
}

export class InvalidTableError extends InvalidParameterError {
    constructor(response: CoronerErrorResponse) {
        super(response, 'table');
    }
}
