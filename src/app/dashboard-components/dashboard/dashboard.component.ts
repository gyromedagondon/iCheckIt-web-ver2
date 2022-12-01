import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { TaskService } from 'src/app/services/task.service';
import { FormBuilder, Validators } from '@angular/forms';
import moment from 'moment';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  accomplishedTasks = 0;
  pendingTasks = 0;
  minDate: any;
  // taskScope: any = ['1ITA','1ITB','1ITC','1ITD','1ITE','1ITF','1ITH','2ITA','2ITB','2ITC','2ITD','2ITE','2ITF','3ITA','3ITB','3ITC','3ITD','3ITF','3ITG','3ITF','3ITG','4ITA','4ITB','4ITC','4ITD','4ITE'];
  taskList: any;
  itScope: any = [
    '1ITA',
    '1ITB',
    '1ITC',
    '1ITD',
    '1ITE',
    '1ITF',
    '1ITG',
    '2ITA',
    '2ITB',
    '2ITC',
    '2ITD',
    '3ITA',
    '3ITB',
    '3ITC',
    '3ITD',
    '3ITE',
    '3ITF',
    '3ITG',
    '3ITH',
    '3ITI',
    '3ITJ',
    '4ITA',
    '4ITB',
    '4ITC',
    '4ITD',
    '4ITE',
    '4ITF',
    '4ITG',
    '4ITH',
  ];
  itScope1st: any = ['1ITA', '1ITB', '1ITC', '1ITD', '1ITE', '1ITF', '1ITG'];
  itScope2nd: any = ['2ITA', '2ITB', '2ITC', '2ITD'];
  itScope3rd: any = [
    '3ITA',
    '3ITB',
    '3ITC',
    '3ITD',
    '3ITE',
    '3ITF',
    '3ITG',
    '3ITH',
    '3ITI',
    '3ITJ',
  ];
  itScope4th: any = [
    '4ITA',
    '4ITB',
    '4ITC',
    '4ITD',
    '4ITE',
    '4ITF',
    '4ITG',
    '4ITH',
    '4ITI',
    '4ITJ',
  ];
  isScope: any = [
    '1ISA',
    '1ISB',
    '2ISA',
    '2ISB',
    '3ISA',
    '3ISB',
    '4ISA',
    '4ISB',
  ];
  isScope1st: any = ['1ISA', '1ISB', '1ISC', '1SD', '1ISE'];
  isScope2nd: any = ['2ISA', '2ISB', '2ISC', '2ISD', '2ISE'];
  isScope3rd: any = ['3ISA', '3ISB', '3ISC', '3ISD', '3ISE'];
  isScope4th: any = ['4ISA', '4ISB', '4ISC', '4ISD', '4ISE'];
  csScope: any = [
    '1CSA',
    '1CSB',
    '1CSC',
    '1CSD',
    '1CSE',
    '2CSA',
    '2CSB',
    '2CSC',
    '2CSD',
    '2CSE',
    '3CSA',
    '3CSB',
    '3CSC',
    '3CSD',
    '3CDE',
    '4CSA',
    '4CSB',
    '4CSC',
    '4CSD',
  ];
  csScope1st: any = ['1CSA', '1CSB', '1CSC', '1CSD', '1CSE'];
  csScope2nd: any = ['2CSA', '2CSB', '2CSC', '2CSD', '2CSE'];
  csScope3rd: any = ['3CSA', '3CSB', '3CSC', '3CSD', '3CSE'];
  csScope4th: any = ['4CSA', '4CSB', '4CSC', '4CSD'];
  taskScopeArray!: string[];
  p: number = 1;
  email!: string;
  password!: string;
  name!: string;
  number!: string;
  userData: any;
  fsData: any;
  invalidDate!: boolean;
  invalidDate1!: boolean;
  addTaskModal!: boolean;
  deleteTaskModal!: boolean;
  dateToday = new Date();
  verifyTasks$: any;
  addTaskForm!: any;
  deleteTaskForm!: any;
  taskRecipients: {
    email: string;
    uid: any;
    status: string;
    section: any;
    submissionLink: string;
    displayName: any;
  }[] = [];
  userPushTokens: { pushToken: string }[] = [];
  term!: string;
  selectedOption2 = 'Nearest to Deadline';

  options = ['Nearest to Deadline', 'Later Deadlines First'];

  constructor(
    public auth: AuthService,
    readonly fire: AngularFireAuth,
    public router: Router,
    public taskService: TaskService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.invalidDate = false;
    this.invalidDate1 = false;

    console.log(new Date());
    console.log(+new Date());
    console.log(new Date().getTime());

    console.log(new Date());
    console.log(+new Date() - 86400000);
    console.log(new Date().getTime() - 86400000);
    console.log(new Date(+new Date() - 86400000));

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
    this.fire.user.subscribe((user: any) => {
      this.userData = user;
      this.auth.getUserData(user?.uid).subscribe((res) => {
        this.fsData = res;
      });
    });
    this.taskService.getVerifyTasks().subscribe((res) => {
      this.verifyTasks$ = res.sort(
        (a: any, b: any) =>
          new Date(a?.deadline).getTime() - new Date(b?.deadline).getTime()
      );
      console.log(this.verifyTasks$);
      this.accomplishedTasks = 0;
      this.pendingTasks = 0;
      res.forEach((element: { [s: string]: unknown } | ArrayLike<unknown>) => {
        if (Object.values(element).includes('Pending')) {
          this.pendingTasks += 1;
        }

        if (Object.values(element).includes('Completed')) {
          this.accomplishedTasks += 1;
        }
      });
    });

    this.taskScopeArray = [];

    this.addTaskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      scope: ['', Validators.required],
      startsAt: ['', Validators.required],
      deadline: ['', Validators.required],
    });

    // delete task
  }

  public triggerAddTaskModal() {
    this.addTaskModal = !this.addTaskModal;
  }

  public clearScope() {
    this.taskScopeArray = [];
    this.addTaskForm.controls.scope.setValue(this.taskScopeArray);
  }

  changeTaskScope(e: any) {
    console.log(e.target.value);
    console.log(typeof e.target.value);
    if (this.taskScopeArray.includes(e.target.value)) {
      console.log('already included');
    } else if (!this.taskScopeArray.includes(e.target.value)) {
      if (e.target.value == 'BS Information Technology') {
        this.itScope.forEach((element: string) => {
          this.taskScopeArray.push(element);
        });
        console.log(this.taskScopeArray);
      } else if (e.target.value == 'BS Information Technology (1st Year)') {
        this.itScope1st.forEach((element: string) => {
          this.taskScopeArray.push(element);
        });
        console.log(this.taskScopeArray);
      } else if (e.target.value == 'BS Information Technology (2nd Year)') {
        this.itScope2nd.forEach((element: string) => {
          this.taskScopeArray.push(element);
        });
        console.log(this.taskScopeArray);
      } else if (e.target.value == 'BS Information Technology (3rd Year)') {
        this.itScope3rd.forEach((element: string) => {
          this.taskScopeArray.push(element);
        });
        console.log(this.taskScopeArray);
      } else if (e.target.value == 'BS Information Technology (4th Year)') {
        this.itScope4th.forEach((element: string) => {
          this.taskScopeArray.push(element);
        });
        console.log(this.taskScopeArray);
      } else if (e.target.value == 'BS Information Systems') {
        this.isScope.forEach((element: string) => {
          this.taskScopeArray.push(element);
        });
        console.log(this.taskScopeArray);
      } else if (e.target.value == 'BS Information Systems (1st Year)') {
        this.isScope1st.forEach((element: string) => {
          this.taskScopeArray.push(element);
        });
        console.log(this.taskScopeArray);
      } else if (e.target.value == 'BS Information Systems (2nd Year)') {
        this.isScope2nd.forEach((element: string) => {
          this.taskScopeArray.push(element);
        });
        console.log(this.taskScopeArray);
      } else if (e.target.value == 'BS Information Systems (3rd Year)') {
        this.isScope1st.forEach((element: string) => {
          this.taskScopeArray.push(element);
        });
        console.log(this.taskScopeArray);
      } else if (e.target.value == 'BS Information Systems (4th Year)') {
        this.isScope4th.forEach((element: string) => {
          this.taskScopeArray.push(element);
        });
        console.log(this.taskScopeArray);
      } else if (e.target.value == 'BS Computer Science') {
        this.csScope.forEach((element: string) => {
          this.taskScopeArray.push(element);
        });
        console.log(this.taskScopeArray);
      } else if (e.target.value == 'BS Computer Science (1st Year)') {
        this.csScope1st.forEach((element: string) => {
          this.taskScopeArray.push(element);
        });
        console.log(this.taskScopeArray);
      } else if (e.target.value == 'BS Computer Science (2nd Year)') {
        this.csScope2nd.forEach((element: string) => {
          this.taskScopeArray.push(element);
        });
        console.log(this.taskScopeArray);
      } else if (e.target.value == 'BS Computer Science (3rd Year)') {
        this.csScope3rd.forEach((element: string) => {
          this.taskScopeArray.push(element);
        });
        console.log(this.taskScopeArray);
      } else if (e.target.value == 'BS Computer Science (4th Year)') {
        this.csScope4th.forEach((element: string) => {
          this.taskScopeArray.push(element);
        });
        console.log(this.taskScopeArray);
      } else if (e.target.value == 'All Departments **') {
        this.itScope.forEach((element: string) => {
          this.taskScopeArray.push(element);
        });
        this.isScope.forEach((element: string) => {
          this.taskScopeArray.push(element);
        });
        this.csScope.forEach((element: string) => {
          this.taskScopeArray.push(element);
        });
        console.log(this.taskScopeArray);
      } else if (e.target.value == 'All Departments (1st Year)') {
        this.itScope1st.forEach((element: string) => {
          this.taskScopeArray.push(element);
        });
        this.isScope1st.forEach((element: string) => {
          this.taskScopeArray.push(element);
        });
        this.csScope1st.forEach((element: string) => {
          this.taskScopeArray.push(element);
        });
        console.log(this.taskScopeArray);
      } else if (e.target.value == 'All Departments (2nd Year)') {
        this.itScope2nd.forEach((element: string) => {
          this.taskScopeArray.push(element);
        });
        this.isScope2nd.forEach((element: string) => {
          this.taskScopeArray.push(element);
        });
        this.csScope2nd.forEach((element: string) => {
          this.taskScopeArray.push(element);
        });
        console.log(this.taskScopeArray);
      } else if (e.target.value == 'All Departments (3rd Year)') {
        this.itScope3rd.forEach((element: string) => {
          this.taskScopeArray.push(element);
        });
        this.isScope3rd.forEach((element: string) => {
          this.taskScopeArray.push(element);
        });
        this.csScope3rd.forEach((element: string) => {
          this.taskScopeArray.push(element);
        });
        console.log(this.taskScopeArray);
      } else if (e.target.value == 'All Departments (4th Year)') {
        this.itScope4th.forEach((element: string) => {
          this.taskScopeArray.push(element);
        });
        this.isScope4th.forEach((element: string) => {
          this.taskScopeArray.push(element);
        });
        this.csScope4th.forEach((element: string) => {
          this.taskScopeArray.push(element);
        });
        console.log(this.taskScopeArray);
      } else {
        this.taskScopeArray.push(e.target.value);
        console.log(this.taskScopeArray);
      }
      this.taskScopeArray.forEach((element) => {
        this.taskService.setRecipients(element).subscribe((res) => {
          res.forEach((data: any) => {
            if (data.pushToken == '') {
              let pushToken = {
                pushToken: '',
              };
              let userData = {
                email: data.email,
                uid: data.id,
                status: 'Pending',
                section: data.section,
                submissionLink: '',
                displayName: data.displayName,
                pushToken: '',

                term: this.term,
              };
              console.log(data.pushToken);
              if (!this.taskRecipients.some((e) => e.uid === userData.uid)) {
                this.taskRecipients.push(userData);
                /* vendors contains the element we're looking for */
              }
              if (
                !this.userPushTokens.some(
                  (e) => e.pushToken === pushToken.pushToken
                )
              ) {
                this.userPushTokens.push(pushToken);
                /* vendors contains the element we're looking for */
              }
            }
            if (data.pushToken != '') {
              let pushToken = {
                pushToken: data.pushToken,
              };
              let userData = {
                pushToken: data.pushToken,
                email: data.email,
                uid: data.id,
                status: 'Pending',
                section: data.section,
                submissionLink: '',
                displayName: data.displayName,
                term: this.term,
              };
              console.log(data.pushToken);
              if (!this.taskRecipients.some((e) => e.uid === userData.uid)) {
                this.taskRecipients.push(userData);
                /* vendors contains the element we're looking for */
              }
              if (
                !this.userPushTokens.some(
                  (e) => e.pushToken === pushToken.pushToken
                )
              ) {
                this.userPushTokens.push(pushToken);
                /* vendors contains the element we're looking for */
              }
            }
          });
        });
      });
    }
    console.log(this.taskRecipients);
    console.log(this.userPushTokens);

    // this.createStudentForm.controls.section.setValue(e.target.value, {
    //   onlySelf: true
    // });
  }

  addTask() {
    try {
      if (this.addTaskForm.valid) {
        /* 
        if (
          new Date(this.addTaskForm.controls['deadline'].value).getTime() <
          new Date().getTime()
        ) {
          console.log('HIT');
          this.invalidDate = true;
          setTimeout(() => {
            this.invalidDate = false;
          }, 3000);
          return;
        }
        if (
          new Date(this.addTaskForm.controls['startsAt'].value).getTime() <
          new Date().getTime()
        ) {
          console.log('HIT2');
          this.invalidDate1 = true;
          setTimeout(() => {
            this.invalidDate1 = false;
          }, 3000);
          return;
        } 
        */
        if (
          new Date(this.addTaskForm.controls['startsAt'].value).getTime() >=
          new Date(this.addTaskForm.controls['deadline'].value).getTime()
        ) {
          this.invalidDate = true;
          setTimeout(() => {
            this.invalidDate = false;
          }, 3000);
          return;
        } else {
          console.log(new Date(this.addTaskForm.controls['deadline'].value));
          this.taskService
            .addTask(
              this.addTaskForm.controls['title'].value,
              this.addTaskForm.controls['description'].value,
              this.taskScopeArray,
              new Date(this.addTaskForm.controls['startsAt'].value),
              new Date(this.addTaskForm.controls['deadline'].value),
              this.fsData.displayName,
              this.taskRecipients,
              this.userPushTokens,
              this.term
            )
            .then(() => {
              this.addTaskForm.reset();
            });
        }
      } else if (this.addTaskForm.invalid) {
        this.addTaskForm.controls['title'].markAsTouched();
        this.addTaskForm.controls['description'].markAsTouched();
        this.addTaskForm.controls['scope'].markAsTouched();
        this.addTaskForm.controls['deadline'].markAsTouched();
      }
    } catch (e) {
      console.log(e);
    }
  }

  public sortBy(event: any) {
    console.log(event);
    if (event === 'Nearest to Deadline') {
      this.verifyTasks$.sort(
        (a: any, b: any) =>
          new Date(a?.deadline).getTime() - new Date(b?.deadline).getTime()
      );
    } else if (event === 'Later Deadlines First') {
      this.verifyTasks$.sort(
        (a: any, b: any) =>
          new Date(b?.deadline).getTime() - new Date(a?.deadline).getTime()
      );
    }
  }
}
