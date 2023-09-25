import { Injectable, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Subject, Subscription } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {

  isAuthenticated: boolean = false;
  authChangeEvent = new Subject<boolean>();
  fireAuthSubscription: Subscription = null;

  registrationEmailErrorEvent = new Subject<string>();
  LoginErrorEvent = new Subject<string[]>();

  createAccountErrorEvent = new Subject<any>();

  constructor(private fireAuth: AngularFireAuth, private router: Router, private http: HttpClient) { 
    
/***************************************************************************
 * Init Auth Listener - Subscribes to the auth state of firebase, handled
 * behind the scenes.
 * 
 * this.authChangedEvent is currently subscribed to in the header and is
 * used to show/hide the logout button.
 ****************************************************************************/
    if (this.fireAuthSubscription === null){
      this.fireAuthSubscription = this.fireAuth.authState.subscribe(user => {
        if (user){
          this.isAuthenticated = true;
          this.authChangeEvent.next(true);
        } else {
          this.isAuthenticated = false;
          this.authChangeEvent.next(false);
        }
      });
    }
  }

ngOnDestroy(): void {
  this.fireAuthSubscription.unsubscribe();
}

getUserId(email){
  return this.http.get('https://dish-recipes-url/api/getUserId/' + email);
}

/***************************************************************************
 * Register User / create account - Registers a user with firebase via email & password. 
 * On success, the users collection is updated with the other data from the
 * registration form.
 * 
 * logout(true) is called here to force the app to not auto-authenticate 
 * on registration. You get logged out and then redirected to the sign-in 
 * component where you can then sign in and use the site as intended.
 ****************************************************************************/
 registerUser(email, password, username){

  let user = {
    email: email,
    username: username
  }
  
  this.http.post<{message: string}>('https://dish-recipes-url/api/createUser', JSON.stringify(user)).subscribe((result) => {
    // console.log(result);
    if (result.message === "User added successfully"){

      this.fireAuth.createUserWithEmailAndPassword(email, password).then(result => {
        this.logoutNoNavigate();  
        this.router.navigate(['/log-in']);
    
      }).catch(err => {
        if (err.message){
          this.registrationEmailErrorEvent.next(err.message);
        }
      });
    
    } 
    
    if (result.message === "Username or email already in use"){
      this.createAccountErrorEvent.next(result);
    }
  });

}
  

/***************************************************************************
 * Login - Logs in a user with firebase. On successful auth via email
 * & password, you are redirected to the dashboard/profile page. This may
 * change based on role.
 * 
 * Pass authentication errors to an array to be sent on LoginErrorEvent.next().
 * The first argument is the field the error relates to, and the second is
 * the error message. We listen to these in the sign-in component and display
 * the errors as needed based on the data passed here.
 ****************************************************************************/
 login(email: string, password: string){
  this.fireAuth.signInWithEmailAndPassword(email, password).then(result => {
    //Do something on login success
    this.router.navigate(['/profile']);

  }).catch(err => {

    let errArr: string[] = [];

    if (err.message){
      switch (err.code){
        case "auth/wrong-password": 
        errArr[0] = "password";
        errArr[1] = "Incorrect password";
        break;

        case "auth/user-not-found": 
        errArr[0] = "email";
        errArr[1] = "Email address not found";
        break;

        case "auth/invalid-email": 
        errArr[0] = "email";
        errArr[1] = "Please enter a valid email";
        break;
      }
      this.LoginErrorEvent.next(errArr);
    }
  });
}

/***************************************************************************
 * Log out - Logs the user out. when (true), redirect to sign-in page
 * (only happens on registration). Otherwise, we redirect back to the home
 * page, and cancel all subscriptions to prevent errors or extra updates or
 * data leaks. Pass false to authChangedEvent to notify the header to update
 * it's links, remove the users email from the variable.
 ****************************************************************************/
logout(sendToLogin: boolean = false){
  if (sendToLogin){
    this.router.navigate(['/log-in']);
  } else {
    this.router.navigate(['/view-recipes']);
  }
  this.fireAuth.signOut();
  this.authChangeEvent.next(false);
}

logoutNoNavigate(){
  this.fireAuth.signOut();
  this.authChangeEvent.next(false);
}


}
