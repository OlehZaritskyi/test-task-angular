import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of, take } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { ApiService } from '../service/api.service';

export class UsernameValidators {
  static createValidator(apiService: ApiService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      return control.valueChanges.pipe(
        debounceTime(900),
        distinctUntilChanged(),
        take(1),
        switchMap((username: string) =>
          apiService.checkUsername(username).pipe(
            map(response => (response.isAvailable ? null : { usernameTaken: true })),
            catchError(() => of(null))
          )
        )
      );
    };
  }
}
