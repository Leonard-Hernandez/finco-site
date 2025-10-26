import { FormGroup } from "@angular/forms";

export class FormUtils {

    static isValidField(form: FormGroup, fieldName: string): boolean {
        return !! (form.controls[fieldName].errors && form.controls[fieldName].touched);
    }

    static getErrorMessage(form: FormGroup, fieldName: string): string | null {

        const errors = form.controls[fieldName].errors;

        for (const key in errors) {
            switch (key) {
                case 'email':
                    return 'Invalid email format';
                case 'required':
                    return 'This field is required';
                case 'min':
                    return `This field must be at least ${errors['min'].min} value`;
                case 'minlength':
                    return `This field must be at least ${errors['minlength'].requiredLength} characters long`;
                case 'maxlength':
                    return `This field cannot exceed ${errors['maxlength'].requiredLength} characters`;
                case 'pattern':
                    return 'Invalid format';
                default:
                    return 'Something went wrong';
            }
        }

        return null;
    }
    
}