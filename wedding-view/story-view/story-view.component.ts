import { Component, OnInit, Input } from '@angular/core';
import { WeddingStory } from '../../../services/wedding-data.service';

@Component({
  selector: 'wc-story-view',
  templateUrl: './story-view.component.html',
  styleUrls: ['./story-view.component.scss']
})
export class StoryViewComponent implements OnInit {
  @Input() stories: WeddingStory[] | undefined = [];

  constructor() { }

  ngOnInit(): void {
    console.log('StoryViewComponent initialized with stories:', this.stories);
  }

  getStories(): WeddingStory[] {
    return this.stories || [];
  }

  hasStories(): boolean {
    return !!(this.stories && this.stories.length > 0);
  }

  getFormattedDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  getTimelineItemClass(index: number): string {
    return index % 2 === 1 ? 'timeline-item center' : 'timeline-item';
  }

  trackByStoryId(index: number, item: WeddingStory): number {
    return item.id;
  }
}
