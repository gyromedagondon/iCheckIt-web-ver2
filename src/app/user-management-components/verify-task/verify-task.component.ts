import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth  } from '@angular/fire/auth';
import { AuthService } from 'src/app/services/auth.service';
import { TaskService } from 'src/app/services/task.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, Validators } from '@angular/forms';
import { map } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/storage';
import { UserService } from 'src/app/services/user.service';
import { forkJoin, Observable } from 'rxjs';
@Component({
  selector: 'app-verify-task',
  templateUrl: './verify-task.component.html',
  styleUrls: ['./verify-task.component.css'],
})
export class VerifyTaskComponent implements OnInit {
  studentList: any;
  dateToday = new Date();
  userData: any;
  fsData: any;
  taskData: any;
  studentTaskList: any;
  p: number = 1;
  term!: string;
  regForms$: any;
  finalReg$: any;

  constructor(
    public auth: AuthService,
    private router: Router,
    readonly fire: AngularFireAuth,
    private taskService: TaskService,
    private fb: FormBuilder,
    private storage: AngularFireStorage,
    public userService: UserService
  ) {}

  ngOnInit(): void {
    var d = new Date();
    var y = d.getFullYear();
    var n = d.getMonth();
    console.log(n);
    console.log(y);
    if (n >= 1 && n <= 6) {
      console.log('January to June');
      console.log('2nd Term SY ' + y + '-' + (y + 1));
    } else if (n >= 8 && n <= 12) {
      console.log('August to December');
      console.log('1st Term SY ' + y + '-' + (y + 1));
    } else {
      console.log('Summer Term' + y + '-' + (y + 1));
    }
    this.fire.user.subscribe((user: any) => {
      this.userData = user;
      this.auth.getUserData(user?.uid).subscribe((res) => {
        this.fsData = res;
      });
    });

    this.taskService.getVerificationTask().subscribe((res) => {
      this.taskData = res;
    });

    this.userService.getRegistrationForms().subscribe((res) => {
      console.log(res, 'RES');
      this.regForms$ = res;
    });
  }

  public verifyStudent(data: any) {
    this.taskService.verifyStudentByRegForm(
      data?.studentId,
      this.fsData.displayName,
      data?.uid
    );
  }

  public deleteSubmission(data: any) {
    /*
    this.taskService.deleteStudentVerification(data.uid, data);
    */
    this.taskService.deleteRegform(data?.uid);
  }
}
