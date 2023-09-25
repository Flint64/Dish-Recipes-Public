import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';
import { RecipeServiceService } from './services/recipe.service';
import { SidenavService } from './services/sidenav.service';
import { TipService } from './services/tip.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, OnDestroy {

  title = 'recipeBook2022';
  isOpen: boolean = false;
  isOpenSubscription: Subscription;

  body = document.body;
  html = document.documentElement;
  height = Math.max( this.body.scrollHeight, this.body.offsetHeight, this.html.clientHeight, this.html.scrollHeight, this.html.offsetHeight );

  recipeListLoadedSubscription: Subscription;
  resetOffsetSubscription: Subscription;
  resetMoreLoadedSubscription: Subscription;
  recipeUrlSubscription: Subscription;
  toggleIsSearchingRecipesSubscription: Subscription;
  searchTermSubscription: Subscription;
  scrollToTopSubscription: Subscription;

  TipListLoadedSubscription: Subscription;
  tipUrlSubscription: Subscription;
  
  isAuthenticated: boolean = false;
  activateScrollListener: boolean = false;
  moreLoaded: boolean = false;
  offset: number = 10;
  isSearching: boolean = false;
  searchTerm: string = "";

  viewingFavoriteRecipes: boolean = false;
  viewingMyRecipes: boolean = false;
  viewingAllRecipes: boolean = false;

  viewingFavoriteTips: boolean = false;
  viewingMyTips: boolean = false;
  viewingAllTips: boolean = false;

  userEmail: string = "";
  userId: string = "";

  constructor(private sidenavService: SidenavService, private router: Router, private route: ActivatedRoute, private recipeService: RecipeServiceService, private authService: AuthService, private fireAuth: AngularFireAuth, private tipService: TipService) {}

  // Scroll event for the whole app, only fires on recipe-list & quick tips page (quick tips pending)
  scrollEvent(e){

    // If activeScrollListener is true, we are on the recipe-list or quick-tips page
    if (this.activateScrollListener){
      const tableViewHeight = e.target.offsetHeight // viewport size
      const tableScrollHeight = e.target.scrollHeight // length of all table
      const scrollLocation = e.target.scrollTop; // how far user scrolled
      
      // If the user has scrolled within 200px of the bottom, add more data
      const buffer = 400;
      const limit = tableScrollHeight - tableViewHeight - buffer;

      //Only load more data if we're past the buffer and moreLoaded is false - to prevent
      //the event from firing on every scroll tick, moreLoaded immediately gets set to true on 
      //the first tick

      //The result['message'] has to match whatever is sent back in the case that there
      //is no data found, or else moreLoaded stays false and we make a new call on
      //every scroll tick
        if ((scrollLocation >= limit) && !this.moreLoaded) {
          this.moreLoaded = true;

          //If we're searching through tips/recipes
          if (this.isSearching){

            if (this.viewingAllRecipes){
              this.recipeService.searchAllRecipes(this.searchTerm, this.offset).subscribe((result) => {
                if (result['message'] === "Recipes not found"){
                  this.moreLoaded = true;
                  return;
                }
                this.recipeService.moreRecipesLoadedEvent.next(result['recipes']);
              });
            }
            
            if (this.viewingFavoriteRecipes){
              this.recipeService.searchFavoriteRecipes(this.userId, this.searchTerm, this.offset).subscribe((result) => {
                if (result['message'] === "Recipes not found"){
                  this.moreLoaded = true;
                  return;
                }
                this.recipeService.moreRecipesLoadedEvent.next(result['recipes']);
              });
            }
            
            if (this.viewingMyRecipes){
              this.recipeService.searchMyRecipes(this.userEmail, this.searchTerm, this.offset).subscribe((result) => {
                if (result['message'] === "Recipes not found"){
                  this.moreLoaded = true;
                  return;
                }
                this.recipeService.moreRecipesLoadedEvent.next(result['recipes']);
              });
            }

          //////////// TIPS ////////////
            
            if (this.viewingAllTips){
              this.tipService.searchAllTips(this.searchTerm, this.offset).subscribe((result) => {
                if (result['message'] === "Tips not found"){
                  this.moreLoaded = true;
                  return;
                }
                this.tipService.moreTipsLoadedEvent.next(result['tips']);
              });
            }

            if (this.viewingFavoriteTips){
              this.tipService.searchFavoriteTips(this.userId, this.searchTerm, this.offset).subscribe((result) => {
                if (result['message'] === "Tips not found"){
                  this.moreLoaded = true;
                  return;
                }
                this.tipService.moreTipsLoadedEvent.next(result['tips']);
              });
            }

            if (this.viewingMyTips){
              this.tipService.searchMyTips(this.userEmail, this.searchTerm, this.offset).subscribe((result) => {
                if (result['message'] === "Tips not found"){
                  this.moreLoaded = true;
                  return;
                }
                this.tipService.moreTipsLoadedEvent.next(result['tips']);
              });
            }

            
          // Increase the offset no matter what page we're on
          this.offset += 10;
            return;
          }

          // If we're not searching through tips/recipes
          // Fetch the recipes, and send the data back to the recipe-list page to be added to the array
          // Increase the offset by 10 so that the next set of data can be loaded when we once again go 
          // past the limit
          if (this.viewingAllRecipes){
            this.recipeService.getRecipes(this.offset).subscribe((result) => {
              if (result['message'] === "No recipes found"){
                this.moreLoaded = true;
                return;
              }
              this.recipeService.moreRecipesLoadedEvent.next(result['recipes']);
            });
          }

          if (this.viewingFavoriteRecipes){
            this.recipeService.populateGetFavoriteRecipes(this.userId, this.offset).subscribe((result) => {
              if (result['message'] === "No favorite recipes found"){
                this.moreLoaded = true;
                return;
              }
              this.recipeService.moreRecipesLoadedEvent.next(result['recipes']);
            });
          }

          if (this.viewingMyRecipes){
            this.recipeService.getMyRecipes(this.userEmail, this.offset).subscribe((result) => {
              if (result['message'] === "Recipes not found"){
                this.moreLoaded = true;
                return;
              }
              this.recipeService.moreRecipesLoadedEvent.next(result['recipes']);
            });
          }

          //////////// TIPS ////////////
          
          if (this.viewingAllTips){
            this.tipService.getTips(this.offset).subscribe((result) => {
              if (result['message'] === "No tips found"){
                this.moreLoaded = true;
                return;
              }
              this.tipService.moreTipsLoadedEvent.next(result['tips']);
            });
          }

          if (this.viewingFavoriteTips){
            this.tipService.populateGetFavoriteTips(this.userId, this.offset).subscribe((result) => {
              if (result['message'] === "No favorite tips found"){
                this.moreLoaded = true;
                return;
              }
              this.tipService.moreTipsLoadedEvent.next(result['tips']);
            });
          }

          if (this.viewingMyTips){
            this.tipService.getMyTips(this.userEmail, this.offset).subscribe((result) => {
              if (result['message'] === "Tips not found"){
                this.moreLoaded = true;
                return;
              }
              this.tipService.moreTipsLoadedEvent.next(result['tips']);
            });
          }

          // Increase the offset no matter what page we're on
          this.offset += 10;
          
        }
    }
  }
    
  ngOnInit(): void {

    // This data gets sent here from the recipe-list page based on the url
    // so that we can correctly paginate the right data instead of showing 
    // more favorites when you're viewing your uploaded recipes for example
    this.recipeUrlSubscription = this.recipeService.recipeUrlEvent.subscribe((result) => {
      this.viewingAllRecipes = result.viewingAllRecipes;
      this.viewingFavoriteRecipes = result.viewingFavoriteRecipes;
      this.viewingMyRecipes = result.viewingMyRecipes;

      // When we get the page data also get the logged in user id and email for use in the recipe/tip fetch functions
      setTimeout(() => {
        this.fireAuth.currentUser.then((res) => {
        if (!res){ return; }
        this.userEmail = res.email;
        this.authService.getUserId(res.email).subscribe((result) => {
        this.userId = result['user']._id;
        });
      });
    }, 1000);
    });

    this.tipUrlSubscription = this.tipService.tipUrlEvent.subscribe((result) => {
      this.viewingAllTips = result.viewingAllTips;
      this.viewingFavoriteTips = result.viewingFavoriteTips;
      this.viewingMyTips = result.viewingMyTips;


      // When we get the page data also get the logged in user id and email for use in the recipe/tip fetch functions
      setTimeout(() => {
        this.fireAuth.currentUser.then((res) => {
        if (!res){ return; }
        this.userEmail = res.email;
        this.authService.getUserId(res.email).subscribe((result) => {
        this.userId = result['user']._id;
        });
      });
    }, 1000);
    });

    // Since this is the app.component and not the recipe-list or tip-list page, we have to handle everything here.
    // When the recipe-list or quick-tips page gets loaded intially we set the scroll listener to active. 
    // Whenever the page gets unloaded, we set this back to false via a route subscription to ensure
    // the scroll event doesn't get fired on pages it shouldn't
    this.recipeListLoadedSubscription = this.recipeService.onViewRecipesPageEvent.subscribe((result) => {
      if (result){
        this.activateScrollListener = true;
      } else {
        this.activateScrollListener = false;
      }
    });

    this.TipListLoadedSubscription = this.tipService.onViewTipsPageEvent.subscribe((result) => {
      if (result){
        this.activateScrollListener = true;
      } else {
        this.activateScrollListener = false;
      }
    });

    // Similar to the above, we have to reset the offset whenever the we navigate away from a page
    // that we're listening to scrolling on, or else when the user returns to the recipe list the
    // first new group after the first 10 data points could be who knows how far along due to 
    // the offset not being reset, so that is handled here.

    //If false is passed here then we set the offset to whatever the offset is in the storage to
    //grab the correct next set of data if we're returning to the page that already has data
    this.resetOffsetSubscription = this.recipeService.resetOffsetEvent.subscribe((result) => {
      if (result){
        this.offset = 10;
      } 

      if (!result){
        if (sessionStorage.getItem('offset')){
          this.offset = parseInt(sessionStorage.getItem('offset'));
        }
      }
    });

    // Because moreLoaded is set to true on the first tick, once the data reaches its
    // destination and is added to the tips or recipe array, reset moreLoaded so that we can load
    // more once the limit is broken again.
    this.resetMoreLoadedSubscription = this.recipeService.resetMoreLoadedEvent.subscribe((result) => {
      this.moreLoaded = result;
    });

    // This lets us know if we're searching recipes or not so that we can set
    // the pagination to grab the next set of filtered recipes instead of
    // the default grab
    this.toggleIsSearchingRecipesSubscription = this.recipeService.toggleIsSearchingRecipesEvent.subscribe((result) => {
      this.isSearching = result;
    });

    // Get the current search term so that we can grab the next set of recipes/tips with the right data
    this.searchTermSubscription = this.recipeService.searchTermEvent.subscribe((result) => {
      this.searchTerm = result;
    });
    
    this.isOpenSubscription = this.sidenavService.sidenavEvent.subscribe((result) => {
      this.isOpen = result;
    });

    this.scrollToTopSubscription = this.recipeService.scrollToTopEvent.subscribe((result) => {
      if (result === true){
        document.querySelector('.mat-drawer-content').scrollTop = 0;
        return;
      } else if (result === false){
          sessionStorage.setItem('scrollPos', document.querySelector('.mat-drawer-content').scrollTop.toString());
          return;
      }

      if (result === "scrollTo"){
        let scrollTo = sessionStorage.getItem('scrollPos');
        let num = parseInt(scrollTo);
        setTimeout(() => {
          document.querySelector('.mat-drawer-content').scrollTop = num;
        }, 200);
      }
    });

    
  }

  // Navigate here wit the path from the button to allow the
  //sidebar to auto close after navigation.
  //SetTimeout is here so the ripple effect is visible
  navigate(path){
    setTimeout(() => {
      this.router.navigate([path]);
      this.sidenavService.toggleSidenav();
    }, 200);
  }
  
  ngOnDestroy(): void {
    this.isOpenSubscription.unsubscribe();
    this.recipeListLoadedSubscription.unsubscribe();
    this.resetOffsetSubscription.unsubscribe();
    this.resetMoreLoadedSubscription.unsubscribe();
    this.recipeUrlSubscription.unsubscribe();
    this.TipListLoadedSubscription.unsubscribe();
    this.tipUrlSubscription.unsubscribe();
    this.toggleIsSearchingRecipesSubscription.unsubscribe();
    this.searchTermSubscription.unsubscribe();
    this.scrollToTopSubscription.unsubscribe();
  }

  
}