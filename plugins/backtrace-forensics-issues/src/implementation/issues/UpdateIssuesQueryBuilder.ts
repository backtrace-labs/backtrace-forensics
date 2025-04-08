import {
    CoronerError,
    CoronerQuery,
    FoldCoronerQuery,
    IssueInvariant,
    QuerySource,
    TicketState,
} from '@backtrace/forensics';
import { DeferredUpdateIssuesRequest } from '../../coroner/issues/deferredRequests';
import { UpdateIssuesQuery } from '../../coroner/issues/query';
import { UpdateTicketRequest, UpdateTicketUserRequest } from '../../coroner/issues/requests';
import { IssueResults } from '../../coroner/issues/results';
import { PostRequests } from './post';
import {
    addAssignees,
    addTags,
    addTickets,
    clearAssignees,
    removeAssignees,
    removeTags,
    removeTickets,
    setAssignees,
    setInProgress,
    setMuted,
    setMutedUntil,
    setOpen,
    setResolved,
    setResolvedUntil,
    setState,
    setStateWithInvariants,
    setTags,
    setTickets,
} from './query';
import { GetRequests, IssueRequestsResult } from './requests/getRequests';
import { toResults } from './results';
import { Result } from '@backtrace/utils';

export class UpdateIssuesQueryBuilder implements UpdateIssuesQuery {
    readonly #query: CoronerQuery | FoldCoronerQuery;
    readonly #request: DeferredUpdateIssuesRequest;

    readonly #requestsProvider: GetRequests;
    readonly #requestsPoster: PostRequests;
    readonly #buildSelf: (
        fn: (request: DeferredUpdateIssuesRequest) => DeferredUpdateIssuesRequest,
    ) => UpdateIssuesQueryBuilder;

    constructor(
        query: CoronerQuery | FoldCoronerQuery,
        request: DeferredUpdateIssuesRequest,
        requestsProvider: GetRequests,
        requestPoster: PostRequests,
    ) {
        this.#requestsPoster = requestPoster;
        this.#requestsProvider = requestsProvider;
        this.#request = request;
        this.#query = query;
        this.#buildSelf = (fn) => new UpdateIssuesQueryBuilder(query, fn(request), requestsProvider, requestPoster);
    }

    public setTags(...tags: string[]): UpdateIssuesQuery {
        return this.#buildSelf(setTags(...tags));
    }

    public addTags(...tags: string[]): UpdateIssuesQuery {
        return this.#buildSelf(addTags(...tags));
    }

    public removeTags(...tags: string[]): UpdateIssuesQuery {
        return this.#buildSelf(removeTags(...tags));
    }

    public clearAssignees(): UpdateIssuesQuery {
        return this.#buildSelf(clearAssignees);
    }

    public setAssignees(...users: UpdateTicketUserRequest[]): UpdateIssuesQuery {
        return this.#buildSelf(setAssignees(...users));
    }

    public addAssignees(...users: UpdateTicketUserRequest[]): UpdateIssuesQuery {
        return this.#buildSelf(addAssignees(...users));
    }

    public removeAssignees(predicate: (ticket: UpdateTicketUserRequest) => boolean): UpdateIssuesQuery {
        return this.#buildSelf(removeAssignees(predicate));
    }

    public setState(state: TicketState): UpdateIssuesQuery {
        return this.#buildSelf(setState(state));
    }

    public setStateWithInvariants(state: TicketState, invariants: IssueInvariant[]): UpdateIssuesQuery {
        return this.#buildSelf(setStateWithInvariants(state)(...invariants));
    }

    public setOpen(): UpdateIssuesQuery {
        return this.#buildSelf(setOpen);
    }

    public setInProgress(): UpdateIssuesQuery {
        return this.#buildSelf(setInProgress);
    }

    public setResolved(): UpdateIssuesQuery {
        return this.#buildSelf(setResolved);
    }

    public setMuted(): UpdateIssuesQuery {
        return this.#buildSelf(setMuted);
    }

    public setResolvedUntil(...invariants: IssueInvariant[]): UpdateIssuesQuery {
        return this.#buildSelf(setResolvedUntil(...invariants));
    }

    public setMutedUntil(...invariants: IssueInvariant[]): UpdateIssuesQuery {
        return this.#buildSelf(setMutedUntil(...invariants));
    }

    public setTickets(...tickets: UpdateTicketRequest[]): UpdateIssuesQuery {
        return this.#buildSelf(setTickets(...tickets));
    }

    public addTickets(...tickets: UpdateTicketRequest[]): UpdateIssuesQuery {
        return this.#buildSelf(addTickets(...tickets));
    }

    public removeTickets(predicate: (ticket: UpdateTicketRequest) => boolean): UpdateIssuesQuery {
        return this.#buildSelf(removeTickets(predicate));
    }

    public json(source?: Partial<QuerySource>): Promise<Result<IssueRequestsResult, CoronerError>> {
        return this.#requestsProvider(this.#request, this.#query, source);
    }

    public async post(source?: Partial<QuerySource>): Promise<Result<IssueResults, CoronerError>> {
        const requestsResult = await this.json(source);
        if (Result.isErr(requestsResult)) {
            return requestsResult;
        }

        const responses = await this.#requestsPoster(requestsResult.data.requests, source);
        return toResults(requestsResult.data.queryResult, responses);
    }
}
