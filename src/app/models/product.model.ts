// src/app/models/product.model.ts
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  imageUrl: string;
  sellerId: number;
  createdAt?: Date;
  updatedAt?: Date;
}