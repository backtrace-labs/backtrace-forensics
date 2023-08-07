import assert from 'assert';
import { TicketState } from '../../../lib';
import { DeferredUpdateIssuesRequest } from '../src/coroner/issues/deferredRequests';
import { UpdateInvariantsRequest, UpdateTicketRequest } from '../src/coroner/issues/requests';
import { pipeRequest, setInvariants, setState, updateTags, updateTickets } from '../src/implementation/issues/query';
import { Invariants } from '../src/invariants/invariants';

describe('query functions', () => {
    describe('tags', () => {
        describe('updateTags', () => {
            it('should set tag request', () => {
                const expected: DeferredUpdateIssuesRequest = {
                    tags: {
                        action: 'set',
                        value: expect.any(Function),
                    },
                };

                const request: DeferredUpdateIssuesRequest = {};
                const actual = updateTags(() => ['a', 'b', 'c'])(request);

                expect(actual).toEqual(expected);
            });

            it('should set tags to new tags', () => {
                const expected = ['a', 'b', 'c'];

                const request: DeferredUpdateIssuesRequest = {};
                const newRequest = updateTags(() => ['a', 'b', 'c'])(request);

                assert(newRequest.tags);
                const actual = newRequest.tags.value('');

                expect(actual.split(' ')).toEqual(expected);
            });

            it('should set tags split by whitespace', () => {
                const expected = ['a', 'b', 'c'];

                const request: DeferredUpdateIssuesRequest = {};
                const newRequest = updateTags(() => ['a b ', '  c  '])(request);

                assert(newRequest.tags);
                const actual = newRequest.tags.value('');

                expect(actual.split(' ')).toEqual(expected);
            });

            it('should set unique tags when same tags are added', () => {
                const expected = ['a', 'b', 'c'];

                const request: DeferredUpdateIssuesRequest = {};
                const newRequest = updateTags(() => ['a', 'b', 'c', 'b', 'a'])(request);

                assert(newRequest.tags);
                const actual = newRequest.tags.value('');

                expect(actual.split(' ')).toEqual(expected);
            });

            it('should set tags to new tags when chained multiple times', () => {
                const expected = ['a', 'b', 'c', 'x', 'y', 'z', '1', '2', '3'];

                const request: DeferredUpdateIssuesRequest = {};
                const newRequest = pipeRequest(
                    request,
                    updateTags((tags) => [...tags, 'x', 'y', 'z']),
                    updateTags((tags) => [...tags, '1', '2', '3']),
                    updateTags((tags) => ['a', 'b', 'c', ...tags]),
                );

                assert(newRequest.tags);
                const actual = newRequest.tags.value('x y z');

                expect(actual.split(' ')).toEqual(expected);
            });

            it('should pass previous tags', () => {
                const expected = ['a', 'b', 'c'];

                const request: DeferredUpdateIssuesRequest = {
                    tags: {
                        action: 'set',
                        value: () => expected.join(' '),
                    },
                };

                const fn = jest.fn().mockReturnValue(expected);
                const newRequest = updateTags(fn)(request);

                assert(newRequest.tags);
                newRequest.tags.value('');

                expect(fn).toBeCalledWith(expected);
            });
        });
    });

    describe('tickets', () => {
        describe('updateTickets', () => {
            it('should set ticket request', () => {
                const expected: DeferredUpdateIssuesRequest = {
                    ticket: {
                        action: 'set',
                        assignee: 'set',
                        value: expect.any(Function),
                    },
                };

                const request: DeferredUpdateIssuesRequest = {};
                const actual = updateTickets(() => [])(request);

                expect(actual).toEqual(expected);
            });

            it('should set tickets to new tickets ', () => {
                const newTickets: UpdateTicketRequest[] = [
                    {
                        watcher: '_backtrace',
                    },
                    {
                        watcher: 'new-ticket',
                        short: 'short',
                        state: 'open',
                        assignees: [{ id: 1 }],
                        url: 'url',
                    },
                ];

                const expected: UpdateTicketRequest[] = [...newTickets];

                const request: DeferredUpdateIssuesRequest = {};
                const newRequest = updateTickets(() => newTickets)(request);

                assert(newRequest.ticket);
                const actual = newRequest.ticket.value([]);

                expect(actual).toEqual(expected);
            });

            it('should pass previous tickets', () => {
                const expected: UpdateTicketRequest[] = [
                    {
                        watcher: '_backtrace',
                    },
                    {
                        watcher: 'new-ticket',
                        short: 'short',
                        state: 'open',
                        assignees: [{ id: 1 }],
                        url: 'url',
                    },
                ];

                const request: DeferredUpdateIssuesRequest = {
                    ticket: {
                        action: 'set',
                        assignee: 'set',
                        value: () => expected,
                    },
                };

                const fn = jest.fn().mockReturnValue(expected);
                const newRequest = updateTickets(fn)(request);

                assert(newRequest.ticket);
                newRequest.ticket.value([]);

                expect(fn).toBeCalledWith(expected);
            });

            it('should pass default ticket in previous tickets if it was not present before', () => {
                const expected: UpdateTicketRequest[] = [
                    {
                        watcher: '_backtrace',
                    },
                    {
                        watcher: 'new-ticket',
                        short: 'short',
                        state: 'open',
                        assignees: [{ id: 1 }],
                        url: 'url',
                    },
                ];

                const request: DeferredUpdateIssuesRequest = {
                    ticket: {
                        action: 'set',
                        assignee: 'set',
                        value: () => [
                            {
                                watcher: 'new-ticket',
                                short: 'short',
                                state: 'open',
                                assignees: [{ id: 1 }],
                                url: 'url',
                            },
                        ],
                    },
                };

                const fn = jest.fn().mockReturnValue(expected);
                const newRequest = updateTickets(fn)(request);

                assert(newRequest.ticket);
                newRequest.ticket.value([]);

                expect(fn).toBeCalledWith(expected);
            });

            it('should add default ticket if it is missing from set tickets', () => {
                const newTickets: UpdateTicketRequest[] = [
                    {
                        watcher: 'new-ticket',
                        short: 'short',
                        state: 'open',
                        assignees: [{ id: 1 }],
                        url: 'url',
                    },
                ];

                const expected: UpdateTicketRequest[] = [
                    {
                        watcher: '_backtrace',
                    },
                    ...newTickets,
                ];

                const request: DeferredUpdateIssuesRequest = {};
                const newRequest = updateTickets(() => newTickets)(request);

                assert(newRequest.ticket);
                const actual = newRequest.ticket.value([]);

                expect(actual).toEqual(expected);
            });

            it('should replace default ticket when it is present before', () => {
                const newTickets: UpdateTicketRequest[] = [
                    {
                        watcher: '_backtrace',
                        assignees: [{ id: 1 }],
                    },
                    {
                        watcher: 'new-ticket',
                        short: 'short',
                        state: 'open',
                        assignees: [{ id: 1 }],
                        url: 'url',
                    },
                ];

                const expected: UpdateTicketRequest[] = [...newTickets];

                const request: DeferredUpdateIssuesRequest = {};
                const newRequest = updateTickets(() => newTickets)(request);

                assert(newRequest.ticket);
                const actual = newRequest.ticket.value([
                    {
                        watcher: '_backtrace',
                    },
                ]);

                expect(actual).toEqual(expected);
            });

            it('should add only one default ticket when it is passed twice', () => {
                const newTickets: UpdateTicketRequest[] = [
                    {
                        watcher: '_backtrace',
                        assignees: [{ id: 1 }],
                    },
                    {
                        watcher: '_backtrace',
                        assignees: [{ id: 2 }],
                    },
                    {
                        watcher: 'new-ticket',
                        short: 'short',
                        state: 'open',
                        assignees: [{ id: 1 }],
                        url: 'url',
                    },
                ];

                const expected: UpdateTicketRequest[] = [
                    {
                        watcher: '_backtrace',
                        assignees: [{ id: 2 }],
                    },
                    {
                        watcher: 'new-ticket',
                        short: 'short',
                        state: 'open',
                        assignees: [{ id: 1 }],
                        url: 'url',
                    },
                ];

                const request: DeferredUpdateIssuesRequest = {};
                const newRequest = updateTickets(() => newTickets)(request);

                assert(newRequest.ticket);
                const actual = newRequest.ticket.value([
                    {
                        watcher: '_backtrace',
                    },
                ]);

                expect(actual).toEqual(expected);
            });
        });
    });

    describe('state', () => {
        describe('setState', () => {
            it('should set state', () => {
                const expected: TicketState = 'open';
                const request: DeferredUpdateIssuesRequest = {};

                const newRequest = setState(expected)(request);
                expect(newRequest.state).toEqual(expected);
            });

            it('should set state when set before', () => {
                const expected: TicketState = 'open';
                const request: DeferredUpdateIssuesRequest = {
                    state: 'in-progress',
                };

                const newRequest = setState(expected)(request);
                expect(newRequest.state).toEqual(expected);
            });
        });
    });

    describe('invariants', () => {
        describe('setInvariants', () => {
            it('should set invariants request', () => {
                const expected: UpdateInvariantsRequest = {
                    action: 'set',
                    value: expect.any(Array),
                };

                const request: DeferredUpdateIssuesRequest = {};

                const newRequest = setInvariants(
                    Invariants.timestampGt.of(123),
                    Invariants.versionGt('1.2.3', 'attr'),
                )(request);

                expect(newRequest.invariants).toEqual(expected);
            });

            it('should set invariants', () => {
                const expected = [Invariants.timestampGt.of(123), Invariants.versionGt('1.2.3', 'attr')];
                const request: DeferredUpdateIssuesRequest = {};

                const newRequest = setInvariants(...expected)(request);
                assert(newRequest.invariants);

                expect(newRequest.invariants.value).toEqual(expected);
            });

            it('should set invariants when set before', () => {
                const expected = [Invariants.timestampGt.of(123), Invariants.versionGt('1.2.3', 'attr')];
                const request: DeferredUpdateIssuesRequest = {
                    invariants: {
                        action: 'set',
                        value: [Invariants.regexInvariant(/x/, 'attr')],
                    },
                };

                const newRequest = setInvariants(...expected)(request);
                assert(newRequest.invariants);

                expect(newRequest.invariants.value).toEqual(expected);
            });
        });
    });
});
