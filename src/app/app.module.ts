import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './components/home/home.component';
import { HeaderComponent } from './components/header/header.component';
import { QuickTipsListComponent } from './components/quick-tips-list/quick-tips-list.component';
import { CreateAccountComponent } from './components/create-account/create-account.component';
import { LogInComponent } from './components/log-in/log-in.component';
import { AddRecipeComponent } from './components/add-recipe/add-recipe.component';
import { RecipeListComponent } from './components/recipe-list/recipe-list.component';
import { DirectionFormComponent } from './components/add-recipe/direction-form/direction-form.component';
import { IngredientFormComponent } from './components/add-recipe/ingredient-form/ingredient-form.component';
import { AddTipComponent } from './components/add-tip/add-tip.component';
import { ViewRecipeComponent } from './components/view-recipe/view-recipe.component';

//AngularFire & Firestore
import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';
import { AngularFireAuthModule } from '@angular/fire/auth';

/* Angular Material Imports */
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { NgxMasonryModule } from 'ngx-masonry';
import { ProfileComponent } from './components/profile/profile.component';
import { ViewTipComponent } from './components/view-tip/view-tip.component';
import { ConfirmComponent } from './components/confirm/confirm.component';
import { SnackbarComponent } from './components/snackbar/snackbar.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HeaderComponent,
    RecipeListComponent,
    QuickTipsListComponent,
    CreateAccountComponent,
    LogInComponent,
    AddRecipeComponent,
    IngredientFormComponent,
    DirectionFormComponent,
    AddTipComponent,
    ViewRecipeComponent,
    ProfileComponent,
    ViewTipComponent,
    ConfirmComponent,
    SnackbarComponent
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatCardModule,
    MatRippleModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDividerModule,
    NgxMasonryModule,
    MatSelectModule,
    MatDialogModule,
    MatChipsModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    AngularFireModule,
    AngularFireAuthModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    DragDropModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
