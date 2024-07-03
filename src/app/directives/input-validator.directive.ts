import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface InputValidatorContext {
  $implicit: string;
  control: AbstractControl | null;
}

import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, inject, DestroyRef } from '@angular/core';
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
  destroyRef = inject(DestroyRef);
  templateRef = inject(TemplateRef);
  viewContainer = inject(ViewContainerRef);
  @Input('appInputValidator') context: InputValidatorContext = { $implicit: '', control: null };

  ngOnInit() {
    if (!this.context.control) {
      throw new Error('Control is required');
    }
    this.context.control.statusChanges?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.updateView());
    this.updateView();
  }

  private updateView() {
    this.viewContainer.clear();
    if (this.context.control?.invalid && (this.context.control.dirty || this.context.control.touched)) {
      this.viewContainer.createEmbeddedView(this.templateRef, { $implicit: this.context.$implicit });
    }
  }
}
