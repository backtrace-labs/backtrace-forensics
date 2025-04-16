import { FoldOperator } from '../coroner';

export class ForensicsError extends Error {}

export class MissingFieldError extends ForensicsError {
    constructor(message: string, public readonly field: string) {
        super(message);
    }
}

export class MissingProjectError extends MissingFieldError {
    constructor() {
        super('Coroner project is not available.', 'project');
    }
}

export class MissingAddressError extends MissingFieldError {
    constructor() {
        super('Coroner address is not available.', 'address');
    }
}

export class MissingLimitError extends MissingFieldError {
    constructor() {
        super('Limit is not defined.', 'limit');
    }
}

export class NoAttributeError extends ForensicsError {
    constructor(public readonly attribute: string, message?: string) {
        super(message ?? `Attribute ${attribute} does not exist.`);
    }
}

export class AttributeNotFoldedError extends NoAttributeError {
    constructor(public readonly attribute: string, operator: FoldOperator) {
        super(attribute, `Attribute ${attribute} does not exist or was not folded on ${JSON.stringify(operator)}.`);
    }
}

export class AttributeNotGroupedError extends NoAttributeError {
    constructor(public readonly attribute: string) {
        super(attribute, `Attribute ${attribute} does not exist or was not grouped.`);
    }
}

export class AmbiguousFoldError extends ForensicsError {
    constructor() {
        super(
            'Ambiguous results found. This can happen when there are two columns with the same fold operator. ' +
                'Try providing the built request to the simple response builder.',
        );
    }
}
