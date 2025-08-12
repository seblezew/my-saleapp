export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCreateDto {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  imageUrl?: string;
}

export interface ProductUpdateDto {
  name?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
  category?: string;
  imageUrl?: string;
}