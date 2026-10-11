export type Hub = {
  id: string;
  name: string;
  location: string;
};

export type Book = {
  id: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  cover_image: string;
  copies: number;
  status: string;
  rental_price_per_day: number;
  store: Hub | null;
};

export type Review = {
  id: string;
  rating: number;
  comment: string;
  created_at?: string;
  renter: { fullName: string };
  book?: Pick<Book, 'id' | 'title' | 'author' | 'cover_image'>;
};

export type BookCard = Pick<
  Book,
  'id' | 'title' | 'author' | 'genre' | 'cover_image' | 'copies' | 'status'
> & {
  created_at: string;
};

export type BookPageData = {
  book: Book;
  stores: Hub[];
  findByBook: Review[];
  calculateRating: number;
};
