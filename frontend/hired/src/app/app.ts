import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Header } from "./header/header";
import { Footer } from "./footer/footer";
import { filter } from 'rxjs/operators';
import 'preline/dist/preline';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ecom');

  hideHeaderFooterSignal = signal(false);

  constructor(private router: Router) {
    // Watch route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const hiddenRoutes = ['/chat-page','/dashboard-page']; // both header & footer hidden here
        const shouldHide = hiddenRoutes.some(route =>
          event.urlAfterRedirects.startsWith(route)
        );
        this.hideHeaderFooterSignal.set(shouldHide);
      });
  }

  hideHeaderFooter(): boolean {
    return this.hideHeaderFooterSignal();
  }
}
