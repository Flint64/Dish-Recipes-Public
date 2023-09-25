import { ApplicationRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { Recipe } from 'src/app/models/Recipe.model';
import { AuthService } from 'src/app/services/auth.service';
import { RecipeServiceService } from 'src/app/services/recipe.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { Clipboard } from '@angular/cdk/clipboard';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { FavoriteRecipe } from 'src/app/models/FavoriteRecipe.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.scss']
})
export class RecipeListComponent implements OnInit, OnDestroy {
  recipes: Recipe[] = null;
  filterForm: FormGroup;
  titleText: string = "";
  favoriteRecipeIndex = [];
  favoriteRecipes: FavoriteRecipe[] = [];
  authChangeSubscription: Subscription;
  routeChangeSubscription: Subscription = null;
  moreRecipesLoadedSubscription: Subscription;

  spinnerText: string = "Fetching Recipes";
  noDataText: string = "";
  spinnerActive: boolean = false;
  isAuthenticated: boolean = false;

  userId: string = null;
  userEmail: string = null;
  isSearching: boolean = false;

  recipeUrlData = {
    viewingFavoriteRecipes: false,
    viewingMyRecipes: false,
    viewingAllRecipes: false
  }
  
  constructor(private router: Router, public route: ActivatedRoute, private recipeService: RecipeServiceService, private authService: AuthService, private fireAuth: AngularFireAuth, private snackbarService: SnackbarService, private clipboard: Clipboard, private ref: ApplicationRef) { }

