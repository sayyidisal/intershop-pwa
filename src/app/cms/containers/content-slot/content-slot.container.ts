import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { ContentSlotView } from 'ish-core/models/content-view/content-views';

@Component({
  selector: 'ish-content-slot',
  templateUrl: './content-slot.container.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentSlotContainerComponent {
  @Input()
  slot: ContentSlotView;
}