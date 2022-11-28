import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  show: boolean = false;
  name!: string;
  number!: string;
  loginForm!: any;
  constructor(
    public auth: AuthService,
    readonly fire: AngularFireAuth,
    public router: Router,
    public toastService: ToastService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['',[Validators.required,
                  Validators.email,
                  Validators.pattern('^[a-z0-9._%+-]+@[(ust.edu)]+\\.ph$')]],
      password: ['', Validators.required],
    });
  }

  /*
  public signUp() {
    this.auth.signup(this.email,this.password,this.name,this.number)
  }
  */

  public login() {
    if (this.loginForm.valid) {
      this.auth.signIn(
        this.loginForm.controls['email'].value,
        this.loginForm.controls['password'].value
      );
    } else if (this.loginForm.invalid) {
      this.loginForm.controls['email'].markAsTouched();
      this.loginForm.controls['password'].markAsTouched();
      this.toastService.publish(
        'Please fill up all required fields properly',
        'formError'
      );
    }
    /*
    if (this.email == '' && this.password == '') {
      this.toastService.publish('Please fill up all required fields properly','formError');    }
    if (this.email != '' && this.password != '') {
      this.auth.signIn(this.email,this.password)
    } */
  }

  password() {
    this.show = !this.show;
  }
}
