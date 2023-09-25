import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidenavService {

  sidenavEvent = new Subject<boolean>();
  isOpen: boolean = false;
  
  constructor() { }

  toggleSidenav(){
    this.isOpen = !this.isOpen;
    this.sidenavEvent.next(this.isOpen);
  }
  
}
