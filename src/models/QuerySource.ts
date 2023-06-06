export interface QuerySource {
    /**
     * Address of the Coroner instance. Will be used in `X-Coroner-Location` header.
     * @example
     * source.address = 'https://yolo.sp.backtrace.io';
     */
    address: string;

    /**
     * If specified, will use this instead of `address` in the `X-Coroner-Location` header.
     * @example
     * source.location = 'https://yolo.sp.backtrace.io';
     */
    location?: string;

    /**
     * Coroner token to use.
     * @example
     * source.token = '00112233445566778899AABBCCDDEEFF';
     */
    token: string;

    /**
     * Project to use. Will be used as a `project` param.
     * @example
     * source.project = 'coroner';
     */
    project: string;

    /**
     * Universe to use. Will be used as a `universe` param.
     * @example
     * source.universe = 'backtrace';
     */
    universe?: string;

    /**
     * Additional headers to use.
     */
    headers?: Record<string, string>;

    /**
     * Additional params to use.
     */
    params?: Record<string, string | string[]>;
}
