import { invalid } from '@angular/compiler/src/render3/view/util';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, RequiredValidator, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss']
})
export class CreateAccountComponent implements OnInit, OnDestroy {

  createAccountForm: FormGroup;
  spinnerActive: boolean = false;
  spinnerText: string = "Creating Account"
  usernameErrorSubscription: Subscription;
  usernameTaken: boolean = false;
  emailTaken: boolean = false;
  username: string = "";
  email: string = "";
  
  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {

    this.createAccountForm = new FormGroup({
      'email': new FormControl('', [Validators.required, Validators.email]),
      'username': new FormControl('', [Validators.required]),

      //Pattern: minimum six characters, at least one letter and one number:
      'password': new FormControl('', [Validators.required, Validators.pattern(new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$'))]),
      'confirmPassword': new FormControl('', [Validators.required, Validators.pattern(new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$'))]),
    });

    // Turn off the spinner and check the result to see if it is the username, email, or both that
    // are already in use. If the returned data matches the stored email/username, empty the 
    // input field and set the error to show
    this.usernameErrorSubscription = this.authService.createAccountErrorEvent.subscribe((result) => {
      this.spinnerActive = false;

      if (result.data.length > 1){
        if (result.data[0].email === this.email || result.data[1].email === this.email ){
          this.createAccountForm.controls.email.setValue('');
          this.emailTaken = true;
        }
      } else {
        if (result.data[0].email === this.email){
          this.createAccountForm.controls.email.setValue('');
          this.emailTaken = true;
        }
      }

      if (result.data.length > 1){
        if (result.data[0].username === this.username || result.data[1].username === this.username ){
          this.createAccountForm.controls.username.setValue('');
          this.usernameTaken = true;
        }
      } else {
        if (result.data[0].username === this.username){
          this.createAccountForm.controls.username.setValue('');
          this.usernameTaken = true;
        }
      }
    
    });
    
  }

  ngOnDestroy(): void {
    this.usernameErrorSubscription.unsubscribe();
  }

  onSubmit(){
    this.spinnerActive = true;
    this.authService.registerUser(this.createAccountForm.controls['email'].value, this.createAccountForm.controls['password'].value, this.createAccountForm.controls['username'].value);
  }

  getUsernameErrorMessage(){
    if (this.createAccountForm.controls.username.hasError('required') && this.usernameTaken){
      return 'Username ' + this.username + ' already in use';
    }
    
    if (this.createAccountForm.controls.username.hasError('required') && !this.usernameTaken) {
      return 'A username is required';
    }
  }
  
  getEmailErrorMessage() {
    if (this.createAccountForm.controls.email.hasError('required') && this.emailTaken) {
      return 'Email ' + this.email + ' already in use';
    }
    
    if (this.createAccountForm.controls.email.hasError('required') && !this.emailTaken) {
      return 'Email is required';
    }

    return this.createAccountForm.controls.email.hasError('email') ? 'Not a valid email' : '';
  }

  getPasswordErrorMessage(){

    if (this.createAccountForm.controls.password.hasError('required')) {
      return 'Password is required';
    }

    return this.createAccountForm.controls.password.hasError('pattern') ? 'Password requirements not met' : '';
  }

  saveName(){
    this.username = this.createAccountForm.controls.username.value;
    this.usernameTaken = false;
  }

  saveEmail(){
    this.email = this.createAccountForm.controls.email.value;
    this.emailTaken = false;
  }
  
  navigate(path){
    setTimeout(() => {
      this.router.navigate([path]);
    }, 200);
  }

}
