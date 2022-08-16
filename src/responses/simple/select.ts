import { QueryObject } from '../../queries/common';

export type SimpleSelectRow<T extends QueryObject<T>, S extends (keyof T)[]> = {
    [A in S[number]]: T[A];
};
