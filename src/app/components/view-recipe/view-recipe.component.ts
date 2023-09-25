import { Component, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Recipe } from 'src/app/models/Recipe.model';
import { RecipeServiceService } from 'src/app/services/recipe.service';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { ConfirmComponent } from '../confirm/confirm.component';
import { MatDialog } from '@angular/material/dialog';
import { Clipboard } from '@angular/cdk/clipboard';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { FavoriteRecipe } from 'src/app/models/FavoriteRecipe.model';
import { AngularFireStorage } from '@angular/fire/storage';

@Component({
  selector: 'app-view-recipe',
  templateUrl: './view-recipe.component.html',
  styleUrls: ['./view-recipe.component.scss']
})
export class ViewRecipeComponent implements OnInit {
  
  recipe: Recipe = null;
  isChecked: boolean = false;
  isFavorite: boolean = false;

  spinnerText: string = "Fetching Recipe";
  spinnerActive: boolean = false;
  allowEdit: boolean = false;
  noRecipeFound = false;

  constructor(private router: Router, private route: ActivatedRoute, private recipeService: RecipeServiceService, private _location: Location, private authService: AuthService, private fireAuth: AngularFireAuth, private dialog: MatDialog, private snackbarService: SnackbarService, private clipboard: Clipboard, private storage: AngularFireStorage) { }

  ngOnInit(): void {

    this.spinnerActive = true;

    if (this.route.snapshot.url[1].path === 'null'){
      this.spinnerActive = false;
      this.noRecipeFound = true;
    }

    // Get single recipe based on the id from the url
    this.recipeService.getSingleRecipe(this.route.snapshot.url[1].path).subscribe((result) => {
      this.recipe = result['recipe'];
      if (result['favorite']){
        this.isFavorite = true;
      }

      //Timeout here to make sure that fireAuth returns the current user on page refresh
      setTimeout(() => {
        this.fireAuth.currentUser.then((res) => {
          //If there is no token, then the user is not logged in. Stop execution to prevent errors.
          if (!res){ this.spinnerActive = false; return; }
          this.authService.getUserId(res.email).subscribe((result) => {
            if (this.recipe.user['_id'] === result['user']._id){
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

  editRecipe(){
    this.router.navigate(['/edit-recipe/' + this.recipe._id]);
  }
  
  deleteRecipe(){

    let dialogRef = this.dialog.open(ConfirmComponent, {
      height: '150px',
      width: '80vw',
      data: {recipe: true}
    });

    if (this.recipe.imgUrl){
      this.storage.refFromURL(this.recipe.imgUrl).delete();
    }
  
    dialogRef.afterClosed().subscribe(result => {
      if (result){
        if (result.delete){
          this.spinnerActive = true;
          this.spinnerText = "Deleting Recipe";
          this.recipeService.deleteRecipe(this.recipe['_id']).subscribe((result) => {
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

            
            this._location.back();
          });
          return;
        }
      }
    });
    
  }

  shareRecipe(id: string) {
    this.clipboard.copy('dish-recipes.app/view-recipes/' + id);
    this.snackbarService.openSnackbar("Recipe link copied!", 1000);
  }
  
  navigate(path){
    setTimeout(() => {
      //Go back to the previous page and not to home
      this._location.back();
    }, 200);
  }

  // Favorites a recipe. gets current logged in users email, gets your
  // user id from the email, then adds a favorite recipe
  favoriteRecipe(recipeId: string){
    this.fireAuth.currentUser.then((res) => {
      //If there is no token, then the user is not logged in. Stop execution to prevent errors.
      if (!res){
        this.router.navigate(['log-in'])
        return;
      }

      this.authService.getUserId(res.email).subscribe((result) => {
        const favoriteRecipe = new FavoriteRecipe(recipeId, result['user']._id)
        this.recipeService.favoriteRecipe(favoriteRecipe).subscribe((result) => {
          this.isFavorite = true;
          this.snackbarService.openSnackbar("Favorite Added!", 1500);
        });
      });


    });
  }

  // Deletes a favorite recipe. 
  deleteFavorite(recipeId: string){
    this.recipeService.removeFavorite(recipeId).subscribe((result) => {
      this.isFavorite = false;
      this.snackbarService.openSnackbar("Favorite Removed!", 1000);
    });
  }

}
