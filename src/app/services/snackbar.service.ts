import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../components/snackbar/snackbar.component';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(private _snackBar: MatSnackBar) { }

  openSnackbar(displayText: string, duration: number){
    this._snackBar.openFromComponent(SnackbarComponent, {
      duration: duration,
      data: displayText
    });
  }
  
}
