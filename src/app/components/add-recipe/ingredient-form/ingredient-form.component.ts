import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Ingredient } from 'src/app/models/Ingredient.model';
import { Recipe } from 'src/app/models/Recipe.model';

@Component({
  selector: 'app-ingredient-form',
  templateUrl: './ingredient-form.component.html',
  styleUrls: ['./ingredient-form.component.scss']
})
export class IngredientFormComponent implements OnInit {

  ingredientSections: number = -1;
  recipeForm: FormGroup;
  recipe: Recipe;
  index: number = null;
  pageTitle: string = null;
  viewInit: boolean = false;
  reorder: boolean = false;
  reorderText: string = "Reorder";

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private formBuilder: FormBuilder, public dialogRef: MatDialogRef<IngredientFormComponent>) { }

  ngOnInit(): void {

        this.recipe = this.data.recipe;
        this.index = parseInt(this.data.index);

        this.recipeForm = this.formBuilder.group({
          recipeIngredients: this.formBuilder.array([]),
        })
  
        //If we have an ingredient, such as editing an ingredient added from the recipeForm, display its info to edit
        if (this.data.ingredient){
          
          this.ingredientSections++;
  
          let ing = this.formBuilder.group({
            ingredientTitle: this.formBuilder.control(this.data.ingredient.title, Validators.required),
            ingredients: this.formBuilder.array([], Validators.required)
          });
  
          this.recipeIngredients().push(ing);
  
          this.data.ingredient.ingredients.forEach(ingredient => {
            let i = this.formBuilder.group({
              ingredient: ingredient
            }, Validators.required);
            this.ingredients(this.ingredientSections).push(i); 
          });
     
        //Otherwise add an empty section for adding a new ingredient
        } else {
          this.addIngredientSection();
        }
    
  }

  //This removes the auto focus of the input field when opening a dialog, 
  //and then resets the form errors due to the focus being active for
  //a tiny amount of time which then causes an error due to required validators
  removeFocus(event){
    //Don't reset the form if there are values in place
    if ((<FormArray>this.recipeForm.controls['recipeIngredients']).controls[0]['controls']['ingredientTitle'].value){
      return;
    }
    
    if (!this.viewInit){
      event.target.blur();
      this.recipeForm.reset();
      this.viewInit = true;
    }
  }

  onSubmit(){
    setTimeout(() => {
      let ingArr = [];
    
      for (let i = 0; i < (<FormArray>this.recipeForm.controls['recipeIngredients']).controls[0]['controls'].ingredients['controls'].length; i++){
        ingArr.push((<FormArray>this.recipeForm.controls['recipeIngredients']).controls[0]['controls'].ingredients['controls'][i]['controls'].ingredient.value);
      }
      
      let ingredients = new Ingredient(null, ingArr);
      ingredients.title = (<FormArray>this.recipeForm.controls['recipeIngredients']).controls[0]['controls']['ingredientTitle'].value;
  
      this.dialogRef.close({data: ingredients, index: this.index});
    }, 200);
  }
  
  onCancel(){
    setTimeout(() => {
      this.dialogRef.close();
    }, 200);
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  clearIngredientTitle(empIndex: number){
    (<FormArray>this.recipeForm.controls['recipeIngredients']).controls[empIndex]['controls']['ingredientTitle'].setValue('');
  }

  clearIngredient(empIndex: number, stepIndex: number){
    (<FormArray>this.recipeForm.controls['recipeIngredients']).controls[empIndex]['controls'].ingredients['controls'][stepIndex]['controls'].ingredient.setValue('');
  }

  getIngredient(empIndex: number, stepIndex: number){
    if ((<FormArray>this.recipeForm.controls['recipeIngredients']).controls[empIndex]['controls'].ingredients['controls'][stepIndex]['controls'].ingredient.value !== ''){
      return false;
    } else {
      return true;
    }
  }

/***************************
* Add Ingredients stuff
****************************/
/*********************************************************************************
* GET Ingredients FormArray
**********************************************************************************/
recipeIngredients(): FormArray {
  return this.recipeForm.get("recipeIngredients") as FormArray
}

/*********************************************************************************
* CREATE New Ingredient Section
**********************************************************************************/
newIngredientSection(): FormGroup {
  return this.formBuilder.group({
    ingredientTitle: this.formBuilder.control('', Validators.required),
    ingredients: this.formBuilder.array([], Validators.required)
  })
}

/*********************************************************************************
* ADD New Ingredient Section
**********************************************************************************/  
addIngredientSection() {
  this.ingredientSections++;
  this.recipeIngredients().push(this.newIngredientSection());
    this.addIngredient(this.ingredientSections);
}

/*********************************************************************************
* REMOVE Ingredient Section
**********************************************************************************/  
removeIngredientSection(empIndex:number) {
  this.ingredientSections--;
  this.recipeIngredients().removeAt(empIndex);
}

/*********************************************************************************
* GET Ingredients Array
**********************************************************************************/
ingredients(empIndex:number) : FormArray {
  return this.recipeIngredients().at(empIndex).get("ingredients") as FormArray
}

/*********************************************************************************
* CREATE New Ingredient
**********************************************************************************/
newIngredient(): FormGroup {
  return this.formBuilder.group({
    ingredient: ''
  }, Validators.required)
}

/*********************************************************************************
* ADD New Ingredient
**********************************************************************************/
addIngredient(empIndex:number) {
  this.ingredients(empIndex).push(this.newIngredient());
  this.recipeForm.setErrors({ 'invalid': true });
}

/*********************************************************************************
* REMOVE Section Ingredient
**********************************************************************************/
removeIngredient(empIndex:number, stepIndex:number) {
  this.ingredients(empIndex).removeAt(stepIndex);
}

drop(event: CdkDragDrop<string[]>) {
  this.moveItemInFormArray(this.recipeForm.get("recipeIngredients")['controls'][0]['controls']['ingredients'] as FormArray, event.previousIndex, event.currentIndex);
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
