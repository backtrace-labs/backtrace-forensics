import {
    AndIssueInvariant,
    RegexIssueInvariant,
    TimestampIssueInvariant,
    VersionIssueInvariant,
} from '../../../../lib/coroner';

export namespace Invariants {
    export function and(...invariants: AndIssueInvariant['children']): AndIssueInvariant {
        return {
            type: 'and',
            children: invariants,
        };
    }

    export function version(type: VersionIssueInvariant['type']) {
        function versionInvariant(version: string): (attribute: string) => VersionIssueInvariant;
        function versionInvariant(version: string, attribute: string): VersionIssueInvariant;
        function versionInvariant(version: string, attribute?: string) {
            function versionInvariant(attribute: string): VersionIssueInvariant {
                return {
                    type,
                    version,
                    field: attribute,
                };
            }

            if (attribute) {
                return versionInvariant(attribute);
            }

            return versionInvariant;
        }

        return versionInvariant;
    }

    export const versionGt = version('version_gt');
    export const versionGe = version('version_ge');

    export function timestamp(type: TimestampIssueInvariant['type']) {
        return {
            of(timestamp: number): TimestampIssueInvariant {
                return {
                    type,
                    timestamp,
                };
            },
            date(date: Date | string | number): TimestampIssueInvariant {
                return {
                    type,
                    timestamp: new Date(date).getTime() / 1000,
                };
            },
        } as const;
    }

    export const timestampGt = timestamp('timestamp_gt');

    export function regexInvariant(pattern: string | RegExp): (attribute: string) => RegexIssueInvariant;
    export function regexInvariant(pattern: string | RegExp, attribute: string): RegexIssueInvariant;
    export function regexInvariant(pattern: string | RegExp, attribute?: string) {
        function regexInvariant(attribute: string): RegexIssueInvariant {
            return {
                type: 'regular_expression',
                field: attribute,
                pattern: pattern instanceof RegExp ? pattern.toString().match(/^\/(.+)\/\w*$/)![1] : pattern,
            };
        }

        if (attribute) {
            return regexInvariant(attribute);
        }

        return regexInvariant;
    }
}
