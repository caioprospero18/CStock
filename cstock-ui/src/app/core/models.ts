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
      position: user.position
    };

    if (user.birthDate && user.birthDate !== 'Invalid date') {
      const formattedDate = moment(user.birthDate).format('DD/MM/YYYY');
      if (formattedDate !== 'Invalid date') {
        json.birthDate = formattedDate;
      } else {
        json.birthDate = user.birthDate;
      }
    }

    if (user.password && user.password.trim() !== '') {
      json.password = user.password;
    }

    return json;
  }

  static toJson(user: User): any {
    return this.toCreateJson(user);
  }
}

export class Product {
  id?: number;
  productName!: string;
  brand!: string;
  quantity!: number;
  purchasePrice!: number;
  salePrice!: number;
  totalInvestment!: number;
  potentialRevenue!: number;
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
      purchasePrice: product.purchasePrice,
      salePrice: product.salePrice,
      totalInvestment: product.totalInvestment,
      potentialRevenue: product.potentialRevenue,
      enterprise: product.enterprise ? { id: product.enterprise.id } : null
    }
  }

  calculateTotals(): void {
    this.totalInvestment = this.purchasePrice * this.quantity;
    this.potentialRevenue = this.salePrice * this.quantity;
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
  client?: Client;
  unitPriceUsed?: number;
  movementValue?: number;

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

    const json: any = {
      movementType: stockMovement.movementType,
      movementDate: stockMovement.movementDate.toISOString(),
      quantity: stockMovement.quantity,
      observation: stockMovement.observation,
      user: { id: stockMovement.user.id },
      product: { id: stockMovement.product.id }
    };

    if (stockMovement.client?.id && stockMovement.movementType === 'EXIT') {
      json.client = { id: stockMovement.client.id };
    }

    return json;
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

export class Client {
  id?: number;
  clientName: string = '';
  email?: string;
  phone?: string;
  identificationNumber?: string;
  enterprise?: Enterprise;

  static toJson(client: Client): any {
    const json: any = {
      clientName: client.clientName,
      email: client.email,
      phone: client.phone,
      identificationNumber: client.identificationNumber
    };

    if (client.id) {
      json.id = client.id;
    }

    if (client.enterprise?.id) {
      json.enterprise = { id: client.enterprise.id };
    }

    return json;
  }
}
