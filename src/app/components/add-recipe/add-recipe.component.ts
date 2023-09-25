import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Ingredient } from 'src/app/models/Ingredient.model';
import { Recipe } from 'src/app/models/Recipe.model';
import { Direction } from 'src/app/models/Direction.model';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { IngredientFormComponent } from './ingredient-form/ingredient-form.component';
import { DirectionFormComponent } from './direction-form/direction-form.component';
import { ENTER, SPACE } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { RecipeServiceService } from 'src/app/services/recipe.service';
import { AngularFireStorage } from "@angular/fire/storage";
import { finalize } from "rxjs/operators";
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthService } from 'src/app/services/auth.service';
import { ConfirmComponent } from '../confirm/confirm.component';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-add-recipe',
  templateUrl: './add-recipe.component.html',
  styleUrls: ['./add-recipe.component.scss']
})
export class AddRecipeComponent implements OnInit {

  @ViewChild('imgPreview', {static: false}) imgPreview: ElementRef;
  @ViewChild('fileInput', {static: false}) fileInput: ElementRef;
  
  recipeForm: FormGroup;
  ingredientArray: Ingredient[] = [];
  directionArray: Direction[] = [];
  recipe: Recipe;
  numberOfSections: number = -1;
  ingredientSections: number = -1;
  date: Date = null;
  id: string = "";
  imageSelected: boolean = false;
  imageChanged: boolean = false;
  image = null;
  uploadedImageUrl: string = "";

  spinnerText: string = "";
  spinnerActive: boolean = false;
  
  downloadURL: Observable<string>;
  editMode: boolean = false;
  
/***************************
* Adding tag stuff
****************************/
visible = true;
selectable = true;
removable = true;
addOnBlur = true;
readonly separatorKeysCodes: number[] = [ENTER, SPACE];
tags: string[] = [];

  constructor(private formBuilder: FormBuilder, private dialog: MatDialog, private router: Router, private route: ActivatedRoute, private recipeService: RecipeServiceService, private storage: AngularFireStorage, private fireAuth: AngularFireAuth, private authService: AuthService, private snackbarService: SnackbarService, private _location: Location) { }

