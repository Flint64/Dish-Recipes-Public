import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Tip } from 'src/app/models/Tip.model';
import { AuthService } from 'src/app/services/auth.service';
import { TipService } from 'src/app/services/tip.service';
import { ConfirmComponent } from '../confirm/confirm.component';
import { Clipboard } from '@angular/cdk/clipboard';
import { FavoriteTip } from 'src/app/models/FavoriteTip.model';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-view-tip',
  templateUrl: './view-tip.component.html',
  styleUrls: ['./view-tip.component.scss']
})
export class ViewTipComponent implements OnInit {

  spinnerActive: boolean = false;
  spinnerText = "Fetching Tip";
  tip: Tip = null;
  allowEdit: boolean = false;
  isFavorite: boolean = false;
  
  constructor(private router: Router, private route: ActivatedRoute, private tipService: TipService, private fireAuth: AngularFireAuth, private authService: AuthService, private dialog: MatDialog, private clipboard: Clipboard, private snackbarService: SnackbarService) { }

  ngOnInit(): void {

    this.spinnerActive = true;

    this.tipService.getSingleTip(this.route.snapshot.url[1].path).subscribe((result) => {
      this.tip = result['tip'];
      if (result['favorite']){
        this.isFavorite = true;
      }

      //Timeout here to make sure that fireAuth returns the current user on page refresh
      setTimeout(() => {
        this.fireAuth.currentUser.then((res) => {
          //If there is no token, then the user is not logged in. Stop execution to prevent errors.
          if (!res){ this.spinnerActive = false; return; }
          this.authService.getUserId(res.email).subscribe((result) => {
            if (this.tip['user'] === result['user']._id){
              this.allowEdit = true;
              this.spinnerActive = false;
            } else {
              this.spinnerActive = false;
            }
          })
        });
    }, 500);
    });
    
    
  }

  // Favorites a tip. gets current logged in users email, gets your
  // user id from the email, then adds a favorite tip
  favoriteTip(tipId: string){
    this.fireAuth.currentUser.then((res) => {
      //If there is no token, then the user is not logged in. Stop execution to prevent errors.
      if (!res){
        this.router.navigate(['log-in'])
        return;
      }

      this.authService.getUserId(res.email).subscribe((result) => {
        const favoriteTip = new FavoriteTip(tipId, result['user']._id)
        this.tipService.favoriteTip(favoriteTip).subscribe((result) => {
          this.isFavorite = true;
          this.snackbarService.openSnackbar("Favorite Added!", 1500);
        });
      });
   });
  }

    // Deletes a favorite recipe. 
    deleteFavorite(tipId: string){
      this.tipService.removeFavorite(tipId).subscribe((result) => {
        this.isFavorite = false;
        this.snackbarService.openSnackbar("Favorite Removed!", 1000);
      });
    }

  editTip(){
    this.router.navigate(['/edit-tip/' + this.tip['_id']]);
  }


  deleteTip(){

    let dialogRef = this.dialog.open(ConfirmComponent, {
      height: '150px',
      width: '80vw',
      data: {tip: true}
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result){
        if (result.delete){
          this.spinnerActive = true;
          this.spinnerText = "Deleting Tip";
          this.tipService.deleteTip(this.tip['_id']).subscribe((result) => {
            this.snackbarService.openSnackbar("Tip Deleted!", 1000);
            sessionStorage.clear();
            this.router.navigate(['/my/tips']);
          });
          return;
        }
      }
    });
    
  }
  
  shareTip(id: string) {
    this.clipboard.copy('dish-recipes.app/quick-tips/' + id);
    this.snackbarService.openSnackbar('Tip link copied!', 1000);
  }
    
  navigate(path){
    setTimeout(() => {
      this.router.navigate([path]);
    }, 200);
  }
  
}