  ngOnInit(): void {

    this.recipeService.scrollToTopEvent.next(true);

    this.spinnerActive = true;

    // If logged remove the favorite recipe index to remove the hearts 
    this.authChangeSubscription = this.authService.authChangeEvent.subscribe((result) => {
      if (!result){
        this.isAuthenticated = result;

        // When viewing default recipes & you log out
        if (!this.recipes){
          if (this.route.snapshot.url[0].path === 'view-recipes'){
            this.recipeUrlData.viewingAllRecipes = true;
            setTimeout(() => {
              this.recipeService.recipeUrlEvent.next(this.recipeUrlData);
            }, 500);
            this.recipeService.getRecipes().subscribe((result) => {
              this.recipes = result['recipes'];
            });
        }
      }
      this.titleText = "All Recipes";
      this.favoriteRecipeIndex = [];
      this.favoriteRecipes = [];
      this.userId = null;
      this.userEmail = null;
      
      }
    });

    //Initalize the search form
    this.filterForm = new FormGroup({
      'recipeSearch': new FormControl(''),
    });
    

    setTimeout(() => {
      this.recipeService.resetMoreLoadedEvent.next(false);
    }, 500);
    
    if (this.routeChangeSubscription === null){
      this.routeChangeSubscription = this.router.events.subscribe((event) => {
       
        if (event instanceof NavigationStart) {
          //Send this to the app.component.ts to reset the offset and page we're on on page unload
            this.recipeService.onViewRecipesPageEvent.next(false);
            this.recipeService.resetOffsetEvent.next(true); 
  
            this.recipeUrlData.viewingFavoriteRecipes = false;
            this.recipeUrlData.viewingMyRecipes = false;
            this.recipeUrlData.viewingAllRecipes = false;
            
            this.recipeService.recipeUrlEvent.next(this.recipeUrlData);
        }
      });
    }

    this.recipeService.onViewRecipesPageEvent.next(true);

    this.moreRecipesLoadedSubscription = this.recipeService.moreRecipesLoadedEvent.subscribe((result) => {
      
      this.recipeService.resetMoreLoadedEvent.next(false);
      
      if (this.recipeUrlData.viewingFavoriteRecipes){

        if (this.isSearching){
          for (let i = 0; i < result.length; i++){
            this.recipes.push(result[i]);
          }  
        } else {
          for (let i = 0; i < result.length; i++){
            this.recipes.push(result[i].recipe);
          }
        }
        

      } else {

      if (result){
        for (let i = 0; i < result.length; i++){
          this.recipes.push(result[i]);
        }
      }
    }

      this.checkFavorite();
    });          

    setTimeout(() => {
      this.fireAuth.currentUser.then((res) => {
            // When viewing recipes & aren't logged in
            if (!res){
              ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

              //If we have a list of recipes in session storage, retrieve the title and set
              //the recipe list to the stored data
              if (sessionStorage.getItem('recipes')){
                this.recipes = JSON.parse(sessionStorage.getItem('recipes'));
                this.titleText = sessionStorage.getItem('title');
                if (sessionStorage.getItem('searchTerm')){
                  this.filterForm.controls.recipeSearch.setValue(sessionStorage.getItem('searchTerm'));
                  this.isSearching = true;
                }

                if (this.titleText === 'All Recipes'){
                  this.recipeUrlData.viewingAllRecipes = true;
                  this.recipeService.recipeUrlEvent.next(this.recipeUrlData);
                }

                if (this.titleText === 'My Favorites'){
                  this.recipeUrlData.viewingFavoriteRecipes = true;
                  this.recipeService.recipeUrlEvent.next(this.recipeUrlData);
                }

                if (this.titleText === 'My Recipes'){
                  this.recipeUrlData.viewingMyRecipes = true;
                  this.recipeService.recipeUrlEvent.next(this.recipeUrlData);
                }

                this.recipeService.scrollToTopEvent.next("scrollTo");
                this.spinnerActive = false;
                  
                  //If we're on an odd number, say 22 then calculate the correct offset by taking 22 % 10,
                  //subtract the remainder (2) and add 10, so the next offset of recipes to load would be /30.
                  //Clear the storage
                  if (this.recipes.length % 10 !== 0){
                    sessionStorage.setItem('offset', ((this.recipes.length - (this.recipes.length % 10) + 10)).toString());
                    this.recipeService.resetOffsetEvent.next(false);
                    sessionStorage.clear();
                    return;
                  }

                  //Otherwise if we're on an even number (10/20/30 etc), set the offset to the
                  //size of the recipe list so that the next loaded set will retrieve correctly
                  //Clear the storage
                  sessionStorage.setItem('offset', (this.recipes.length).toString());
                  this.recipeService.resetOffsetEvent.next(false);
                  sessionStorage.clear();
                  return;
              }

              ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
              
                this.titleText = "All Recipes";
                if (this.route.snapshot.url[0].path === 'view-recipes'){
                  this.recipeUrlData.viewingAllRecipes = true;
                  this.recipeService.recipeUrlEvent.next(this.recipeUrlData);

                  this.recipeService.getRecipes().subscribe((result) => {
                  this.recipes = result['recipes'];
                  this.spinnerActive = false;
                  });
              }
              return; 

            //If there is a response, which means we're logged in,
            } else { 
              this.userEmail = res.email;
              this.authService.getUserId(res.email).subscribe((result) => {
                this.userId = result['user']._id

                this.recipeService.getFavoriteRecipes(this.userId).subscribe((result) => {
                  this.favoriteRecipes = result['recipes'];


              ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

              //If we have a list of recipes in session storage, retrieve the title and set
              //the recipe list to the stored data
              if (sessionStorage.getItem('recipes')){
                this.recipes = JSON.parse(sessionStorage.getItem('recipes'));
                this.titleText = sessionStorage.getItem('title');
                if (sessionStorage.getItem('searchTerm')){
                  this.filterForm.controls.recipeSearch.setValue(sessionStorage.getItem('searchTerm'));
                  this.isSearching = true;
                }

                if (this.titleText === 'All Recipes'){
                  this.recipeUrlData.viewingAllRecipes = true;
                  this.recipeService.recipeUrlEvent.next(this.recipeUrlData);
                }

                if (this.titleText === 'My Favorites'){
                  this.recipeUrlData.viewingFavoriteRecipes = true;
                  this.recipeService.recipeUrlEvent.next(this.recipeUrlData);
                }

                if (this.titleText === 'My Recipes'){
                  this.recipeUrlData.viewingMyRecipes = true;
                  this.recipeService.recipeUrlEvent.next(this.recipeUrlData);
                }

                  this.checkFavorite();

                this.recipeService.scrollToTopEvent.next("scrollTo");
                this.spinnerActive = false;
                  
                  //If we're on an odd number, say 22 then calculate the correct offset by taking 22 % 10,
                  //subtract the remainder (2) and add 10, so the next offset of recipes to load would be /30.
                  //Clear the storage
                  if (this.recipes.length % 10 !== 0){
                    sessionStorage.setItem('offset', ((this.recipes.length - (this.recipes.length % 10) + 10)).toString());
                    this.recipeService.resetOffsetEvent.next(false);
                    sessionStorage.clear();
                    return;
                  }

                  //Otherwise if we're on an even number (10/20/30 etc), set the offset to the
                  //size of the recipe list so that the next loaded set will retrieve correctly
                  //Clear the storage
                  sessionStorage.setItem('offset', (this.recipes.length).toString());
                  this.recipeService.resetOffsetEvent.next(false);
                  sessionStorage.clear();
                  return;
              }
                
              ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
      
                // When viewing default recipes & are logged in
                  if (this.route.snapshot.url[0].path === 'view-recipes'){

                    this.recipeUrlData.viewingAllRecipes = true;
                    this.recipeService.recipeUrlEvent.next(this.recipeUrlData);

                    
                    this.recipeService.getRecipes().subscribe((result) => {
                      if (result['message']){
                        this.noDataText = result['message'];
                        this.recipes = null;
                        this.spinnerActive = false;
                        return;
                      }

                      this.recipes = [];
                      this.recipes = result['recipes'];
                      this.titleText = "All Recipes";
                      this.checkFavorite();
                      this.spinnerActive = false;
                    });
                  }
              
              ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
              
                  // When viewing favorite recipes
                  if (this.route.snapshot.url[0].path === 'favorites'){
                    this.titleText = "My Favorites";
                    this.recipeUrlData.viewingFavoriteRecipes = true;
                    this.recipeService.recipeUrlEvent.next(this.recipeUrlData);

                    this.recipeService.populateGetFavoriteRecipes(this.userId).subscribe((result) => {
                      this.recipes = [];

                      if (result['message']){
                        this.noDataText = result['message'];
                        this.recipes = null;
                        this.spinnerActive = false;
                        return;
                      }
                      
                      for (let i = 0; i < result['recipes'].length; i++){
                        this.recipes.push(result['recipes'][i].recipe);
                      }
                      this.spinnerActive = false;
                      this.checkFavorite();
                    });
                  }
                  
              ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
            
                // When viewing your submitted recipes
                if (this.route.snapshot.url[0].path === 'my'){
                  this.titleText = "My Recipes";
                  this.recipeUrlData.viewingMyRecipes = true;
                  this.recipeService.recipeUrlEvent.next(this.recipeUrlData);

                  
                  this.recipeService.getMyRecipes(this.userEmail).subscribe((result) => {
                    if (result['message']){
                      this.noDataText = result['message'];
                      this.recipes = null;
                      this.spinnerActive = false;
                      return;
                    }
                    
                    this.recipes = result['recipes'];
                    this.checkFavorite();
                    this.spinnerActive = false;
                  });
                }
              
              ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
              });
            });
              
            }
      });
  }, 500);
  

  
  }
  
