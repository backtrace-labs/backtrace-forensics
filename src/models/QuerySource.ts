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
     * Project to use. Will be used as a `project` param in `/api/query` call.
     * @example
     * source.project = 'coroner';
     */
    project: string;
}
