import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../security/auth.service';
import { Product } from '../core/models';
import { environment } from '../../environments/environment';

export interface ProductFilter {
  productName?: string;
  brand?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly productsUrl = `${environment.apiUrl}/products`;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) { }

  search(filter: ProductFilter): Promise<Product[]> {
    let params = new HttpParams();

    if (filter.productName) {
      params = params.set('productName', filter.productName);
    }

    if (filter.brand) {
      params = params.set('brand', filter.brand);
    }

    return this.http.get<Product[]>(`${this.productsUrl}/search`, { params })
      .toPromise()
      .then(response => response || [])
      .catch(() => []);
  }

  listByEnterprise(): Promise<Product[]> {
    const enterpriseId = this.auth.jwtPayload?.['enterprise_id'];

    if (!enterpriseId) {
      return Promise.resolve([]);
    }

    return this.http.get<Product[]>(`${this.productsUrl}/enterprise/${enterpriseId}`)
      .toPromise()
      .then(response => response || [])
      .catch(() => []);
  }

  filterProductsLocally(products: Product[], filter: ProductFilter): Product[] {
    if (!filter.productName && !filter.brand) {
      return products;
    }

    return products.filter(product => {
      const nameMatch = !filter.productName ||
        product.productName.toLowerCase().includes(filter.productName.toLowerCase());

      const brandMatch = !filter.brand ||
        product.brand.toLowerCase().includes(filter.brand.toLowerCase());

      return nameMatch && brandMatch;
    });
  }

  searchByEnterprise(productName?: string, brand?: string): Promise<Product[]> {
    const enterpriseId = this.auth.jwtPayload?.['enterprise_id'];

    if (!enterpriseId) {
      return Promise.resolve([]);
    }

    let params = new HttpParams().set('enterpriseId', enterpriseId.toString());

    if (productName) {
      params = params.set('productName', productName);
    }

    if (brand) {
      params = params.set('brand', brand);
    }

    return this.http.get<Product[]>(`${this.productsUrl}/enterprise/search`, { params })
      .toPromise()
      .then(response => response || [])
      .catch(() => []);
  }

  add(product: Product): Promise<Product> {
    return this.http.post<Product>(this.productsUrl, Product.toJson(product))
      .toPromise()
      .then(response => response as Product)
      .catch(error => { throw error; });
  }

  remove(id: number): Promise<void> {
    return this.http.delete<void>(`${this.productsUrl}/${id}`)
      .toPromise()
      .then(() => undefined);
  }

  activate(id: number): Promise<Product> {
    return this.http.put<Product>(`${this.productsUrl}/${id}/activate`, {})
      .toPromise()
      .then(response => response as Product)
      .catch(error => { throw error; });
  }

  update(product: Product): Promise<Product> {
    return this.http.put<Product>(`${this.productsUrl}/${product.id}`, Product.toJson(product))
      .toPromise()
      .then(response => response as Product)
      .catch(error => { throw error; });
  }

  findById(id: number): Promise<Product> {
    return this.http.get<Product>(`${this.productsUrl}/${id}`)
      .toPromise()
      .then(response => response as Product)
      .catch(error => { throw error; });
  }

  findAll(): Promise<Product[]> {
    return this.http.get<Product[]>(this.productsUrl)
      .toPromise()
      .then(response => response || [])
      .catch(() => []);
  }
}
