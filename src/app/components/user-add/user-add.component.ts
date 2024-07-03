import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbDatepickerModule, NgbDateStruct, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { CountryAutocompleteDirective } from '../../directives/country-autocomplete.directive';
import { interval, Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { COUNTRY_ARRAY } from '../../common/enum/country';
import { ApiService } from '../../services/api.service';
import { UsernameValidators } from '../../utils/validators/username-validators';
import { InputValidatorDirective } from '../../directives/input-validator.directive';
import { IFormsArray } from '../../common/interfaces';
import { TooltipDirective } from '../../directives/tooltip.directive';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { textError, timerDefault } from '../../common/constants/const';


@Component({
  selector: 'app-user-add',
  standalone: true,
  imports: [ReactiveFormsModule, BrowserModule, NgbDatepickerModule, CountryAutocompleteDirective, NgbTypeaheadModule, InputValidatorDirective, TooltipDirective],
  templateUrl: './user-add.component.html',
  styleUrl: './user-add.component.scss',
  providers: [ApiService]
})
export class UserAddComponent implements OnInit, OnDestroy {
  fb = inject(FormBuilder);
  apiService = inject(ApiService);
  destroyRef = inject(DestroyRef);
  public form!: FormGroup;
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

  ngOnInit(): void {
    this.initForm();
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

  public addFormArrayItem(): void {
    const formGroup = this.fb.group({
      country: ['', Validators.required],
      name: ['', Validators.required, UsernameValidators.createValidator(this.apiService)],
      birthDate: ['', Validators.required]
    });
    this.formsArray.push(formGroup);
  }

  private submitForms(): void {
    const formsData: IFormsArray[] = this.formsArray.getRawValue();
    this.apiService.submitForm(formsData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe( () => {
      this.formsArray.clear();
      this.addFormArrayItem();
      this.isSubmitting = false;
      this.timer = timerDefault;

      this.errorMessage = '';
    });
  }

  private markAllFieldsAsTouched(): void {
    this.formsArray.controls.forEach((formGroup) => {
      formGroup.markAllAsTouched();
    });
  }

  private initForm(): void {
    this.form = this.fb.group({
      formsArray: this.fb.array([this.fb.group({
        country: ['', Validators.required],
        name: ['', Validators.required, UsernameValidators.createValidator(this.apiService)],
        birthDate: ['', Validators.required]
      })])
    });
  }

}
