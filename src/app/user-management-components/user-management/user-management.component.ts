import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFireAuth  } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';
import { TaskService } from 'src/app/services/task.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ViewChild, ElementRef } from '@angular/core';
//@ts-ignore
import * as admin from 'firebase-admin';
@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent implements OnInit {
  term!: string;
  studentList: any;
  verifyTasks$: any;
  itStudentForm: any;
  allDepartment: any = [
    'Information Technology',
    'Information Systems',
    'Computer Science',
  ];
  studentCourses: any = [
    'BS Information Technology',
    'BS Information Systems',
    'BS Computer Science',
  ];
  studentSections: any = [
    '1ITA',
    '1ITB',
    '1ITC',
    '1ITD',
    '1ITE',
    '1ITF',
    '1ITG',
    '1ITH',
    '1ITI',
    '1ITJ',
    '2ITA',
    '2ITB',
    '2ITC',
    '2ITD',
    '2ITE',
    '2ITF',
    '2ITG',
    '2ITH',
    '2ITI',
    '2ITJ',
    '3ITA',
    '3ITB',
    '3ITC',
    '3ITD',
    '3ITF',
    '3ITG',
    '3ITF',
    '3ITG',
    '3ITH',
    '4ITA',
    '4ITB',
    '4ITC',
    '4ITD',
    '4ITE',
    '4ITF',
    '4ITG',
    '4ITH',
    '4ITI',
    '4ITJ'
  ];
  allSections: any = ['All sections'];
  itSection: any = [
    '1ITA',
    '1ITB',
    '1ITC',
    '1ITD',
    '1ITE',
    '1ITF',
    '1ITG',
    '1ITH',
    '1ITI',
    '1ITJ',
    '2ITA',
    '2ITB',
    '2ITC',
    '2ITD',
    '2ITE',
    '2ITF',
    '2ITG',
    '2ITH',
    '2ITI',
    '2ITJ',
    '3ITA',
    '3ITB',
    '3ITC',
    '3ITD',
    '3ITF',
    '3ITG',
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
    '4ITI',
    '4ITJ'
  ];
  itScope1st: any = ['1ITA', '1ITB', '1ITC', '1ITD', '1ITE', '1ITF', '1ITG', '1ITH','1ITI','1ITJ'];
  itScope2nd: any = ['2ITA', '2ITB', '2ITC', '2ITD'];
  itScope3rd: any = [
    '3ITA',
    '3ITB',
    '3ITC',
    '3ITD',
    '3ITF',
    '3ITG',
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
    '4ITJ'
  ];
  csSection: any = [
    '1CSA',
    '1CSB',
    '1CSC',
    '2CSA',
    '2CSB',
    '2CSC',
    '3CSA',
    '3CSB',
    '3CSC',
    '3CSD',
    '4CSA',
    '4CSB',
  ];
  csScope1st: any = ['1CSA', '1CSB', '1CSC'];
  csScope2nd: any = ['2CSA', '2CSB', '2CSC'];
  csScope3rd: any = ['3CSA', '3CSB', '3CSC', '3CSD'];
  csScope4th: any = ['4CSA', '4CSB', '4CSC'];
  isSection: any = [
    '1ISA',
    '1ISB',
    '2ISA',
    '2ISB',
    '3ISA',
    '3ISB',
    '4ISA',
    '4ISB',
  ];
  isScope1st: any = ['1ISA', '1ISB'];
  isScope2nd: any = ['2ISA', '2ISB'];
  isScope3rd: any = ['3ISA', '3ISB', '3ISC'];
  isScope4th: any = ['4ISA', '4ISB', '4ISC'];
  dateToday = new Date();
  createStudentModal!: boolean;
  createDeptHeadModal!: boolean;
  createAdminModal!: boolean;
  createStudentForm!: any;
  createDeptHeadForm!: any;
  createAdminForm!: any;
  importUserManual!: boolean;
  userData: any;
  fsData: any;
  adminUsers$: any;
  studentUsers$: any;
  deptHeadUsers$: any;
  p: number = 1;
  totalStudents = 0;
  totalVerified = 0;
  totalNotVerified = 0;
  importForm: FormGroup;
  constructor(
    public auth: AuthService,
    readonly fire: AngularFireAuth,
    public router: Router,
    private fb: FormBuilder,
    public toastService: ToastService,
    public userService: UserService,
    private taskService: TaskService,
    private http: HttpClient
  ) {
    this.importForm = this.fb.group({
      studentInputs: this.fb.array([]),
    });
  }

  studentInputs(): FormArray {
    return this.importForm.get('studentInputs') as FormArray;
  }

  studentControls(i: number): FormGroup {
    return this.studentInputs().controls[i] as FormGroup;
  }

  newStudent(): FormGroup {
    return this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      section: ['', Validators.required],
      course: ['', Validators.required],
      contactNumber: [''],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern('^[a-z0-9._%+-]+@[(ust.edu)]+\\.ph$'),
        ],
      ],
    });
  }
  addStudent() {
    this.studentInputs().push(this.newStudent());
  }

  removeStudent(i: number) {
    this.studentInputs().removeAt(i);
  }

  onSubmitImport() {
    if (this.importForm.valid) {
      console.log(JSON.stringify(this.importForm.value.studentInputs));
      this.userService
        .adminImportUsers(this.importForm.value.studentInputs)
        .then(() => this.triggerImportUserManual())
        .finally(() => this.importForm.reset());
    } else if (this.importForm.invalid) {
      this.studentInputs().controls.forEach((studentControl) => {
        let target = studentControl as FormGroup;
        target.controls['firstName'].markAsTouched();
        target.controls['lastName'].markAsTouched();
        target.controls['course'].markAsTouched();
        target.controls['section'].markAsTouched();
        target.controls['contactNumber'].markAsTouched();
        target.controls['email'].markAsTouched();
      });

     
      this.toastService.publish(
        'Please fill up all required fields properly',
        'formError'
      );
    }
  }

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

    this.taskService.getVerificationTask().subscribe((res) => {
      this.verifyTasks$ = res;
    });

    this.userService.getStudentUsers().subscribe((res) => {
      this.studentUsers$ = res;
      this.totalStudents = 0;
      this.totalVerified = 0;
      this.totalNotVerified = 0;
      res.forEach((element: { [s: string]: unknown } | ArrayLike<unknown>) => {
        console.log(element);
        this.totalStudents += 1;
        //@ts-ignore
        if (element?.isVerified == true) {
          this.totalVerified += 1;
        }

        if (
          //@ts-ignore
          element?.isVerified == false ||  element?.isVerified == null
        ) {
          this.totalNotVerified += 1;
        }
      });
    });
    this.userService.getAdminUsers().subscribe((res) => {
      this.adminUsers$ = res;
    });
    this.userService.getDeptHeadUsers().subscribe((res) => {
      this.deptHeadUsers$ = res;
    });

    // Validators.pattern('^[a-z0-9._%+-]+@[(ust.edu)]+\\.ph$'
    this.createStudentForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      section: ['', Validators.required],
      course: ['', Validators.required],
      contactNumber: [''],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern('^[a-z0-9._%+-]+@[(ust.edu)]+\\.ph$'),
        ],
      ],
    });

    this.createDeptHeadForm = this.fb.group({
      displayName: ['', Validators.required],
      department: ['', Validators.required],
      contactNumber: [''],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern('^[a-z0-9._%+-]+@[(ust.edu)]+\\.ph$'),
        ],
      ],
    });

    this.createAdminForm = this.fb.group({
      displayName: ['', Validators.required],
      department: ['', Validators.required],
      contactNumber: [''],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern('^[a-z0-9._%+-]+@[(ust.edu)]+\\.ph$'),
        ],
      ],
    });

    this.itStudentForm = this.fb.group({
      displayName: [''],
      course: [''],
      section: [''],
    });

    this.addStudent();
    this.addStudent();
  }

  public triggerCreateStudentModal() {
    this.createStudentModal = !this.createStudentModal;
  }

  public triggerCreateAdminModal() {
    this.createAdminModal = !this.createAdminModal;
  }

  public triggerCreateDeptHeadModal(){
    this.createDeptHeadModal = !this.createDeptHeadModal;
  } 

  public triggerImportUserManual() {
    this.importUserManual = !this.importUserManual;
  }

  public importUsers(file: any) {
    if (file) {
    }
  }

  public createStudent() {
    if (this.createStudentForm.valid) {

      const displayName = this.createStudentForm.controls['firstName'].value + " " + this.createStudentForm.controls['lastName'].value;
      this.userService
        .adminCreateStudent(
          this.createStudentForm.controls['firstName'].value,
          this.createStudentForm.controls['lastName'].value,
          displayName,
          this.createStudentForm.controls['section'].value,
          this.createStudentForm.controls['course'].value,
          this.createStudentForm.controls['contactNumber'].value,
          this.createStudentForm.controls['email'].value
        )
        .then(() => this.triggerCreateStudentModal())
        .finally(() => this.createStudentForm.reset());
    } else if (this.createStudentForm.invalid) {
      console.log(this.createStudentForm.value);
      this.createStudentForm.controls['firstName'].markAsTouched(),
      this.createStudentForm.controls['lastName'].markAsTouched(),
      this.createStudentForm.controls['course'].markAsTouched();
      this.createStudentForm.controls['section'].markAsTouched();
      this.createStudentForm.controls['contactNumber'].markAsTouched();
      this.createStudentForm.controls['email'].markAsTouched();
      this.toastService.publish(
        'Please fill up all required fields properly',
        'formError'
      );
    }
  }

  preview = '';
  extension = '';
  file = '';
  filename = '';
  public handleFileOnChange(event: any) {
    const files = event.target.files;
    this.extension = files[0].type;
    this.file = files[0];
    this.filename = files[0].name;
    if (event.target.files[0]) {
      //post

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      const params: URLSearchParams = new URLSearchParams();

      const file = files[0];
      params.set('file', file);

      this.http
        .post(
          `https://us-central1-icheckit-6a8bb.cloudfunctions.net/importUsers`,
          {
            file,
          },
          {
            headers,
          }
        )
        .toPromise()
        .then(() => {
          this.toastService.publish(
            'Users has been successfully imported',
            'formSuccess'
          );
        })
        .catch((err) => {
          console.log(err);
          this.toastService.publish(
            'Unexpected server error, please try again later',
            'formError'
          );
        });
    }
  }
  public importJSON() {
    const fileInput = document?.getElementById('file');
    fileInput?.click();
  }

  public createDeptHead() {
    if (this.createDeptHeadForm.valid) {
      console.log(this.createDeptHeadForm.value);
      this.userService
        .adminCreateDeptHead(
          this.createDeptHeadForm.controls['displayName'].value,
          this.createDeptHeadForm.controls['department'].value,
          this.createDeptHeadForm.controls['contactNumber'].value,
          this.createDeptHeadForm.controls['email'].value
        )
        .then(() => this.triggerCreateDeptHeadModal())
        .finally(() => this.createDeptHeadForm.reset());
    } else if (this.createDeptHeadForm.invalid) {
      console.log(this.createDeptHeadForm.value);
      this.createDeptHeadForm.controls['displayName'].markAsTouched();
      this.createDeptHeadForm.controls['department'].markAsTouched();
      this.createDeptHeadForm.controls['email'].markAsTouched();
      this.createDeptHeadForm.controls['contactNumber'].markAsTouched();
      this.toastService.publish(
        'Please fill up all required fields properly',
        'formError'
      );
    }
  }

  public createAdmin() {
    if (this.createAdminForm.valid) {
      console.log(this.createAdminForm.value);
      this.userService
        .adminCreateAdmin(
          this.createAdminForm.controls['displayName'].value,
          this.createAdminForm.controls['department'].value,
          this.createAdminForm.controls['contactNumber'].value,
          this.createAdminForm.controls['email'].value
        )
        .then(() => this.triggerCreateAdminModal())
        .finally(() => this.createAdminForm.reset());
    } else if (this.createAdminForm.invalid) {
      console.log(this.createAdminForm.value);
      this.createAdminForm.controls['displayName'].markAsTouched();
      this.createAdminForm.controls['department'].markAsTouched();
      this.createAdminForm.controls['email'].markAsTouched();
      this.createAdminForm.controls['contactNumber'].markAsTouched();
      this.toastService.publish(
        'Please fill up all required fields properly',
        'formError'
      );
    }
  }

  changeDepartment(e: any) {
    this.createDeptHeadForm.controls.department.setValue(e.target.value, {
      onlySelf: true,
    });
  }

  changeCourse(e: any) {
    this.createStudentForm.controls.course.setValue(e.target.value, {
      onlySelf: true,
    });
  }

  changeCourseIndex(e: any, i: number) {
    this.studentControls(i).controls.course.setValue(e.target.value, {
      onlySelf: true,
    });
  }

  changeSectionIndex(e: any, i: number) {
    this.studentControls(i).controls.section.setValue(e.target.value, {
      onlySelf: true,
    });
  }

  changeSection(e: any) {
    this.createStudentForm.controls.section.setValue(e.target.value, {
      onlySelf: true,
    });
  }
}
