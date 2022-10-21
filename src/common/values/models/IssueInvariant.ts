export interface VersionIssueInvariant {
    type: 'version_gt';
    field: string;
    version: string;
}

export interface TimestampIssueInvariant {
    type: 'timestamp_gt';
    timestamp: string;
}

export type IssueInvariant = TimestampIssueInvariant | VersionIssueInvariant;
