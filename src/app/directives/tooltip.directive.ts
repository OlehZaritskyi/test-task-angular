import { AfterViewInit, Directive, ElementRef, inject, Input, Renderer2 } from '@angular/core';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

@Directive({
  selector: '[appTooltip]',
  standalone: true,
  providers: [NgbTooltip]
})
export class TooltipDirective implements AfterViewInit {
  el = inject(ElementRef);
  renderer = inject(Renderer2);
  ngbTooltip = inject(NgbTooltip);
  @Input('appTooltip') tooltipTitle: string = '';
  ngAfterViewInit() {
    this.ngbTooltip.ngbTooltip = this.tooltipTitle;
    this.ngbTooltip.container = 'body';
    this.renderer.listen(this.el.nativeElement, 'mouseenter', () => {
      this.ngbTooltip.open();
    });
    this.renderer.listen(this.el.nativeElement, 'mouseleave', () => {
      this.ngbTooltip.close();
    });
  }
}
