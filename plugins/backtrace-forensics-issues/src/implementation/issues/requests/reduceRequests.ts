import { UpdateIssuesRequest } from '../../../coroner';

export function reduceRequests(requests: UpdateIssuesRequest[]): UpdateIssuesRequest[] {
    // For now, do the simplest hashing possible
    function getHash(req: UpdateIssuesRequest) {
        type TempRequest = { fingerprint?: UpdateIssuesRequest['fingerprint'] };
        const withoutFingerprint = { ...req } as TempRequest;
        delete withoutFingerprint['fingerprint'];
        return JSON.stringify(withoutFingerprint);
    }

    return [
        ...requests
            .reduce((map, req) => {
                const hash = getHash(req);
                const existing = map.get(hash);
                if (existing) {
                    map.set(hash, {
                        ...existing,
                        fingerprint: [...new Set([...existing.fingerprint, ...req.fingerprint])],
                    });
                } else {
                    map.set(getHash(req), req);
                }

                return map;
            }, new Map<string, UpdateIssuesRequest>())
            .values(),
    ];
}
