import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent implements OnInit {

  confirmText: string = "";
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<ConfirmComponent>) { }

  ngOnInit(): void {

    if (this.data['recipe']){
      this.confirmText = "Delete recipe?";
    }
    
    if (this.data['tip']){
      this.confirmText = "Delete Tip?";
    }
    
  }

  onDelete(){
    setTimeout(() => {
      this.dialogRef.close({delete: true});
    }, 200);
  }

  onCancel(){
    setTimeout(() => {
      this.dialogRef.close();
    }, 200);
  }

}
