import moment from 'moment';
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

export class User {
  id!: number;
  email!: string;
  password!: string;
  userName!: string;
  position!: string;
  birthDate!: string;
  enterprise = new Enterprise();

  static toCreateJson(user: User): any {
    console.log('📤 CREATE JSON - Dados para criação:');

    const json: any = {
      userName: user.userName,
      email: user.email,
      password: user.password,
      position: user.position,
      birthDate: moment(user.birthDate).format('DD/MM/YYYY'),
      enterprise: { id: user.enterprise.id }
    };

    if (user.enterprise && user.enterprise.id) {
      json.enterprise = { id: user.enterprise.id };
    }

    return json;
  }

  static toUpdateJson(user: User): any {

    const json: any = {
      userName: user.userName,
      email: user.email,
      position: user.position,
      birthDate: moment(user.birthDate).format('DD/MM/YYYY')
    };

    if (user.password && user.password.trim() !== '') {
      json.password = user.password;
    }
    
    return json;
  }

  static toJson(user: User): any {
    console.warn('⚠️  Usando toJson() genérico - prefira toCreateJson() ou toUpdateJson()');
    return this.toCreateJson(user);
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
  movementType: string = '';
  movementDate: Date = new Date();
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

export interface OrderRequest {
  id?: number;
  productId: number;
  productName?: string;
  quantity: number;
  supplierEmail: string;
  observation: string;
  status: 'PENDENTE' | 'ENVIADO' | 'RECEBIDO';
  createdAt?: Date;
  updatedAt?: Date;
}
