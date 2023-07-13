export interface VersionIssueInvariant {
    type: 'version_gt' | 'version_ge';
    field: string;
    version: string;
}

export interface TimestampIssueInvariant {
    type: 'timestamp_gt';
    timestamp: number;
}

export interface AndIssueInvariant {
    type: 'and';
    // https://hack.in.backtrace.io/T32755#350992 - Currently only one level of nesting is supported
    children: Exclude<IssueInvariant, AndIssueInvariant>[];
}

export interface RegexIssueInvariant {
    type: 'regular_expression';
    field: string;
    pattern: string;
}

export type IssueInvariant = TimestampIssueInvariant | VersionIssueInvariant | RegexIssueInvariant | AndIssueInvariant;