  searchRecipes(){
    this.spinnerActive = true;
    this.isSearching = true;
    this.noDataText = "No Recipes Found";
    this.recipeService.toggleIsSearchingRecipesEvent.next(true);
    this.recipeService.resetOffsetEvent.next(true);
    this.recipeService.resetMoreLoadedEvent.next(false);
    this.recipeService.searchTermEvent.next(this.filterForm.controls.recipeSearch.value);

    if (this.route.snapshot.url[0].path === 'view-recipes'){
      if (!this.filterForm.controls.recipeSearch.value){
        this.recipeService.getRecipes().subscribe((result) => {
          this.recipes = result['recipes'];
          this.spinnerActive = false;
        });
        return;
      }
      
      this.recipeService.searchAllRecipes(this.filterForm.controls.recipeSearch.value).subscribe((result) => {
        this.recipes = result['recipes'];
        this.spinnerActive = false;
      });
    }

    if (this.route.snapshot.url[0].path === 'favorites'){
      if (!this.filterForm.controls.recipeSearch.value){
        this.recipeService.getFavoriteRecipes(this.userId).subscribe((result) => {
          this.recipes = result['recipes'];
          this.spinnerActive = false;
        });
        return;
      }
      
      this.recipeService.searchFavoriteRecipes(this.userId, this.filterForm.controls.recipeSearch.value).subscribe((result) => {
        this.recipes = result['recipes'];
        this.spinnerActive = false;
      });
    }

    if (this.route.snapshot.url[0].path === 'my'){
      if (!this.filterForm.controls.recipeSearch.value){
        this.recipeService.getMyRecipes(this.userEmail).subscribe((result) => {
          this.recipes = result['recipes'];
          this.spinnerActive = false;
        });
        return;
      }
      
      this.recipeService.searchMyRecipes(this.userEmail, this.filterForm.controls.recipeSearch.value).subscribe((result) => {
        this.recipes = result['recipes'];
        this.spinnerActive = false;
      });
    }

  }

