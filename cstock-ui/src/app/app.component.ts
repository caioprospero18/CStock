import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'cstock-ui';
  isInIframe: boolean = false;

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {}


  showingNavbar(): boolean {
    const currentUrl = this.router.url;
    return currentUrl !== '/home' && !currentUrl.includes('?error=true');
  }

}
