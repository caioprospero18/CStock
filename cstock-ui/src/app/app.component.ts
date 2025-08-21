import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router'; // Importação do Router e NavigationEnd

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
    return this.router.url !== '/pagina-home'
  }

}