  resetSearch(){
    this.isSearching = false;
    this.noDataText = "";
    this.filterForm.controls.recipeSearch.setValue('');
    this.recipeService.toggleIsSearchingRecipesEvent.next(false);
    this.recipeService.resetOffsetEvent.next(true);
    this.recipeService.searchTermEvent.next("");
    this.recipes = [];
    this.spinnerActive = true;

    if (this.route.snapshot.url[0].path === 'view-recipes'){
      if (!this.filterForm.controls.recipeSearch.value){
        this.recipeService.getRecipes().subscribe((result) => {
          this.recipes = result['recipes'];
          this.spinnerActive = false;
          this.recipeService.resetMoreLoadedEvent.next(false);
        });
        return;
      }
      
      this.recipeService.getRecipes().subscribe((result) => {
        this.recipes = result['recipes'];
        this.spinnerActive = false;
      });
    }

    if (this.route.snapshot.url[0].path === 'favorites'){
      if (!this.filterForm.controls.recipeSearch.value){
        this.recipeService.populateGetFavoriteRecipes(this.userId).subscribe((result) => {
          this.recipes = [];
          for (let i = 0; i < result['recipes'].length; i++){
            this.recipes.push(result['recipes'][i].recipe);
          }
          this.spinnerActive = false;
          this.recipeService.resetMoreLoadedEvent.next(false);
        });
        return;
      }
      
      this.recipeService.populateGetFavoriteRecipes(this.userId).subscribe((result) => {
        this.recipes = [];
        for (let i = 0; i < result['recipes'].length; i++){
          this.recipes.push(result['recipes'][i].recipe);
        }
        this.spinnerActive = false;
      });
    }

    if (this.route.snapshot.url[0].path === 'my'){
      if (!this.filterForm.controls.recipeSearch.value){
        this.recipeService.getMyRecipes(this.userEmail).subscribe((result) => {
          this.recipes = result['recipes'];
          this.spinnerActive = false;
          this.recipeService.resetMoreLoadedEvent.next(false);
        });
        return;
      }
      
      this.recipeService.getMyRecipes(this.userEmail).subscribe((result) => {
        this.recipes = result['recipes'];
        this.spinnerActive = false;
      });
    }
    
  }