  ngOnInit(): void {

    this.route.params.subscribe((params: Params) => {
            
      this.id = params.id;
      
      if (this.id === null || this.id === undefined){
        return;
      }

      // If we're editing the recipe
      this.recipeService.getSingleRecipe(this.id).subscribe((result) => {
        this.recipe = result['recipe'];
        this.editMode = true;
        // console.log(this.recipe);

        //Display the image, if any from the recipe we're editing
        this.imgPreview.nativeElement.innerHTML = '<img src="' + this.recipe.imgUrl + '" style="width: 200px; display: block;" />';
        if (this.recipe.imgUrl !== ''){
          this.imageSelected = true;
        }

      this.numberOfSections = -1;
      this.ingredientSections = -1;

      this.recipeForm = this.formBuilder.group({
        recipeName: (this.formBuilder.control, null, Validators.required),
        recipeDescription: (this.formBuilder.control, null),
        recipeIngredients: this.formBuilder.array([]),
        recipeDirections: this.formBuilder.array([]),
        notes: (this.formBuilder.control, null),
        tags: this.formBuilder.array([]),
        image: (this.formBuilder.control, null)
      })

    this.recipe.ingredients.forEach(e => {
      this.ingredientArray.push(e);
    });

    this.recipe.directions.forEach(e => {
      this.directionArray.push(e);
    });

      this.recipe.tags.forEach(element => {
        this.tags.push(element.trim());
      });

      this.recipeForm.patchValue({
        'recipeName': this.recipe.name,
        'recipeDescription': this.recipe.description,
        'notes': this.recipe.notes
        // 'recipeDirections': this.recipe.directions,
      });

      this.date = this.recipe.date;
        
      });

    })


    //Regular flow if not editing
      let date = new Date;
      this.date = new Date((date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear());

      this.recipeForm = this.formBuilder.group({
        recipeName: (this.formBuilder.control, null, Validators.required),
        recipeDescription: (this.formBuilder.control),
        recipeIngredients: this.formBuilder.array([]),
        recipeDirections: this.formBuilder.array([]),
        notes: (this.formBuilder.control, null),
        tags: this.formBuilder.array([]),
        image: (this.formBuilder.control, null)
      })

    this.recipeForm.patchValue({
        'recipeName': '',
        'recipeDescription': '',
        'notes': ''
        // 'recipeDirections': '',
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

  onSubmit(){
    let recipe = new Recipe(
      null,                                                      // _id
      this.recipeForm.controls['recipeName'].value || '',        // name
      this.recipeForm.controls['recipeDescription'].value || '', // description
      this.ingredientArray,                                      // ingredients
      this.directionArray,                                       // directions
      this.recipeForm.controls['notes'].value || '',             // notes
      this.tags,                                                 // tags
      '',                                                        // user
      new Date(Date.now()),                                      // date
      ''                                                         // imgUrl
    );
    
    //Submit recipe edits
    if (this.editMode){

      //If editing, fill in the gaps from the newly created recipe
      recipe.user = this.recipe.user;
      recipe.date = this.recipe.date;
      recipe.imgUrl = this.recipe.imgUrl;

      if (this.image){
        this.spinnerText = "Uploading Image";
      } else {
        this.spinnerText = "Updating Recipe";
      }

      this.spinnerActive = true;
      
    if (this.image){
      let filepath = `recipeImages/` + Date.now() + '_' + this.image.name;
    const fileRef = this.storage.ref(filepath);
    const task = this.storage.upload(filepath, this.image);
      
    task.snapshotChanges().pipe(
      finalize(() => {
        this.downloadURL = fileRef.getDownloadURL();
        this.downloadURL.subscribe(url => {
          if (url) {
            this.uploadedImageUrl = url;
          }
          // console.log(this.uploadedImageUrl);

          this.spinnerText = "Updating Recipe";

          recipe.imgUrl = this.uploadedImageUrl;

          this.recipeService.updateRecipe(recipe, this.recipe._id).subscribe((result) => {
            setTimeout(() => {
              
          //Replace the recipe in the storage with the updated recipe so that it can update when we go back to the view-recipes page
            let recipes: Recipe[] = JSON.parse(sessionStorage.getItem('recipes'));
            let recipe = result['recipe'];
            for (let i = 0; i < recipes.length; i++){
              if (recipes[i]._id === this.recipe['_id']){
                recipes.splice(i, 1, recipe);
                sessionStorage.clear();
                sessionStorage.setItem('recipes', JSON.stringify(recipes));
                break;
              }
            }
              
              this.router.navigate(['/view-recipes']);
            }, 1500);
          });
          
        });
      })
    )
    .subscribe(url => {
      if (url) {
        // console.log(url);
      }
    });
  } else {
    this.recipeService.updateRecipe(recipe, this.recipe._id).subscribe((result) => {
      setTimeout(() => {
        
        //Replace the recipe in the storage with the updated recipe so that it can update when we go back to the view-recipes page
            let recipes: Recipe[] = JSON.parse(sessionStorage.getItem('recipes'));
            let recipe = result['recipe'];
            for (let i = 0; i < recipes.length; i++){
              if (recipes[i]._id === this.recipe['_id']){
                recipes.splice(i, 1, recipe);
                sessionStorage.clear();
                sessionStorage.setItem('recipes', JSON.stringify(recipes));
                break;
              }
            }
        
        this.router.navigate(['/view-recipes']);
      }, 1500);
    });
  }

      return;
    }

  //Submit regular new recipe
if (this.image){
    if (this.imageSelected){
      this.spinnerText = "Uploading Image";
    } else {
      this.spinnerText = "Adding Recipe";
    }

    this.spinnerActive = true;

    this.fireAuth.currentUser.then((res) => {
      //If there is no token, then the user is not logged in. Stop execution to prevent errors.
      if (!res){ return; }
      this.authService.getUserId(res.email.toString()).subscribe((result) => {
        recipe.user = result['user']._id;
      });
      
    });
  
    let filepath = `recipeImages/` + Date.now() + '_' + this.image.name;
    const fileRef = this.storage.ref(filepath);
    const task = this.storage.upload(filepath, this.image);

    task.snapshotChanges().pipe(
      finalize(() => {
        this.downloadURL = fileRef.getDownloadURL();
        this.downloadURL.subscribe(url => {
          if (url) {
            this.uploadedImageUrl = url;
          }
          // console.log(this.uploadedImageUrl);

          this.spinnerText = "Adding Recipe";

          recipe.imgUrl = this.uploadedImageUrl;
          this.recipeService.addRecipe(recipe).subscribe((result) => {
            setTimeout(() => {
              this.router.navigate(['/view-recipes']);
            }, 1500);
          });
          
        });
      })
    )
    .subscribe(url => {
      if (url) {
        // console.log(url);
      }
    });
  } else {

    this.spinnerActive = true;
    this.spinnerText = "Adding Recipe";
    this.fireAuth.currentUser.then((res) => {
      //If there is no token, then the user is not logged in. Stop execution to prevent errors.
      if (!res){ return; }
      this.authService.getUserId(res.email.toString()).subscribe((result) => {
        recipe.user = result['user']._id;
        this.recipeService.addRecipe(recipe).subscribe((result) => {
          setTimeout(() => {
            this.router.navigate(['/view-recipes']);
          }, 1500);
        });
      });
      
    });
    
  }
    
  }

openIngredientDialog(ingredient: Ingredient = null, index: number = null): void {
  setTimeout(() => {
    const dialogRef = this.dialog.open(IngredientFormComponent, {
      width: '80vw',
      height: '80vh',
      data: {ingredient: ingredient, index: index}
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result){
        if (result.index >= 0){
          this.ingredientArray[result.index].title = result.data.title;
          this.ingredientArray[result.index].ingredients = result.data.ingredients;
          return;
  
        } else {
          this.ingredientArray.push(result.data)
        }
      }
    });
  }, 200);
}

openDirectionDialog(direction: Direction = null, index: number = null): void {
  setTimeout(() => {
    const dialogRef = this.dialog.open(DirectionFormComponent, {
      width: '80vw',
      height: '80vh',
      data: {direction: direction, index: index}
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result){
        if (result.index >= 0){
          this.directionArray[result.index].title = result.data.title;
          this.directionArray[result.index].steps = result.data.steps;
          return;
  
        } else {
          this.directionArray.push(result.data)
        }
      }
    });
  }, 200);
}

deleteIngredient(index: number){
  this.ingredientArray.splice(index, 1);
}

deleteDirection(index: number){
  this.directionArray.splice(index, 1);
}

addTag(event: MatChipInputEvent) {
  const input = event.input;
  const value = event.value;

  // Add our tag
  if ((value || '').trim()) {

    //Prevention from adding same tag twice
    for (let i = 0; i < this.tags.length; i++){
      if (this.tags[i] === value){
        return;
      }
    }

    this.tags.push(value.trim());
  }

  // Reset the input value
  if (input) {
    input.value = '';
  }

}

remove(tag: string) {
  const index = this.tags.indexOf(tag);

  if (index >= 0) {
    this.tags.splice(index, 1);
  }
}

deleteRecipe(){

  let dialogRef = this.dialog.open(ConfirmComponent, {
    height: '150px',
    width: '80vw',
    data: {recipe: true}
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result){
      if (result.delete){
        this.spinnerActive = true;
        this.spinnerText = "Deleting Recipe";

        if (this.recipe.imgUrl){
          this.storage.refFromURL(this.recipe.imgUrl).delete();
        }
        
        this.recipeService.deleteRecipe(this.recipe._id).subscribe((result) => {
          this.snackbarService.openSnackbar("Recipe Deleted!", 1000);

          let recipes: Recipe[] = JSON.parse(sessionStorage.getItem('recipes'));
            let recipe = new Recipe(null, "Recipe Deleted", null, null, null, null, null, null, null, null);
            for (let i = 0; i < recipes.length; i++){
              if (recipes[i]._id === this.recipe['_id']){
                recipes.splice(i, 1, recipe);
                sessionStorage.clear();
                sessionStorage.setItem('recipes', JSON.stringify(recipes));
                break;
              }
            }
          
          this.router.navigate(['/view-recipes']);
        });
        return;
      }
    }
  });
  
}

onFileInput(e, preview){
  
  const files = this.fileInput.nativeElement.files[0];
  this.image = this.fileInput.nativeElement.files[0];

  if (files) {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(files);
    this.imageSelected = true;
    fileReader.addEventListener("load", function () {
      preview.innerHTML = '<img src="' + this.result + '" style="width: 200px; display: block;" />';
    });
  }
  e.target.value = "";
}

removeImage(preview){

  if (this.editMode && this.recipe.imgUrl !== ''){
    this.storage.storage.refFromURL(this.recipe.imgUrl).delete();
    preview.innerHTML = '<img src="" style="display: none" />';
    this.recipe.imgUrl = '';
    this.imageSelected = false;
    return;
  }

  preview.innerHTML = '<img src="" style="display: none" />';
  this.imageSelected = false;
  
}

}
