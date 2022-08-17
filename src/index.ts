import { Attribute, CoronerQuery } from './queries/common';
import { FoldedCoronerQueryResponseProvider } from './queries/fold';
import { SelectedCoronerQueryResponseProvider } from './queries/select';

export interface CoronerQueryCreator {
    create<T extends Attribute = Attribute>(): CoronerQuery<T>;
}

export type BacktraceForensic = //FoldedCoronerQueryRequestProvider &
    FoldedCoronerQueryResponseProvider &
        // SelectedCoronerQueryRequestProvider &
        SelectedCoronerQueryResponseProvider &
        CoronerQueryCreator;
