import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Subject } from 'rxjs';
import { FavoriteRecipe } from '../models/FavoriteRecipe.model';
import { Recipe } from '../models/Recipe.model';

@Injectable({
  providedIn: 'root'
})
export class RecipeServiceService {

  onViewRecipesPageEvent = new Subject<boolean>();
  moreRecipesLoadedEvent = new Subject<any>();
  resetOffsetEvent = new Subject<boolean>();
  resetMoreLoadedEvent = new Subject<boolean>();
  recipeUrlEvent = new Subject<any>();
  toggleIsSearchingRecipesEvent = new Subject<boolean>();
  searchTermEvent = new Subject<string>();
  scrollToTopEvent = new Subject<any>();
  
  constructor(private http: HttpClient, private fireAuth: AngularFireAuth) { }

  addRecipe(recipe: Recipe){
    return this.http.post<Recipe>('https://dish-recipes-url/api/addRecipe', JSON.stringify(recipe));
  }

  getRecipes(offset: number = 0){
    return this.http.get<Recipe>('https://dish-recipes-url/api/getRecipes/' + offset);
  }

  getSingleRecipe(id){
    return this.http.get<Recipe>('https://dish-recipes-url/api/getSingleRecipe/' + id);
  }

  getMyRecipes(email, offset: number = 0){
    return this.http.get<Recipe>('https://dish-recipes-url/api/getMyRecipes/' + email + '/' + offset);
  }

  updateRecipe(recipe: Recipe, id){
    return this.http.patch<Recipe>('https://dish-recipes-url/api/updateRecipe/' + id, JSON.stringify(recipe));
  }

  deleteRecipe(id){
    return this.http.delete('https://dish-recipes-url/api/deleteRecipe/' + id);
  }

  favoriteRecipe(favoriteRecipe: FavoriteRecipe){
    return this.http.post('https://dish-recipes-url/api/favoriteRecipe', JSON.stringify(favoriteRecipe));
  }

  removeFavorite(id){
    return this.http.delete('https://dish-recipes-url/api/removeFavoriteRecipe/' + id);
  }

  getFavoriteRecipes(id, offset: number = 0){
    return this.http.get<Recipe>('https://dish-recipes-url/api/getFavoriteRecipes/' + id + '/' + offset);
  }
  
  populateGetFavoriteRecipes(id, offset: number = 0){
    return this.http.get<Recipe>('https://dish-recipes-url/api/getFavoriteRecipes/populate/' + id +'/' + offset);
  }

  searchAllRecipes(searchTerm: any, offset: number = 0){
    return this.http.get<Recipe>('https://dish-recipes-url/api/searchAllRecipes/' + searchTerm + '/' + offset);
  }

  searchMyRecipes(email: string, searchTerm: any, offset: number = 0){
    return this.http.get<Recipe>('https://dish-recipes-url/api/searchMyRecipes/' + email + '/' + searchTerm + '/' + offset);
  }

  searchFavoriteRecipes(id: string, searchTerm: any, offset: number = 0){
    return this.http.get<Recipe>('https://dish-recipes-url/api/searchFavoriteRecipes/' + id + '/' + searchTerm + '/' + offset);
  }
  
}
