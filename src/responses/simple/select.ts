import { Attribute } from '../../queries/common';

export type SimpleSelectRow<T extends Attribute, S extends (keyof T)[]> = {
    [A in S[number]]: T[A];
};
