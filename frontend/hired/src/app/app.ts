import { Component, signal, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Header } from "./header/header";
import { Footer } from "./footer/footer";
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

  hideHeaderFooterSignal = signal(false);

  constructor(
    private router: Router,
    private auth: AuthService         
  ) {
    // Watch route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
const hiddenRoutes = [
  '/chat-page',
  '/dashboard-page',
  '/seller-create-page',
];        const shouldHide = hiddenRoutes.some(route =>
          event.urlAfterRedirects.startsWith(route)
        );
        this.hideHeaderFooterSignal.set(shouldHide);
      });
  }

ngOnInit(): void {
  this.auth.load_user().subscribe({
    next: (res: any) => {
      console.log("User is logged in:", res.user);
    },
    error: () => {
      console.log("No user logged in");
    }
  });
}


  hideHeaderFooter(): boolean {
    return this.hideHeaderFooterSignal();
  }
}
