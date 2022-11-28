import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-archived-accounts',
  templateUrl: './archived-accounts.component.html',
  styleUrls: ['./archived-accounts.component.css'],
})
export class ArchivedAccountsComponent implements OnInit {
  term!: string;
  fsData: any;
  userData: any;
  totalArchived = 0;
  studentUsers$: any;
  studentList: any;
  p: number = 1;
  selectedOption = 'Name: A - Z';

  options = [
    'Name: A - Z',
    'Name: Z - A',
    'Year Graduated: Newest',
    'Year Graduated: Oldest',
  ];

  constructor(
    public auth: AuthService,
    readonly fire: AngularFireAuth,
    public router: Router,
    private fb: FormBuilder,
    public toastService: ToastService,
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
        // this.createStudentForm.controls.course.setValue("Test Course")
      });
    });

    this.userService.getArchivedUsers().subscribe((res) => {
      this.totalArchived = 0;
      this.studentUsers$ = res.sort((a: any, b: any) =>
        a.displayName.localeCompare(b.displayName)
      );

      res.forEach((archived: any) => {
        this.totalArchived += 1;
      });
    });
  }

  public sortBy(event: any) {
    console.log(event);
    if (event === 'Name: A - Z') {
      this.studentUsers$.sort((a: any, b: any) =>
        a.displayName.localeCompare(b.displayName)
      );
    } else if (event === 'Name: Z - A') {
      this.studentUsers$.sort((a: any, b: any) =>
        b.displayName.localeCompare(a.displayName)
      );
    } else if (event === 'Year Graduated: Newest') {
      this.studentUsers$.sort(
        (a: any, b: any) => b.yearGraduated - a.yearGraduated
      );
    } else if (event === 'Year Graduated: Oldest') {
      this.studentUsers$.sort(
        (a: any, b: any) => a.yearGraduated - b.yearGraduated
      );
    }
  }
}
