import { Component, effect, inject, Signal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Goal } from '@src/app/goal/interface/goal.interface';
import { GoalService } from '@src/app/goal/service/goal.service';
import { ResponseError } from '@src/app/shared/interfaces/response-error.interface';
import { FormUtils } from '@src/app/shared/utils/form-utils';
import { map } from 'rxjs';
import { ErrorModalComponent } from "@app/shared/components/error-modal/error-modal.component";

@Component({
  selector: 'app-goal-form',
  imports: [ErrorModalComponent, ReactiveFormsModule],
  templateUrl: './goal-form.component.html'
})
export class GoalFormComponent {
  route = inject(ActivatedRoute);
  router = inject(Router)

  hasError = signal<boolean>(false);
  errorMessage = signal<string>('');
  errorDetails = signal<string>('');

  goal = signal<Goal | null>(null);

  goalService = inject(GoalService);

  goalId: Signal<string> = toSignal(this.route.params.pipe(map(({ id }) => id))) || signal('0');

  fb = inject(FormBuilder);
  formUtils = FormUtils;

  goalForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    targetAmount: [0, [Validators.required, Validators.min(0)]],
    deadLine: [new Date(), [Validators.required]],
    description: ['', [Validators.maxLength(255)]],
    enable: [false, [Validators.required]],
  });

  ngOnInit(): void {
    if (!isNaN(parseInt(this.goalId()))) {
      this.goalService.getGoalById(this.goalId()).subscribe((goal) => {
        this.goal.set(goal);
      })

      console.log(this.goal);
    }
  }

  onSubmit(): void {
    this.goalForm.markAllAsTouched();

    if (!this.goalForm.valid) {
      return;
    }

    const goalToPost: Goal = {
      name: this.goalForm.value.name!,
      targetAmount: this.goalForm.value.targetAmount!,
      deadLine: this.goalForm.value.deadLine!,
      description: this.goalForm.value.description!,
      enable: this.goalForm.value.enable!,
    };

    if (this.goal()) {

      goalToPost.id = this.goal()!.id;

      this.goalService.updateGoal(goalToPost).subscribe(
        {
          next: (success) => {
            this.router.navigate(['/goals/details/' + this.goal()!.id]);
          },
          error: (error) => {
            this.hasError.set(true);
            const errorResponse = error.error as ResponseError;
            this.errorMessage.set(errorResponse.error);
            this.errorDetails.set(errorResponse.message);
            setTimeout(() => {
              this.hasError.set(false);
            }, 3000);
          }
        }
      )
    } else {
      this.goalService.createGoal(goalToPost).subscribe(
        {
          next: (success) => {
            this.router.navigate(['/goals']);
          },
          error: (error) => {
            this.hasError.set(true);
            const errorResponse = error.error as ResponseError;
            this.errorMessage.set(errorResponse.error);
            this.errorDetails.set(errorResponse.message);
            setTimeout(() => {
              this.hasError.set(false);
            }, 3000);
          }
        }
      )
    }
  }

  bindEffect = effect(() => {
    if (!this.goal()) {
      return;
    }
    this.goalForm.patchValue(
      {
        name: this.goal()!.name,
        targetAmount: this.goal()!.targetAmount,
        deadLine: this.goal()!.deadLine,
        description: this.goal()!.description,
        enable: this.goal()!.enable,
      }
    );
  })

}
