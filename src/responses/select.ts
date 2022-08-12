import { CoronerValueType } from '../queries/common';
import { QueryResponse } from './common';

export type SelectQueryObject = ['*', ([number] | [number, number])[]];
export type SelectQueryRowValue = ['*', ...[CoronerValueType, number][]];

export interface QueryOrder {
    name: string;
    order: string;
}

export interface SelectQueryResponse extends QueryResponse {
    readonly objects: SelectQueryObject[];
    readonly values: SelectQueryRowValue[];
    readonly order?: QueryOrder[];
}
