import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFireAuth  } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  email!:string;
  fgForm!: any;
  constructor(
    public auth: AuthService,
    readonly fire: AngularFireAuth,
    public toastService: ToastService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.fgForm = this.fb.group({
      email: ['',[Validators.required,
                  Validators.email,
                  Validators.pattern('^[a-z0-9._%+-]+@[(ust.edu)]+\\.ph$')]],
    });
  }

  public sendPasswordReset() {
    if (this.fgForm.valid) {
      this.auth.sendPasswordReset(this.fgForm.controls['email'].value)
    }
      else if (this.fgForm.invalid) {
      this.fgForm.controls['email'].markAsTouched();
      this.toastService.publish('Please fill up all required fields properly','formError');
      }
    /*
    if (this.email == '') {
      this.toastService.publish('Please fill up all required fields properly','formError');
    }
    if (this.email != '') {
    this.auth.sendPasswordReset(this.email)
    }
    */
  }
}
