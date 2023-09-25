import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Tip } from '../models/Tip.model';
import { FavoriteTip } from '../models/FavoriteTip.model';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TipService {

  onViewTipsPageEvent = new Subject<boolean>();
  moreTipsLoadedEvent = new Subject<any>();
  tipUrlEvent = new Subject<any>();
  
  constructor(private http: HttpClient) { }

  addTip(tip: Tip){
    return this.http.post<Tip>('https://dish-recipes-url/api/addTip', JSON.stringify(tip));
  }

  getTips(offset: number = 0){
    return this.http.get<Tip>('https://dish-recipes-url/api/getTips/' + offset);
  }

  getSingleTip(id){
    return this.http.get<Tip>('https://dish-recipes-url/api/getSingleTip/' + id);
  }

  getMyTips(email, offset: number = 0){
    return this.http.get<Tip>('https://dish-recipes-url/api/getMyTips/' + email + '/' + offset);
  }

  updateTip(tip: Tip, id){
    return this.http.patch<Tip>('https://dish-recipes-url/api/updateTip/' + id, JSON.stringify(tip));
  }

  deleteTip(id){
    return this.http.delete('https://dish-recipes-url/api/deleteTip/' + id);
  }

  favoriteTip(favoriteTip: FavoriteTip){
    return this.http.post('https://dish-recipes-url/api/favoriteTip', JSON.stringify(favoriteTip));
  }

  removeFavorite(id){
    return this.http.delete('https://dish-recipes-url/api/removeFavoriteTip/' + id);
  }

  getFavoriteTips(id, offset: number = 0){
    return this.http.get<Tip>('https://dish-recipes-url/api/getFavoriteTips/' + id + '/' + offset);
  }
  
  populateGetFavoriteTips(id, offset: number = 0){
    return this.http.get<Tip>('https://dish-recipes-url/api/getFavoriteTips/populate/' + id + '/' + offset);
  }

  searchAllTips(searchTerm: any, offset: number = 0){
    return this.http.get<Tip>('https://dish-recipes-url/api/searchAllTips/' + searchTerm + '/' + offset);
  }

  searchMyTips(email: string, searchTerm: any, offset: number = 0){
    return this.http.get<Tip>('https://dish-recipes-url/api/searchMyTips/' + email + '/' + searchTerm + '/' + offset);
  }

  searchFavoriteTips(id: string, searchTerm: any, offset: number = 0){
    return this.http.get<Tip>('https://dish-recipes-url/api/searchFavoriteTips/' + id + '/' + searchTerm + '/' + offset);
  }
  
}
