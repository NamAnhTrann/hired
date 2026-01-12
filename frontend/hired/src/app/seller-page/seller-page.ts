import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-seller-page',
  imports: [RouterLink],
  templateUrl: './seller-page.html',
  styleUrl: './seller-page.css',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class SellerPage {

}
