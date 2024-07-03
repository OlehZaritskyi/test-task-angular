import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbDatepickerModule, NgbDateStruct, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { CountryAutocompleteDirective } from '../../shared/directives/country-autocomplete.directive';
import { interval, Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { COUNTRY_ARRAY } from '../../shared/enum/country';
import { ApiService } from '../../shared/service/api.service';
import { UsernameValidators } from '../../shared/validators/username-validators';
import { InputValidatorDirective } from '../../shared/directives/input-validator.directive';
import { IFormsArray } from '../../shared/interfaces/main.inreface';
import { TooltipDirective } from '../../shared/directives/tooltip.directive';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { textError, timerDefault } from '../../shared/const/const';

// const timerDefault = 15; // Start from 15 seconds

@Component({
  selector: 'app-form-array',
  standalone: true,
  imports: [ReactiveFormsModule, BrowserModule, NgbDatepickerModule, CountryAutocompleteDirective, NgbTypeaheadModule, InputValidatorDirective, TooltipDirective],
  templateUrl: './form-array.component.html',
  styleUrl: './form-array.component.scss',
})
export class FormArrayComponent implements OnInit, OnDestroy {
  destroyRef = inject(DestroyRef);
  public form: FormGroup;
  public minDate: NgbDateStruct = { year: 1925, month: 1, day: 1 };
  public maxDate: NgbDateStruct = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate()
  };
  isSubmitting = false;
  timer = 0;
  timerSubscription!: Subscription;
  errorMessage = '';

  get formsArray(): FormArray {
    return this.form.get('formsArray') as FormArray;
  }

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.form = this.fb.group({
      formsArray: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.formInitialization();
  }

  ngOnDestroy() {
    this.timerSubscription.unsubscribe();
  }

  public removeForm(index: number): void {
    this.formsArray.removeAt(index);
  }

  public onSubmit() {
    this.errorMessage = '';
    if (this.form.invalid) {
      this.markAllFieldsAsTouched();
      this.errorMessage = textError;
      return;
    }
    this.isSubmitting = true;
    this.formsArray.disable();
    this.startTimer();
  }

  public onCancel() {
    this.isSubmitting = false;
    this.formsArray.enable({ emitEvent: false });
    this.timerSubscription.unsubscribe();
    this.timer = timerDefault;
    this.errorMessage = '';
  }

  public startTimer() {
    this.timer = timerDefault;
    this.timerSubscription = interval(1000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.timer--;
      if (this.timer <= 0) {
        this.timerSubscription.unsubscribe();
        this.submitForms();
      }
    });
  }


  public search = (text$: Observable<string>): Observable<string[]> =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? [] : COUNTRY_ARRAY.filter(countryName => countryName.toLowerCase().includes(term.toLowerCase())).slice(0, 10))
    );

  public formatter = (inputValue: string) => inputValue;

  public formInitialization(): void {
    const formGroup = this.fb.group({
      country: ['', Validators.required],
      name: ['', Validators.required, UsernameValidators.createValidator(this.apiService)],
      birthDate: ['', Validators.required]
    });
    this.formsArray.push(formGroup);
  }

  private submitForms() {
    const formsData: IFormsArray[] = this.formsArray.getRawValue();
    this.apiService.submitForm(formsData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe( () => {
      this.formsArray.clear();
      this.formInitialization();
      this.isSubmitting = false;
      this.timer = timerDefault;

      this.errorMessage = '';
    });
  }

  private markAllFieldsAsTouched() {
    this.formsArray.controls.forEach((formGroup) => {
      formGroup.markAllAsTouched();
    });
  }

}
