import { Component, Autowired } from '../../common/annotation';
import { Prioritizeable } from '../../common/prioritizeable';
import { View } from './view-protocol';

@Component()
export class ViewProvider {

    protected prioritized: View[];

    constructor(
        @Autowired(View)
        protected readonly views: View[]
    ) { }

    provide(): View[] {
        if (!this.prioritized) {
            this.prioritized = Prioritizeable.prioritizeAllSync(this.views).map(c => c.value);
        }
        return this.prioritized;
    }

}