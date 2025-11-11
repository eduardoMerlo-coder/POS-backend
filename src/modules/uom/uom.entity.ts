export class UomEntity {
  name: string;
  description: string;
  products: Record<string, any>[];
  constructor(data: UomEntity) {
    this.name = data.name;
    this.description = data.description;
    this.products = data.products;
  }
}
