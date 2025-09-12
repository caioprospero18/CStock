
export class Enterprise {
  id?: number;
  enterpriseName!: string;
  cnpj!: string;

  static toJson(enterprise: Enterprise): any {
    return {
      id: enterprise.id,
      enterpriseName: enterprise.enterpriseName,
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
  id?: number;
  productName!: string;
  brand!: string;
  quantity!: number;
  unitValue!: number;
  totalValue!: number;
  enterprise!: Enterprise;

  constructor(enterpriseId?: number) {
    this.enterprise = new Enterprise();
    if (enterpriseId) {
      this.enterprise.id = enterpriseId;
    }
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

export class StockMovement {
  id?: number;
  movementType!: string;
  movementDate!: Date;
  quantity!: number;
  observation!: string;
  user!: User;
  product!: Product;

  constructor(productId?: number, userId?: number, enterpriseId?: number) {
    this.user = new User();
    this.product = new Product();

    if (productId) {
      this.product.id = productId;
    }

    if (userId) {
      this.user.id = userId;
    }

    if (enterpriseId) {
      this.user.enterprise.id = enterpriseId;
      this.product.enterprise.id = enterpriseId;
    }

    this.movementDate = new Date();
  }

  static toJson(stockMovement: StockMovement): any {
    if (!stockMovement.product?.id) {
      throw new Error('Product ID é obrigatório');
    }

    if (!stockMovement.user?.id) {
      throw new Error('User ID é obrigatório');
    }

    return {
      movementType: stockMovement.movementType,
      movementDate: stockMovement.movementDate.toISOString(),
      quantity: stockMovement.quantity,
      observation: stockMovement.observation,
      user: { id: stockMovement.user.id },
      product: { id: stockMovement.product.id }
    }
  }
}
