import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { SidenavService } from 'src/app/services/sidenav.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  authChangeSubscription: Subscription;
  isAuthenticated: boolean = true;
 
  constructor(private sidenavService: SidenavService, private router: Router, private authService: AuthService) { }

  ngOnInit() {

    this.authChangeSubscription = this.authService.authChangeEvent.subscribe((result) => {
      this.isAuthenticated = result;
    });
    
  }

  navigate(path){
    setTimeout(() => {

      if (path === '/view-recipes'){
        this.authService.logout();
      }
      
      this.router.navigate([path]);
      if (this.sidenavService.isOpen){
        this.sidenavService.toggleSidenav();
      }
    }, 200);
  }

  toggleSidenav(){    
    this.sidenavService.toggleSidenav();
  }

  ngOnDestroy(): void {
    this.authChangeSubscription.unsubscribe();
  }
  
}
