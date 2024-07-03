import { AfterViewInit, Directive, ElementRef, Input, Renderer2 } from '@angular/core';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

@Directive({
  selector: '[appTooltip]',
  standalone: true,
  providers: [NgbTooltip]
})
export class TooltipDirective implements AfterViewInit {
  @Input('appTooltip') tooltipTitle: string = '';

  constructor(private el: ElementRef, private renderer: Renderer2, private ngbTooltip: NgbTooltip) {}

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
