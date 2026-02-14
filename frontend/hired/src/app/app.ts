import { Component, signal, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { filter } from 'rxjs/operators';
import 'preline/dist/preline';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('ecom');

  hideHeaderSignal = signal(false);
  hideFooterSignal = signal(false);

  constructor(
    private router: Router,
    private auth: AuthService
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {

        const url = event.urlAfterRedirects;

        // HEADER rules
        const hideHeaderRoutes = [
          '/dashboard-page',
          '/seller-create-page'
        ];

        // FOOTER rules
        const hideFooterRoutes = [
          '/chat-page',
          '/dashboard-page',
          '/profile-page'
        ];

        this.hideHeaderSignal.set(
          hideHeaderRoutes.some(route => url.startsWith(route))
        );

        this.hideFooterSignal.set(
          hideFooterRoutes.some(route => url.startsWith(route))
        );
      });
  }

  ngOnInit(): void {
    this.auth.load_user().subscribe(
    );
  }

  hideHeader(): boolean {
    return this.hideHeaderSignal();
  }

  hideFooter(): boolean {
    return this.hideFooterSignal();
  }
}
