import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Tip } from 'src/app/models/Tip.model';
import { AuthService } from 'src/app/services/auth.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { TipService } from 'src/app/services/tip.service';
import { ConfirmComponent } from '../confirm/confirm.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-add-tip',
  templateUrl: './add-tip.component.html',
  styleUrls: ['./add-tip.component.scss']
})
export class AddTipComponent implements OnInit {

  tipForm: FormGroup;
  spinnerActive: boolean = false;
  spinnerText = "Adding Tip";
  id: string = null;
  editMode: boolean = false;
  tip: Tip = null;
  
  constructor(private router: Router, private route: ActivatedRoute, private tipService: TipService, private fireAuth: AngularFireAuth, private authService: AuthService, private dialog: MatDialog, private snackbarService: SnackbarService, private _location: Location) { }

  ngOnInit(): void {

    this.route.params.subscribe((params: Params) => {
      this.id = params.id;
      
      if (this.id === null || this.id === undefined){
        return;
      }


      //If we're editing the tip
      this.tipService.getSingleTip(this.id).subscribe((result) => {
        this.tip = result['tip'];
        this.editMode = true;
        this.spinnerText = "Updating Tip";

        this.tipForm = new FormGroup({
          'title': new FormControl(this.tip.title, Validators.required),
          'description': new FormControl(this.tip.description, Validators.required),
        });
        
    });

      return;
    });

    this.tipForm = new FormGroup({
      'title': new FormControl('', Validators.required),
      'description': new FormControl('', Validators.required),
    });
    
  }

  navigate(path){
    setTimeout(() => {

      if (path === ''){
        this._location.back();
        return;
      }
      
      this.router.navigate([path]);
    }, 200);
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
            this.router.navigate(['/quick-tips']);
          });
          return;
        }
      }
    });
    
  }

  onSubmit(){

    this.spinnerActive = true;
    
    this.fireAuth.currentUser.then((res) => {
      //If there is no token, then the user is not logged in. Stop execution to prevent errors.
      if (!res){ return; }
      this.authService.getUserId(res.email.toString()).subscribe((result) => {

        //If we're editing the tip
        if (this.editMode){
          this.tip.title = this.tipForm.controls.title.value;
          this.tip.description = this.tipForm.controls.description.value;

          this.tipService.updateTip(this.tip, this.id).subscribe((result) => {           
            this.router.navigate(['/quick-tips']);
          });
          
        } else { //Submitting normal tip
          this.tipService.addTip(new Tip(this.tipForm.controls.title.value, this.tipForm.controls.description.value, result['user']._id)).subscribe((result) => {
            this.router.navigate(['/quick-tips']);
          });
        }


      });
      
    });
    
  }

}
