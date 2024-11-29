export class User {
  id: string;
  name: string;
  email: string;

  password: string;
  picture: string;
  // FIX: Add correct types for review, favorite, store and order!
  reviews?: any[];
  favorites?: any[];
  stores?: any[];
  orders?: any[];

  createdAt: Date;
  updatedAt: Date;
}
