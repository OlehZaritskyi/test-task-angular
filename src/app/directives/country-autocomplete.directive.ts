import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import { COUNTRY_ARRAY } from '../common/enum/country';

@Directive({
  selector: '[appCountryAutocomplete]',
  standalone: true,
})
export class CountryAutocompleteDirective {
  el = inject(ElementRef);
  control = inject(NgControl);
  @HostListener('blur', ['$event.target.value'])
  onBlur(value: string) {
    const validCountry = COUNTRY_ARRAY.includes(value) ? value : '';
    this.el.nativeElement.value = validCountry;
    this.control.control?.setValue(validCountry);
  }
}


