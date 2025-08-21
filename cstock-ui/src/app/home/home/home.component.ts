import { Component } from '@angular/core';
import { ProductService } from '../../products/product.service';
import { AuthService } from '../../security/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(
    private auth: AuthService,
    private productService: ProductService
  ){}

  login(){
    this.auth.login();
  }

}
