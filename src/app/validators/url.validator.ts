import { AbstractControl, ValidatorFn } from '@angular/forms';

export function urlValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (!control.value) {
      return null; // Allow empty values
    }
    
    const urlPattern = /^(http|https):\/\/[^ "]+$/;
    const isValid = urlPattern.test(control.value);
    
    return isValid ? null : { invalidUrl: { value: control.value } };
  };
}