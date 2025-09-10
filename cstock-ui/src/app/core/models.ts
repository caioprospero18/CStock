
export class Enterprise {
  id!: number;
  enterpriseName!: string;
  cnpj!: string;


  static toJson(enterprise: Enterprise): any {
    return {
      id: enterprise.id,
      email: enterprise.enterpriseName,
      cnpj: enterprise.cnpj
    }
  }
}

export class User{
  id!: number;
  email!: string;
  password!: string;
  userName!: string;
  position!: string;
  enterprise = new Enterprise();

  static toJson(user: User): any {
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      userName: user.userName,
      position: user.position,
      enterprise: user.enterprise
    }
  }

}

export class Product {
  id!: number;
  productName!: string;
  brand!: string;
  quantity!: number;
  unitValue!: number;
  totalValue!: number;
  enterprise = new Enterprise();

  constructor(enterprise_id: number){
    this.enterprise = new Enterprise();
    this.enterprise.id = enterprise_id;
  }

  static toJson(product: Product): any {
    return {
      id: product.id,
      productName: product.productName,
      brand: product.brand,
      quantity: product.quantity,
      unitValue: product.unitValue,
      totalValue: product.quantity * product.unitValue,
      enterprise: product.enterprise ? { id: product.enterprise.id } : null
    }
  }
}


