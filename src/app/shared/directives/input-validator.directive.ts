// import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';
// import { NgControl } from '@angular/forms';
//
// @Directive({
//   selector: '[appInputValidator]',
//   standalone: true
// })
// export class InputValidatorDirective {
//   @Input('appInputValidator') validationMessage: string = '';
//   private readonly errorElement: HTMLElement;
//   constructor(private el: ElementRef, private renderer: Renderer2, private control: NgControl) {
//     this.errorElement = this.renderer.createElement('small');
//     this.renderer.setStyle(this.errorElement, 'color', 'red');
//     this.renderer.setStyle(this.errorElement, 'display', 'none');
//     this.renderer.appendChild(this.el.nativeElement.parentNode, this.errorElement);
//   }
//
//   @HostListener('input') onInput() {
//     this.validate();
//   }
//
//   @HostListener('blur') onBlur() {
//     this.validate();
//   }
//
//   private validate() {
//     if (this.control.invalid && (this.control.dirty || this.control.touched)) {
//       this.renderer.setStyle(this.errorElement, 'display', 'block');
//       this.renderer.setProperty(this.errorElement, 'innerText', this.validationMessage);
//     } else {
//       this.renderer.setStyle(this.errorElement, 'display', 'none');
//     }
//   }
//
// }

interface InputValidatorContext {
  $implicit: string;
  control: AbstractControl | null;
}

import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { AbstractControl, NG_VALIDATORS } from '@angular/forms';

@Directive({
  selector: '[appInputValidator]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: InputValidatorDirective,
      multi: true
    }
  ]
})
export class InputValidatorDirective implements OnInit {
  @Input('appInputValidator') context: InputValidatorContext = { $implicit: '', control: null };

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  ngOnInit() {
    if (!this.context.control) {
      throw new Error('Control is required');
    }
    this.context.control.statusChanges?.subscribe(() => this.updateView());
    this.updateView();
  }

  private updateView() {
    this.viewContainer.clear();
    if (this.context.control?.invalid && (this.context.control.dirty || this.context.control.touched)) {
      this.viewContainer.createEmbeddedView(this.templateRef, { $implicit: this.context.$implicit });
    }
  }
}
