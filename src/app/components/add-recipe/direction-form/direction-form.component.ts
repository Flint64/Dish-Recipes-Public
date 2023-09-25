import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Direction } from 'src/app/models/direction.model';
import { Recipe } from 'src/app/models/Recipe.model';

@Component({
  selector: 'app-direction-form',
  templateUrl: './direction-form.component.html',
  styleUrls: ['./direction-form.component.scss']
})
export class DirectionFormComponent implements OnInit {
  
  directionSections: number = -1;
  recipeForm: FormGroup;
  recipe: Recipe;
  editMode: boolean = false;
  index: number = null;
  pageTitle: string = null;
  viewInit: boolean = false;
  reorder: boolean = false;
  reorderText: string = "Reorder";

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private formBuilder: FormBuilder, public dialogRef: MatDialogRef<DirectionFormComponent>,) { }

  ngOnInit(): void {
     this.editMode = this.data.editMode;
     this.recipe = this.data.recipe;
     this.index = parseInt(this.data.index);    

     this.recipeForm = this.formBuilder.group({
      recipeDirections: this.formBuilder.array([]),
    })

    //If we have a direction, such as editing a direction added from the recipeForm, display its info to edit
    if (this.data.direction){
      
      this.directionSections++;

      let dir = this.formBuilder.group({
        title: this.formBuilder.control(this.data.direction.title, Validators.required),
        steps: this.formBuilder.array([], Validators.required)
      });

      this.recipeDirections().push(dir);

      this.data.direction.steps.forEach(step => {
        let i = this.formBuilder.group({
          step: step
        }, Validators.required);
        this.directionSteps(this.directionSections).push(i); 
      });
 
    //Otherwise add an empty section for adding a new ingredient
    } else {
      this.addDirection();
    }

  }

  //This removes the auto focus of the input field when opening a dialog, 
  //and then resets the form errors due to the focus being active for
  //a tiny amount of time which then causes an error due to required validators
  removeFocus(event){
    //Don't reset the form if there are values in place    
    if ((<FormArray>this.recipeForm.controls['recipeDirections']).controls[0]['controls']['title'].value){
      return;
    }
    
    if (!this.viewInit){
      event.target.blur();
      this.recipeForm.reset();
      this.viewInit = true;
    }
  }


  onCancel(){
    setTimeout(() => {
      this.dialogRef.close();
    }, 200);
  }

  onSubmit(){
    setTimeout(() => {
      let directionArr = [];
    
    for (let i = 0; i < (<FormArray>this.recipeForm.controls['recipeDirections']).controls[0]['controls'].steps['controls'].length; i++){
      directionArr.push((<FormArray>this.recipeForm.controls['recipeDirections']).controls[0]['controls'].steps['controls'][i]['controls'].step.value);
    }
    
    let directions = new Direction(null, directionArr);
    directions.title = (<FormArray>this.recipeForm.controls['recipeDirections']).controls[0]['controls'].title.value;
    this.dialogRef.close({data: directions, index: this.index});  
    }, 200);
  }
  

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    clearTitle(empIndex: number){
      (<FormArray>this.recipeForm.controls['recipeDirections']).controls[empIndex]['controls']['title'].setValue('');
    }
  
    clearStep(empIndex: number, stepIndex: number){
      (<FormArray>this.recipeForm.controls['recipeDirections']).controls[empIndex]['controls'].steps['controls'][stepIndex]['controls'].step.setValue('');
    }
  
    getStep(empIndex: number, stepIndex: number){
      if ((<FormArray>this.recipeForm.controls['recipeDirections']).controls[empIndex]['controls'].steps['controls'][stepIndex]['controls'].step.value !== ''){
        return false;
      } else {
        return true;
      }
    }
  
    
  /*********************************************************************************
  * GET Directions FormArray
  **********************************************************************************/
  recipeDirections(): FormArray {
    return this.recipeForm.get("recipeDirections") as FormArray
  }
  
  /*********************************************************************************
  * CREATE New Direction
  **********************************************************************************/
  newDirection(): FormGroup {
    return this.formBuilder.group({
      title: this.formBuilder.control('', Validators.required),
      steps: this.formBuilder.array([], Validators.required)
    })
  }
  
  /*********************************************************************************
  * ADD New Direction
  **********************************************************************************/  
  addDirection() {
    this.directionSections++;
    this.recipeDirections().push(this.newDirection());
    // if (!this.editMode){
      this.addDirectionStep(this.directionSections);
    // }
  }
  
  /*********************************************************************************
  * REMOVE New Direction
  **********************************************************************************/  
  removeDirection(empIndex:number) {
    this.directionSections--;
    this.recipeDirections().removeAt(empIndex);
  }
  
  /*********************************************************************************
  * GET Steps Array
  **********************************************************************************/
  directionSteps(empIndex:number) : FormArray {
    return this.recipeDirections().at(empIndex).get("steps") as FormArray
  }
  
  /*********************************************************************************
  * CREATE New Step
  **********************************************************************************/
  newStep(): FormGroup {
    return this.formBuilder.group({
      step: ''
    }, Validators.required)
  }
  
  /*********************************************************************************
  * ADD New Step
  **********************************************************************************/
  addDirectionStep(empIndex:number) {
    this.directionSteps(empIndex).push(this.newStep());
    this.recipeForm.setErrors({ 'invalid': true });
  }
  
  /*********************************************************************************
  * REMOVE Direction Step
  **********************************************************************************/
  removeDirectionStep(empIndex:number, stepIndex:number) {
    this.directionSteps(empIndex).removeAt(stepIndex);
  }
  

  
drop(event: CdkDragDrop<string[]>) {
  this.moveItemInFormArray(this.recipeForm.get("recipeDirections")['controls'][0]['controls']['steps'] as FormArray, event.previousIndex, event.currentIndex);
}

/**
 * Moves an item in a FormArray to another position.
 * @param formArray FormArray instance in which to move the item.
 * @param fromIndex Starting index of the item.
 * @param toIndex Index to which he item should be moved.
 */
 moveItemInFormArray(formArray: FormArray, fromIndex: number, toIndex: number): void {
  const from = this.clamp(fromIndex, formArray.length - 1);
  const to = this.clamp(toIndex, formArray.length - 1);

  if (from === to) {
    return;
  }

  const previous = formArray.at(from);
  const current = formArray.at(to);
  formArray.setControl(to, previous);
  formArray.setControl(from, current);
}

/** Clamps a number between zero and a maximum. */
clamp(value: number, max: number): number {
  return Math.max(0, Math.min(max, value));
}

toggleReorder(){
  this.reorder = !this.reorder;
  if (this.reorder){
    this.reorderText = "Stop reordering";
  } else {
    this.reorderText = "Reorder";
  }
}
  
  }
  