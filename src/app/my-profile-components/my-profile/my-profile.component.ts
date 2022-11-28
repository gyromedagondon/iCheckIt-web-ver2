import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/toast.service';

import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css'],
})
export class MyProfileComponent implements OnInit {
  dateToday = new Date();
  userData: any;
  fsData: any;
  editModal!: boolean;
  deleteModal!: boolean;
  editEmailModal!: boolean;
  changePassModal!: boolean;
  updateEmailForm!: any;
  editAccountForm!: any;
  deleteAccountForm!: any;
  changePassForm!: any;
  term!: string;

  constructor(
    public auth: AuthService,
    readonly fire: AngularFireAuth,
    public router: Router,
    private fb: FormBuilder,
    public toastService: ToastService,
    private afs: AngularFirestore
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
        console.log(res);
        console.log(res.uid);
        this.fsData = res;
      });
    });

    this.editAccountForm = this.fb.group({
      displayName: ['', Validators.required],
      contactNumber: [''],
      password: ['', Validators.required],
      FileSelectInputDialog: [''],
    });

    this.updateEmailForm = this.fb.group({
      currentEmail: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern('^[a-z0-9._%+-]+@[(ust.edu)]+\\.ph$'),
        ],
      ],
      newEmail: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern('^[a-z0-9._%+-]+@[(ust.edu)]+\\.ph$'),
        ],
      ],
      password: ['', Validators.required],
    });

    this.deleteAccountForm = this.fb.group({
      currentEmail: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern('^[a-z0-9._%+-]+@[(ust.edu)]+\\.ph$'),
        ],
      ],
      password: ['', Validators.required],
    });

    this.changePassForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern('^[a-z0-9._%+-]+@[(ust.edu)]+\\.ph$'),
        ],
      ],
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
    });

    this.editModal = false;
    this.changePassModal = false;
    this.deleteModal = false;
  }

  public triggerEditModal() {
    this.editModal = !this.editModal;
    this.editAccountForm.controls.displayName.setValue(this.fsData.displayName);
    this.editAccountForm.controls.contactNumber.setValue(
      this.fsData.contactNumber
    );
  }

  public triggerChangePassModal() {
    this.changePassModal = !this.changePassModal;
  }

  public triggerDeleteModal() {
    this.deleteModal = !this.deleteModal;
  }

  public triggerChangeEmailModal() {
    this.editEmailModal = !this.editEmailModal;
  }

  extension = '';
  file = '';
  preview = '';

  public handleOnChangeFile(event: any) {
    this.preview = '';
    const files = event.target.files;
    this.extension = files[0].type;
    this.file = files[0];
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.onload = (event: any) => {
        this.preview = event.target.result;
      };
      reader.readAsDataURL(event.target.files[0]);
    }

    console.log(this.preview);
  }
  public editMyProfile() {
    if (this.editAccountForm.valid) {
      this.auth
        .editMyProfile(
          this.editAccountForm.controls['displayName'].value,
          this.editAccountForm.controls['contactNumber'].value,
          this.fsData.email,
          this.editAccountForm.controls['password'].value,
          this.fsData.id,
          this.file,
          this.extension,
          this.fsData.photoUrl
        )
        .then(() => this.triggerEditModal())
        .finally(() => this.editAccountForm.reset());
    } else if (this.editAccountForm.invalid) {
      this.editAccountForm.controls['displayName'].markAsTouched();
      this.editAccountForm.controls['contactNumber'].markAsTouched();
      this.editAccountForm.controls['password'].markAsTouched();
      this.toastService.publish(
        'Please fill up all required fields properly',
        'formError'
      );
    }
    /*
    this.auth.editMyProfile(this.displayName,this.contactNumber,this.currentEmail,this.newEmail,this.password,this.fsData.id).then(() => alert('User Profile Has Been Updated')).then(() => this.triggerEditModal())
    */
  }

  public deleteMyProfile() {
    if (this.deleteAccountForm.valid) {
      this.auth
        .deleteMyProfile(
          this.deleteAccountForm.controls['currentEmail'].value,
          this.deleteAccountForm.controls['password'].value,
          this.fsData.id
        )
        .then(() => this.triggerDeleteModal())
        .finally(() => this.deleteAccountForm.reset());
    } else if (this.deleteAccountForm.invalid) {
      this.deleteAccountForm.controls['currentEmail'].markAsTouched();
      this.deleteAccountForm.controls['password'].markAsTouched();
      this.toastService.publish(
        'Please fill up all required fields properly',
        'formError'
      );
    }
    /*
    this.auth.deleteMyProfile(this.currentEmail,this.password,this.fsData.id)*/
  }

  public changePassword() {
    if (this.changePassForm.valid) {
      this.auth
        .changeMyPassword(
          this.changePassForm.controls['email'].value,
          this.changePassForm.controls['oldPassword'].value,
          this.changePassForm.controls['newPassword'].value
        )
        .then(() => this.triggerChangePassModal())
        .finally(() => this.changePassForm.reset());
    } else if (this.changePassForm.invalid) {
      this.changePassForm.controls['email'].markAsTouched();
      this.changePassForm.controls['oldPassword'].markAsTouched();
      this.changePassForm.controls['newPassword'].markAsTouched();
      this.toastService.publish(
        'Please fill up all required fields properly',
        'formError'
      );
    }
  }

  public editMyEmail() {
    if (this.updateEmailForm.valid) {
      this.auth
        .changeEmail(
          this.updateEmailForm.controls['currentEmail'].value,
          this.updateEmailForm.controls['newEmail'].value,
          this.updateEmailForm.controls['password'].value,
          this.fsData.id
        )
        .then(() => this.triggerChangeEmailModal())
        .finally(() => this.updateEmailForm.reset());
    } else if (this.editAccountForm.invalid) {
      this.updateEmailForm.controls['currentEmail'].markAsTouched();
      this.updateEmailForm.controls['newEmail'].markAsTouched();
      this.updateEmailForm.controls['password'].markAsTouched();
      this.toastService.publish(
        'Please fill up all required fields properly',
        'formError'
      );
    }
  }
}
