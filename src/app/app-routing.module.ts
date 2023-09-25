import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddRecipeComponent } from './components/add-recipe/add-recipe.component';
import { AddTipComponent } from './components/add-tip/add-tip.component';
import { CreateAccountComponent } from './components/create-account/create-account.component';
import { LogInComponent } from './components/log-in/log-in.component';
import { ProfileComponent } from './components/profile/profile.component';
import { QuickTipsListComponent } from './components/quick-tips-list/quick-tips-list.component';
import { RecipeListComponent } from './components/recipe-list/recipe-list.component';
import { ViewRecipeComponent } from './components/view-recipe/view-recipe.component';
import { ViewTipComponent } from './components/view-tip/view-tip.component';
import { AngularFireAuthGuard, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['log-in']);
// const redirectUnauthorizedToHome = () => redirectUnauthorizedTo(['view-recipes']);

const routes: Routes = [

  { path: 'view-recipes',      component: RecipeListComponent},
  { path: 'view-recipes/:id',  component: ViewRecipeComponent },


  { path: 'quick-tips',        component: QuickTipsListComponent },
  { path: 'quick-tips/:id',    component: ViewTipComponent },

  { path: 'log-in',            component: LogInComponent },
  { path: 'sign-up',           component: CreateAccountComponent},

  { path: 'add-recipe',        component: AddRecipeComponent,     canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }},
  { path: 'add-tip',           component: AddTipComponent,        canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }},
  { path: 'profile',           component: ProfileComponent,       canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }},
  { path: 'favorites/tips',    component: QuickTipsListComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }},
  { path: 'favorites/recipes', component: RecipeListComponent,    canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }},
  { path: 'my/tips',           component: QuickTipsListComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }},
  { path: 'my/recipes',        component: RecipeListComponent,    canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }},
  { path: 'edit-recipe/:id',   component: AddRecipeComponent,     canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }},
  { path: 'edit-tip/:id',      component: AddTipComponent,        canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }},
  
  
  
  // Redirects to home whenever any non-matching route is found, has to be last
  { path: '**', redirectTo: 'view-recipes' }
  
  // Redirects empty route to home
  // { path: '', redirectTo: '/view-recipes', pathMatch: 'full' },
  // { path: 'home', component:  HomeComponent },
  // { path: 'view-recipes', component: RecipeListComponent },
  
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
