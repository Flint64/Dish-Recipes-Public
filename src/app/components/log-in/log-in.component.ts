import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.scss']
})
export class LogInComponent implements OnInit, OnDestroy {

  loginErrorSubscription: Subscription;
  loginForm: FormGroup;
  emailErrorMessage: string = "";
  passwordErrorMessage: string = "";
  
  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {

    this.loginForm = new FormGroup({
      'email': new FormControl('', [Validators.required]),
      'password': new FormControl('', [Validators.required]),
    });

/***************************************************************************
 * Listen to the errors passed from the authService to display/hide login
 * error messages. On each be it password or email, we set the error message,
 * set the error state of the formControl to invalid & clear the opposite
 * of errors as only one error will be displayed at a time.
****************************************************************************/
this.loginErrorSubscription = this.authService.LoginErrorEvent.subscribe((message: string[]) => {

  switch (message[0]){
    case "email": 
      this.emailErrorMessage = message[1];
      this.loginForm.controls['email'].setErrors({'incorrect': true});
      this.loginForm.controls['password'].setErrors({'incorrect': null})
      this.loginForm.controls['password'].updateValueAndValidity();
      this.loginForm.controls['email'].setValue("");
      this.passwordErrorMessage = "";
    break;

    case "password": 
      this.passwordErrorMessage = message[1];
      this.loginForm.controls['password'].setErrors({'incorrect': true});
      this.loginForm.controls['email'].setErrors({'incorrect': null})
      this.loginForm.controls['email'].updateValueAndValidity();
      this.loginForm.controls['password'].setValue("");
      this.emailErrorMessage = "";
    break;

  }

});
    
  }

  onSubmit(){
    this.authService.login(this.loginForm.controls['email'].value, this.loginForm.controls['password'].value);
  }
  
  getEmailErrorMessage() {
    if (this.emailErrorMessage !== ''){
      return this.emailErrorMessage;
    }

    if (this.loginForm.controls.email.hasError('required')) {
      return 'Email is required';
    }
  }

  getPasswordErrorMessage(){
    if (this.passwordErrorMessage !== ''){
      return this.passwordErrorMessage; 
    }
    
    if (this.loginForm.controls.password.hasError('required')) {
      return 'Password is required';
    }
  }

  navigate(path){
    setTimeout(() => {
      this.router.navigate([path]);
    }, 200);
  }

  ngOnDestroy(): void {
    this.loginErrorSubscription.unsubscribe();
  }
  
}
