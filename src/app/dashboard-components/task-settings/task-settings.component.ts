import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Params, ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthService } from 'src/app/services/auth.service';
import { TaskService } from 'src/app/services/task.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/toast.service';
import moment from 'moment';
// modal dialog import
@Component({
  selector: 'task-settings',
  templateUrl: './task-settings.component.html',
  styleUrls: ['./task-settings.component.css'],
})
export class TaskSettingsComponent implements OnInit {
  term!: string;
  dateToday = new Date();
  userData: any;
  fsData: any;
  id!: any;
  taskData: any;
  taskStatus: any = ['Pending', 'Completed'];
  // start of edit task import
  // taskScope: any = ['1ITA','1ITB','1ITC','1ITD','1ITE','1ITF','1ITH','2ITA','2ITB','2ITC','2ITD','2ITE','2ITF','3ITA','3ITB','3ITC','3ITD','3ITF','3ITG','3ITF','3ITG','4ITA','4ITB','4ITC','4ITD','4ITE','BS Information Technology', 'BS Information Systems', 'BS Computer Science'];
  taskScopeArray!: string[];
  // newTaskScope: any = ['1ITA','1ITB','1ITC','1ITD','1ITE','1ITF','1ITH','2ITA','2ITB','2ITC','2ITD','2ITE','2ITF','3ITA','3ITB','3ITC','3ITD','3ITF','3ITG','3ITF','3ITG','4ITA','4ITB','4ITC','4ITD','4ITE','BS Information Technology', 'BS Information Systems', 'BS Computer Science'];
  newTaskScopeArray!: string[];
  addTaskForm!: any;
  newTaskForm!: any;
  taskRecipients: {
    uid: any;
    status: string;
    section: any;
    submissionLink: string;
    displayName: any;
  }[] = [];
  userPushTokens: { pushToken: string }[] = [];
  addTaskModal!: boolean;
  addScopeModal!: boolean;
  editTaskScope!: any;
  verifyTasks$: any;
  deleteTaskForm!: any;
  deleteTaskModal!: boolean;
  minDate: any;
  updateTaskForm!: any;
  updateTaskConfirm!: boolean;

  // editTaskScope! : any;
  // end of edit task import

  constructor(
    public auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    readonly fire: AngularFireAuth,
    private taskService: TaskService,
    private fb: FormBuilder,
    public toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.minDate = moment(new Date()).format('YYYY-MM-DD');
    var d = new Date();
    var y = d.getFullYear();
    var n = d.getMonth();
    console.log(n);
    console.log(y);
    if (n >= 1 && n <= 6) {
      console.log('January to June');
      console.log('2nd Term SY ' + y + '-' + (y + 1));
      this.term = '2nd Term SY ' + y + '-' + (y + 1);
    } else if (n >= 8 && n <= 12) {
      console.log('August to December');
      console.log('1st Term SY ' + y + '-' + (y + 1));
      this.term = '1st Term SY ' + y + '-' + (y + 1);
    } else {
      console.log('Summer Term' + y + '-' + (y + 1));
      this.term = 'Summer Term' + y + '-' + (y + 1);
    }
    this.updateTaskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      deadline: ['', Validators.required],
    });
    this.fire.user.subscribe((user: any) => {
      this.userData = user;
      this.auth.getUserData(user?.uid).subscribe((res) => {
        this.fsData = res;
      });
    });
    this.route.params
      .pipe(
        switchMap((params: Params) => {
          console.log(params['id']);
          return this.taskService.getTask(params['id']);
        })
      )
      .subscribe((res) => {
        this.updateTaskForm.controls.title.setValue(res.title);
        this.updateTaskForm.controls.description.setValue(res.description);
        this.updateTaskForm.controls.deadline.setValue(res.deadline);
        this.taskData = res;
        console.log(res);
      });

    this.taskScopeArray = [];
  }

  public triggerDeleteTaskModal() {
    this.deleteTaskModal = !this.deleteTaskModal;
  }

  public triggerUpdateTask() {
    this.updateTaskForm.controls.title.setValue(this.taskData.title);
    this.updateTaskForm.controls.description.setValue(
      this.taskData.description
    );
    this.updateTaskForm.controls.deadline.setValue(this.taskData.deadline);
  }

  public updateTask() {
    if (this.updateTaskForm.valid) {
      this.taskService
        .updateTask(
          this.taskData.recipients,
          this.taskData.taskId,
          this.updateTaskForm.controls['title'].value,
          this.updateTaskForm.controls['description'].value,
          new Date(this.updateTaskForm.controls['deadline'].value)
        )
        .then(() => this.triggerUpdateTask())
        .finally(() => this.updateTaskForm.reset());
    } else if (this.updateTaskForm.invalid) {
      this.updateTaskForm.controls['title'].markAsTouched();
      this.updateTaskForm.controls['description'].markAsTouched();
      this.updateTaskForm.controls['deadline'].markAsTouched();

      this.toastService.publish(
        'Please fillup all the requirements',
        'formSuccess'
      );
    }
  }

  changeTaskScope(e: any) {
    console.log(e.target.value);
    console.log(typeof e.target.value);
    // if (this.taskScopeArray.includes(e.target.value)) {
    //   console.log('already included')
    // } else if (!this.taskScopeArray.includes(e.target.value)) {
    //   this.taskScopeArray.push(e.target.value)
    //   console.log(this.taskScopeArray);

    //   this.taskScopeArray.forEach(element => {
    //     this.taskService.setRecipients(element).subscribe(res => {
    //       res.forEach((data: any) => {
    //         let pushToken = {
    //           pushToken: data.pushToken
    //         }
    //         let userData = {
    //           uid: data.id,
    //           status: 'Pending',
    //           section: data.section,
    //           submissionLink: '',
    //           displayName: data.displayName
    //         }
    //         console.log(data.pushToken)
    //         if (!this.taskRecipients.some(e => e.uid === userData.uid)) {
    //           this.taskRecipients.push(userData);

    //         }
    //         if (!this.userPushTokens.some(e => e.pushToken === pushToken.pushToken)) {
    //           this.userPushTokens.push(pushToken);

    //         }

    //       });
    //     })
    //   })
    // }
    // console.log(this.taskRecipients)
    // console.log(this.userPushTokens)
  }

  public deleteTask() {
    this.taskService.deleteTask(this.taskData.taskId).then(() => {
      this.router.navigate(['/dashboard']);
    });
  }
}
