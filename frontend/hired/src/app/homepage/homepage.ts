import { AfterContentInit, AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterLink } from '@angular/router';
import AOS from 'aos';

@Component({
  selector: 'app-homepage',
  imports: [RouterLink],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class Homepage implements AfterViewInit{

  ngAfterViewInit(): void {

  AOS.init({
    duration: 1200,
    once: true,
  });

  setTimeout(() => {
    AOS.refresh();
  }, 200);
}

}
