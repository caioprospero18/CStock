import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../security/auth.service';
import { Product } from '../core/models';


export interface ProductFilter {
  productName?: string,
  brand?: string,
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  productsUrl = 'http://localhost:8080/products';


  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) { }



    search(filter: ProductFilter): Promise<any> {
      const headers = new HttpHeaders()
        .append('Authorization', 'Basic YWRtaW5AYWxnYW1vbmV5LmNvbTphZG1pbg==');

      let params = new HttpParams();

      if(filter.productName){
        params = params.set('productName', filter.productName);
      }

      if(filter.brand){
        params = params.set('brand', filter.brand);
      }


      return this.http.get(`${this.productsUrl}?resumo`, { headers, params })
      .toPromise()
      .then(response => {
        return response;
      });
    }


  listByEnterprise(): Promise<any> {
  const enterpriseId = this.auth.jwtPayload?.['enterprise_id'];

  if (!enterpriseId) {
    return Promise.reject('Enterprise ID não encontrado no token');
  }

  return this.http.get(`${this.productsUrl}/enterprise/${enterpriseId}`)
    .toPromise()
    .then(response => {
      return response;
    });
}

  add(product: Product): Promise<Product> {
    const headers = new HttpHeaders()
      .append('Content-Type', 'application/json');

    return this.http.post<any>(this.productsUrl, Product.toJson(product), { headers })
      .toPromise();
  }

  remove(id: number): Promise<any> {
    return this.http.delete(`${this.productsUrl}/${id}`)
      .toPromise()
      .then(() => null);
  }

  update(product: Product): Promise<any> {
    const headers = new HttpHeaders()
      .append('Content-Type', 'application/json');

    return this.http.put<Product>(`${this.productsUrl}/${product.id}`, Product.toJson(product), { headers })
      .toPromise()
      .then((response: any) => {
        const updated = response;

        return updated;
      });
  }

  searchByEnterprise(productName?: string, brand?: string): Promise<any> {
  const enterpriseId = this.auth.jwtPayload?.['enterprise_id'];

  if (!enterpriseId) {
    return Promise.reject('Enterprise ID não encontrado no token');
  }

  let params = new HttpParams()
    .set('enterpriseId', enterpriseId.toString());

  if (productName) {
    params = params.set('productName', productName);
  }

  if (brand) {
    params = params.set('brand', brand);
  }

  return this.http.get(`${this.productsUrl}/enterprise/search`, { params })
    .toPromise()
    .then(response => {
      return response;
    });
}


  findById(id: number): Promise<any> {
    return this.http.get<Product>(`${this.productsUrl}/${id}`)
      .toPromise()
      .then((response: any) => {
        const product = response;

        return product;
      });
  }

  findAll(): Promise<Product[]> {
  return this.http.get<Product[]>(this.productsUrl)
    .toPromise()
    .then(response => {
      return response || [];
    });
}

}