  //Clear subscription(s)
  ngOnDestroy(): void {
    this.authChangeSubscription.unsubscribe();
    if (this.routeChangeSubscription !== null){this.routeChangeSubscription.unsubscribe();}
    this.moreRecipesLoadedSubscription.unsubscribe();
  }

  // Gets current logged in user email, grabs your user id from said email,
  //then grabs your favorite recipes from your user id. Then calls checkFavorite
  //which populates an array of favorites to display them correctly on screen
  getFavoriteRecipes(){
    if (!this.userId){return;}
      this.recipeService.getFavoriteRecipes(this.userId).subscribe((result) => {
        this.favoriteRecipes = result['recipes'];
        this.checkFavorite();
      });
  }
  
  // Pops up a snackbar and copies the recipe url to the clipboard
  shareRecipe(id: string) {
    this.clipboard.copy('dish-recipes.app/view-recipes/' + id);
    this.snackbarService.openSnackbar("Recipe link copied!", 1000);
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

      const favoriteRecipe = new FavoriteRecipe(recipeId, this.userId)
      this.recipeService.favoriteRecipe(favoriteRecipe).subscribe((result) => {
        this.snackbarService.openSnackbar("Favorite Added!", 1500);        
        this.getFavoriteRecipes();
      });

    });
  }

  // Deletes a favorite recipe. 
  deleteFavorite(recipeId: string){
      
    // If we're removing a favorite recipe when viewing favorite recipes,
    // refresh the list so it gets removed from the view
    if (this.route.snapshot.url[0].path === 'favorites'){
          this.recipeService.removeFavorite(recipeId).subscribe((result) => {
          for (let i = 0; i < this.recipes.length; i++){
            if (this.recipes[i]._id === recipeId){
              this.recipes.splice(i, 1);
              this.favoriteRecipes.splice(i, 1);
              this.snackbarService.openSnackbar("Favorite Removed!", 1500);
              return;
            }
          }
    });
      return;
    }
      
      this.recipeService.removeFavorite(recipeId).subscribe((result) => {
        for (let i = 0; i < this.recipes.length; i++){
          if (this.recipes[i]._id === recipeId){
            this.snackbarService.openSnackbar("Favorite Removed!", 1500);
            this.getFavoriteRecipes();
            return;
          }
        }
      });
  }

  // Check favorites. Loops through all of the retrieved recieps,
  // setting favoriteRecipeIndex[i] to false so that they arrays are 
  // the same size and have matching data. In the second loop, if the 
  // recipe id matches a retrieved favorite recipe id, set the corresponding
  // favoriterecipeindex to true to correctly display the green heart.
  // Tick the application ref to force an update of the view
  checkFavorite(){

    if (!this.favoriteRecipes){
      
      this.favoriteRecipeIndex = [];
      return;
    }
    
    for (let i = 0; i < this.recipes.length; i++){
      this.favoriteRecipeIndex[i] = false;
      for (let j = 0; j < this.favoriteRecipes.length; j++){
        if (this.recipes[i]._id === this.favoriteRecipes[j].recipe){
          this.favoriteRecipeIndex[i] = true;
        }
      }
    }
    
    this.ref.tick();
  }

  scrollToTop(){
    this.recipeService.scrollToTopEvent.next(true);
  }

  // Navigates with a 200ms delay so that you can still
  // see the button ripple effect
  navigate(path){
    //If we're navigating to a view-recipe page, store the page title, list of recipes,
    //and request the scroll position from the app.component to keep you on the same 
    //page offset when you return to the recipe list
    if (path.split('/')[0] === 'view-recipes'){
      sessionStorage.setItem('recipes', JSON.stringify(this.recipes));
      sessionStorage.setItem('title', this.titleText);
      sessionStorage.setItem('scrollPos', '');
      if (this.isSearching){
        sessionStorage.setItem('searchTerm', this.filterForm.controls.recipeSearch.value);
      }
      this.recipeService.scrollToTopEvent.next(false);
    }
    setTimeout(() => {
      this.router.navigate([path]);
    }, 200);
  }

}
