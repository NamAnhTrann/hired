import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  ViewChild,

} from '@angular/core';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-seller-create-page',
  templateUrl: './seller-create-page.html',
  styleUrl: './seller-create-page.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports:[RouterLink],
})
export class SellerCreatePage implements AfterViewInit {
  @ViewChild('swiper', { static: true })
  swiperRef!: ElementRef<any>;

  ngAfterViewInit() {}

  goNext() {
    this.swiperRef.nativeElement.swiper.slideNext();
  }

  goPrev() {
    this.swiperRef.nativeElement.swiper.slidePrev();
  }
}
