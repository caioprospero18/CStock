import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router'; // Importação do Router e NavigationEnd

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'workguru-ui';
  isInIframe: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.isInIframe = window.self !== window.top;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const body = document.body;
        body.classList.remove('pagina-home');

        if (this.router.url === '/home') {
          body.classList.add('pagina-home');
        }
      }
    });
  }

  showingNavbar(): boolean {
    const isInIframe = window.self !== window.top;
    return !isInIframe && this.router.url !== '/home';
  }

  showingNavhome(): boolean {
    return this.router.url == '/home';
  }

}
