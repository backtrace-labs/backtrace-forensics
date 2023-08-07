import { DeferredUpdateIssuesRequest, UpdateIssuesRequest } from '../../../coroner';
import { CoronerIssueInfo } from './getIssueInformation';

export function undeferRequestForRow(request: DeferredUpdateIssuesRequest) {
    return function undeferRequestForRow(row: CoronerIssueInfo): UpdateIssuesRequest {
        return {
            ...request,
            fingerprint: [row.fingerprint],
            project: row.project,
            ticket: request.ticket
                ? {
                      ...request.ticket,
                      value: request.ticket.value(row.tickets ?? []),
                  }
                : undefined,
            tags: request.tags
                ? {
                      ...request.tags,
                      value: request.tags
                          .value(row.tags ?? '')
                          .split(' ')
                          .sort((a, b) => a.localeCompare(b))
                          .join(' '),
                  }
                : undefined,
        };
    };
}
