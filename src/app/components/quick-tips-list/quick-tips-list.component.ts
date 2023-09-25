import { ApplicationRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { Tip } from 'src/app/models/Tip.model';
import { TipService } from 'src/app/services/tip.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { Subscription } from 'rxjs';
import { FavoriteTip } from 'src/app/models/FavoriteTip.model';
import { AuthService } from 'src/app/services/auth.service';
import { RecipeServiceService } from 'src/app/services/recipe.service';

@Component({
  selector: 'app-quick-tips-list',
  templateUrl: './quick-tips-list.component.html',
  styleUrls: ['./quick-tips-list.component.scss']
})
export class QuickTipsListComponent implements OnInit, OnDestroy {
  tips: Tip[] = [];
  filterForm: FormGroup;
  titleText: string = "";
  favoriteTipIndex = [];
  favoriteTips: FavoriteTip[] = [];
  authChangeSubscription: Subscription;
  routeChangeSubscription: Subscription = null;
  moreTipsLoadedSubscription: Subscription;
  isSearching: boolean = false;

  spinnerText = "Fetching Tips";
  noDataText: string = "";
  spinnerActive: boolean = false;
  isAuthenticated: boolean = false;

  userId: string = null;
  userEmail: string = null;

  tipUrlData = {
    viewingFavoriteTips: false,
    viewingMyTips: false,
    viewingAllTips: false
  }
  
  constructor(private tipService: TipService, private recipeService: RecipeServiceService, private router: Router, private route: ActivatedRoute, private fireAuth: AngularFireAuth, private snackbarService: SnackbarService, private clipboard: Clipboard, private authService: AuthService, private ref: ApplicationRef) { }

  ngOnInit(): void {

    this.recipeService.scrollToTopEvent.next(true);

    this.spinnerActive = true;

          // If logged remove the favorite tip index to remove the hearts 
          this.authChangeSubscription = this.authService.authChangeEvent.subscribe((result) => {
            if (!result){
              this.isAuthenticated = result;
      
              // When viewing default tips & you log out
              if (!this.tips){
                if (this.route.snapshot.url[0].path === 'quick-tips'){
                  this.tipUrlData.viewingAllTips = true;
                  setTimeout(() => {
                    this.tipService.tipUrlEvent.next(this.tipUrlData);
                  }, 500);
                  this.tipService.getTips().subscribe((result) => {
                    this.tips = result['tips'];
                  });
              }
            }
            this.titleText = "All Tips";
            this.favoriteTipIndex = [];
            this.favoriteTips = [];
            this.userId = null;
            this.userEmail = null;
            }
          });
    
        //Initalize the search form
        this.filterForm = new FormGroup({
          'tipSearch': new FormControl(''),
        });

    setTimeout(() => {
      this.recipeService.resetMoreLoadedEvent.next(false);
    }, 500);

    if (this.routeChangeSubscription === null){
      this.routeChangeSubscription = this.router.events.subscribe((event) => {
       
        if (event instanceof NavigationStart) {
          //Send this to the app.component.ts to reset the offset and page we're on on page unload
            this.tipService.onViewTipsPageEvent.next(false);
            this.recipeService.resetOffsetEvent.next(true); 
  
            this.tipUrlData.viewingFavoriteTips = false;
            this.tipUrlData.viewingMyTips = false;
            this.tipUrlData.viewingAllTips = false;
            
            this.tipService.tipUrlEvent.next(this.tipUrlData);
        }
      });
    }

    this.tipService.onViewTipsPageEvent.next(true);

    this.moreTipsLoadedSubscription = this.tipService.moreTipsLoadedEvent.subscribe((result) => {
      
      this.recipeService.resetMoreLoadedEvent.next(false);
      
      if (this.tipUrlData.viewingFavoriteTips){

        if (this.isSearching){
          for (let i = 0; i < result.length; i++){
            this.tips.push(result[i]);
          }  
        } else {
          for (let i = 0; i < result.length; i++){
            this.tips.push(result[i].tip);
          }
        }

      } else {

        for (let i = 0; i < result.length; i++){
          this.tips.push(result[i]);
        }
      }

      this.checkFavorite();
    });

    setTimeout(() => {
      this.fireAuth.currentUser.then((res) => {
            // When viewing tips & aren't logged in
            if (!res){

            ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
            //If we have a list of tips in session storage, retrieve the title and set
            //the tip list to the stored data
            if (sessionStorage.getItem('tips')){
              this.tips = JSON.parse(sessionStorage.getItem('tips'));
              this.titleText = sessionStorage.getItem('title');
              if (sessionStorage.getItem('searchTerm')){
                this.filterForm.controls.tipSearch.setValue(sessionStorage.getItem('searchTerm'));
                this.isSearching = true;
              }

              if (this.titleText === 'All Tips'){
                this.tipUrlData.viewingAllTips = true;
                this.tipService.tipUrlEvent.next(this.tipUrlData);
              }

              if (this.titleText === 'My Favorites'){
                this.tipUrlData.viewingFavoriteTips = true;
                this.tipService.tipUrlEvent.next(this.tipUrlData);
              }

              if (this.titleText === 'My Tips'){
                this.tipUrlData.viewingMyTips = true;
                this.tipService.tipUrlEvent.next(this.tipUrlData);
              }

              this.recipeService.scrollToTopEvent.next("scrollTo");
              this.spinnerActive = false;
                
                //If we're on an odd number, say 22 then calculate the correct offset by taking 22 % 10,
                //subtract the remainder (2) and add 10, so the next offset of tips to load would be /30.
                //Clear the storage
                if (this.tips.length % 10 !== 0){
                  sessionStorage.setItem('offset', ((this.tips.length - (this.tips.length % 10) + 10)).toString());
                  this.recipeService.resetOffsetEvent.next(false);
                  sessionStorage.clear();
                  return;
                }

                //Otherwise if we're on an even number (10/20/30 etc), set the offset to the
                //size of the tip list so that the next loaded set will retrieve correctly
                //Clear the storage
                sessionStorage.setItem('offset', (this.tips.length).toString());
                this.recipeService.resetOffsetEvent.next(false);
                sessionStorage.clear();
                return;
            }
            ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
              
              
                this.titleText = "All Tips";
                if (this.route.snapshot.url[0].path === 'quick-tips'){
                  this.tipUrlData.viewingAllTips = true;
                  this.tipService.tipUrlEvent.next(this.tipUrlData);

                  this.tipService.getTips().subscribe((result) => {
                  this.tips = result['tips'];
                  this.spinnerActive = false;
                  });
              }
              return; 

            //If there is a response, which means we're logged in,
            } else { 
              this.userEmail = res.email;
              this.authService.getUserId(res.email).subscribe((result) => {
                this.userId = result['user']._id

                this.tipService.getFavoriteTips(this.userId).subscribe((result) => {
                  this.favoriteTips = result['tips'];
                
              ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
      

              //If we have a list of tips in session storage, retrieve the title and set
              //the tip list to the stored data
              if (sessionStorage.getItem('tips')){
                this.tips = JSON.parse(sessionStorage.getItem('tips'));
                this.titleText = sessionStorage.getItem('title');
                if (sessionStorage.getItem('searchTerm')){
                  this.filterForm.controls.tipSearch.setValue(sessionStorage.getItem('searchTerm'));
                  this.isSearching = true;
                }

                if (this.titleText === 'All Tips'){
                  this.tipUrlData.viewingAllTips = true;
                  this.tipService.tipUrlEvent.next(this.tipUrlData);
                }

                if (this.titleText === 'My Favorites'){
                  this.tipUrlData.viewingFavoriteTips = true;
                  this.tipService.tipUrlEvent.next(this.tipUrlData);
                }

                if (this.titleText === 'My Tips'){
                  this.tipUrlData.viewingMyTips = true;
                  this.tipService.tipUrlEvent.next(this.tipUrlData);
                }

                this.checkFavorite();

                this.recipeService.scrollToTopEvent.next("scrollTo");
                this.spinnerActive = false;
                  
                  //If we're on an odd number, say 22 then calculate the correct offset by taking 22 % 10,
                  //subtract the remainder (2) and add 10, so the next offset of tips to load would be /30.
                  //Clear the storage
                  if (this.tips.length % 10 !== 0){
                    sessionStorage.setItem('offset', ((this.tips.length - (this.tips.length % 10) + 10)).toString());
                    this.recipeService.resetOffsetEvent.next(false);
                    sessionStorage.clear();
                    return;
                  }

                  //Otherwise if we're on an even number (10/20/30 etc), set the offset to the
                  //size of the tip list so that the next loaded set will retrieve correctly
                  //Clear the storage
                  sessionStorage.setItem('offset', (this.tips.length).toString());
                  this.recipeService.resetOffsetEvent.next(false);
                  sessionStorage.clear();
                  return;
              }
              ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
              
              
                // When viewing default tips & are logged in
                  if (this.route.snapshot.url[0].path === 'quick-tips'){
                    this.tipUrlData.viewingAllTips = true;
                    this.tipService.tipUrlEvent.next(this.tipUrlData);

                    
                    this.tipService.getTips().subscribe((result) => {
                      if (result['message']){
                        this.noDataText = result['message'];
                        this.tips = null;
                        this.spinnerActive = false;
                        return;
                      }

                      this.tips = [];
                      this.tips = result['tips'];
                      this.titleText = "All Tips";
                      this.checkFavorite();
                      this.spinnerActive = false;
                    });
                  }
              
              ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
              
                  // When viewing favorite tips
                  if (this.route.snapshot.url[0].path === 'favorites'){
                    this.titleText = "My Favorites";
                    this.tipUrlData.viewingFavoriteTips = true;
                    this.tipService.tipUrlEvent.next(this.tipUrlData);

                    this.tipService.populateGetFavoriteTips(this.userId).subscribe((result) => {
                      this.tips = [];

                      if (result['message']){
                        this.noDataText = result['message'];
                        this.tips = null;
                        this.spinnerActive = false;
                        return;
                      }
                      
                      for (let i = 0; i < result['tips'].length; i++){
                        this.tips.push(result['tips'][i].tip);
                      }
                      this.spinnerActive = false;
                      this.checkFavorite();
                    });
                  }
                  
              ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
            
                // When viewing your submitted tips
                if (this.route.snapshot.url[0].path === 'my'){
                  this.titleText = "My Tips";
                  this.tipUrlData.viewingMyTips = true;
                  this.tipService.tipUrlEvent.next(this.tipUrlData);

                  
                  this.tipService.getMyTips(this.userEmail).subscribe((result) => {
                    if (result['message']){
                      this.noDataText = result['message'];
                      this.tips = null;
                      this.spinnerActive = false;
                      return;
                    }

                    this.tips = result['tips'];
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

  searchTips(){
    this.spinnerActive = true;
    this.isSearching = true;
    this.noDataText = "No Tips Found";
    this.recipeService.toggleIsSearchingRecipesEvent.next(true);
    this.recipeService.resetOffsetEvent.next(true);
    this.recipeService.resetMoreLoadedEvent.next(false);
    this.recipeService.searchTermEvent.next(this.filterForm.controls.tipSearch.value);

    if (this.route.snapshot.url[0].path === 'quick-tips'){
      if (!this.filterForm.controls.tipSearch.value){
        this.tipService.getTips().subscribe((result) => {
          this.tips = result['tips'];
          this.spinnerActive = false;
        });
        return;
      }
      
      this.tipService.searchAllTips(this.filterForm.controls.tipSearch.value).subscribe((result) => {
        this.tips = result['tips'];
        this.spinnerActive = false;
      });
    }

    if (this.route.snapshot.url[0].path === 'favorites'){
      if (!this.filterForm.controls.tipSearch.value){
        this.tipService.getFavoriteTips(this.userId).subscribe((result) => {
          this.tips = result['tips'];
          this.spinnerActive = false;
        });
        return;
      }
      
      this.tipService.searchFavoriteTips(this.userId, this.filterForm.controls.tipSearch.value).subscribe((result) => {
        this.tips = result['tips'];
        this.spinnerActive = false;
      });
    }

    if (this.route.snapshot.url[0].path === 'my'){
      if (!this.filterForm.controls.tipSearch.value){
        this.tipService.getMyTips(this.userEmail).subscribe((result) => {
          this.tips = result['tips'];
          this.spinnerActive = false;
        });
        return;
      }
      
      this.tipService.searchMyTips(this.userEmail, this.filterForm.controls.tipSearch.value).subscribe((result) => {
        this.tips = result['tips'];
        this.spinnerActive = false;
      });
    }
  }

  resetSearch(){
    this.isSearching = false;
    this.noDataText = "";
    this.filterForm.controls.tipSearch.setValue('');
    this.recipeService.toggleIsSearchingRecipesEvent.next(false);
    this.recipeService.resetOffsetEvent.next(true);
    this.recipeService.searchTermEvent.next("");
    this.tips = [];
    this.spinnerActive = true;

    if (this.route.snapshot.url[0].path === 'quick-tips'){
      if (!this.filterForm.controls.tipSearch.value){
        this.tipService.getTips().subscribe((result) => {
          this.tips = result['tips'];
          this.spinnerActive = false;
          this.recipeService.resetMoreLoadedEvent.next(false);
        });
        return;
      }
      
      this.tipService.getTips().subscribe((result) => {
        this.tips = result['tips'];
        this.spinnerActive = false;
      });
    }

    if (this.route.snapshot.url[0].path === 'favorites'){
      if (!this.filterForm.controls.tipSearch.value){
        this.tipService.populateGetFavoriteTips(this.userId).subscribe((result) => {
          this.tips = [];
          for (let i = 0; i < result['tips'].length; i++){
            this.tips.push(result['tips'][i].tip);
          }
          this.spinnerActive = false;
          this.recipeService.resetMoreLoadedEvent.next(false);
        });
        return;
      }
      
      this.tipService.populateGetFavoriteTips(this.userId).subscribe((result) => {
        this.tips = [];
        for (let i = 0; i < result['tips'].length; i++){
          this.tips.push(result['tips'][i].tip);
        }
        this.spinnerActive = false;
      });
    }

    if (this.route.snapshot.url[0].path === 'my'){
      if (!this.filterForm.controls.tipSearch.value){
        this.tipService.getMyTips(this.userEmail).subscribe((result) => {
          this.tips = result['tips'];
          this.spinnerActive = false;
          this.recipeService.resetMoreLoadedEvent.next(false);
        });
        return;
      }
      
      this.tipService.getMyTips(this.userEmail).subscribe((result) => {
        this.tips = result['tips'];
        this.spinnerActive = false;
      });
    }
    
  }
  
  //Clear subscription(s)
  ngOnDestroy(): void {
    this.authChangeSubscription.unsubscribe();
    this.routeChangeSubscription.unsubscribe();
    this.moreTipsLoadedSubscription.unsubscribe();
  }
  
  // Gets current logged in user email, grabs your user id from said email,
  //then grabs your favorite tips from your user id. Then calls checkFavorite
  //which populates an array of favorites to display them correctly on screen
  getFavoriteTips(){
    if (!this.userId){return;}
      this.tipService.getFavoriteTips(this.userId).subscribe((result) => {
        this.favoriteTips = result['tips'];
        this.checkFavorite();
      });
  }
  
  // Pops up a snackbar and copies the tip url to the clipboard
  shareTip(id: string) {
    this.clipboard.copy('dish-recipes.app/quick-tips/' + id);
    this.snackbarService.openSnackbar('Tip link copied!', 1000);
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

      const favoriteTip = new FavoriteTip(tipId, this.userId)
      this.tipService.favoriteTip(favoriteTip).subscribe((result) => {
        this.snackbarService.openSnackbar("Favorite Added!", 1500);        
        this.getFavoriteTips();
      });

    });
  }
  
    // Deletes a favorite tip. 
    deleteFavorite(tipId: string){
      
      // If we're removing a favorite tip when viewing favorite tips,
      // refresh the list so it gets removed from the view
      if (this.route.snapshot.url[0].path === 'favorites'){
            this.tipService.removeFavorite(tipId).subscribe((result) => {
            for (let i = 0; i < this.tips.length; i++){
              if (this.tips[i]['_id'] === tipId){
                this.tips.splice(i, 1);
                this.favoriteTips.splice(i, 1);
                this.snackbarService.openSnackbar("Favorite Removed!", 1500);
                return;
              }
            }
      });
        return;
      }
        
        this.tipService.removeFavorite(tipId).subscribe((result) => {
          this.snackbarService.openSnackbar("Favorite Removed!", 1500);
          this.getFavoriteTips();
        });
    }
  
  // Check favorites. Loops through all of the retrieved recieps,
  // setting favoriteTipIndex[i] to false so that they arrays are 
  // the same size and have matching data. In the second loop, if the 
  // tip id matches a retrieved favorite tip id, set the corresponding
  // favoritetipindex to true to correctly display the green heart.
  // Tick the application ref to force an update of the view
  checkFavorite(){

    if (!this.favoriteTips){
      this.spinnerActive = false;
      this.favoriteTipIndex = [];
      return;
    }
    
    for (let i = 0; i < this.tips.length; i++){
      this.favoriteTipIndex[i] = false;
      for (let j = 0; j < this.favoriteTips.length; j++){
        if (this.tips[i]['_id'] === this.favoriteTips[j].tip){
          this.favoriteTipIndex[i] = true;
        }
      }
    }
    this.spinnerActive = false;
    this.ref.tick();
  }

  scrollToTop(){
    this.recipeService.scrollToTopEvent.next(true);
  }
  
  // Navigates with a 200ms delay so that you can still
  // see the button ripple effect
  navigate(path){
    //If we're navigating to a quick-tips page, store the page title, list of tips,
    //and request the scroll position from the app.component to keep you on the same 
    //page offset when you return to the tip list
    if (path.split('/')[0] === 'quick-tips'){
      sessionStorage.setItem('tips', JSON.stringify(this.tips));
      sessionStorage.setItem('title', this.titleText);
      sessionStorage.setItem('scrollPos', '');
      if (this.isSearching){
        sessionStorage.setItem('searchTerm', this.filterForm.controls.tipSearch.value);
      }
      this.recipeService.scrollToTopEvent.next(false);
    }
    setTimeout(() => {
      this.router.navigate([path]);
    }, 200);
  }

}
