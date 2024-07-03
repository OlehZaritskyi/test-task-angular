import { Directive, ElementRef, HostListener, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import { COUNTRY_ARRAY } from '../enum/country';

@Directive({
  selector: '[appCountryAutocomplete]',
  standalone: true,
})
export class CountryAutocompleteDirective implements OnInit {
  constructor(private el: ElementRef, private control: NgControl) {
  }
  ngOnInit() {
  }
  @HostListener('blur', ['$event.target.value'])
  onBlur(value: string) {
    const validCountry = COUNTRY_ARRAY.includes(value) ? value : '';
    this.el.nativeElement.value = validCountry;
    this.control.control?.setValue(validCountry);
  }
}


