import { Book, BookCard, BookPageData } from '../types/book';
import { graphqlApi } from './graphqlApi';

const BOOKS_QUERY = `
  query Books($pagination: PaginationInput) {
    books(pagination: $pagination) {
      id
      title
      author
      genre
      cover_image
      copies
      status
      created_at
    }
  }
`;

const SEARCH_BOOKS_QUERY = `
  query SearchBooks($searchTerm: String!) {
    searchBooks(searchTerm: $searchTerm) {
      id
      title
      author
      genre
      cover_image
      copies
      status
      created_at
    }
  }
`;

const BOOK_AND_HUBS_QUERY = `
  query BookAndHubs($id: String!) {
    book(id: $id) {
      id
      title
      author
      genre
      description
      cover_image
      copies
      status
      rental_price_per_day
      created_at
      store {
        id
        name
        location
      }
    }
    findByBook(bookId: $id) {
      id
      rating
      comment
      created_at
      renter {
        fullName
      }
    }
    calculateRating(bookId: $id)
    stores {
      id
      name
      location
    }
  }
`;

export const bookApi = graphqlApi.injectEndpoints({
  endpoints: (builder) => ({
    getBooks: builder.query<BookCard[], void>({
      query: () => ({
        document: BOOKS_QUERY,
        variables: { pagination: { page: 1, limit: 100 } },
      }),
      transformResponse: (response: { books: BookCard[] }) => response.books,
      providesTags: (books) => [
        { type: 'Book', id: 'LIST' },
        ...(books ?? []).map(({ id }) => ({ type: 'Book' as const, id })),
      ],
    }),
    searchBooks: builder.query<BookCard[], string>({
      query: (searchTerm) => ({
        document: SEARCH_BOOKS_QUERY,
        variables: { searchTerm },
      }),
      transformResponse: (response: { searchBooks: BookCard[] }) =>
        response.searchBooks,
      providesTags: (books) => [
        { type: 'Book', id: 'LIST' },
        ...(books ?? []).map(({ id }) => ({ type: 'Book' as const, id })),
      ],
    }),
    getBookDetails: builder.query<BookPageData, string>({
      query: (id) => ({
        document: BOOK_AND_HUBS_QUERY,
        variables: { id },
      }),
      providesTags: (_result, _error, id) => [{ type: 'Book', id }],
    }),
    createLendBook: builder.mutation<
      Book,
      {
        title: string;
        author: string;
        genre: string;
        description: string;
        cover_image: string;
        rental_price_per_day: number;
        condition: string;
      }
    >({
      query: (createBookInput) => ({
        document: `
          mutation CreateLendBook($createBookInput: CreateBookInput!) {
            createLendBook(createBookInput: $createBookInput) {
              id title author genre description cover_image copies status
              rental_price_per_day
            }
          }
        `,
        variables: { createBookInput },
      }),
      transformResponse: (response: { createLendBook: Book }) =>
        response.createLendBook,
      invalidatesTags: [{ type: 'Book', id: 'LIST' }, 'Profile'],
    }),
    updateLentBook: builder.mutation<
      Book,
      {
        id: string;
        updateBookInput: {
          title?: string;
          author?: string;
          genre?: string;
          description?: string;
          cover_image?: string;
          rental_price_per_day?: number;
        };
      }
    >({
      query: ({ id, updateBookInput }) => ({
        document: `
          mutation UpdateLentBook($id: String!, $updateBookInput: UpdateBookInput!) {
            updateBook(id: $id, updateBookInput: $updateBookInput) {
              id title author genre description cover_image copies status
              rental_price_per_day
              store { id name location }
            }
          }
        `,
        variables: { id, updateBookInput },
      }),
      transformResponse: (response: { updateBook: Book }) => response.updateBook,
      invalidatesTags: [
        { type: 'Book', id: 'LIST' },
        { type: 'Book', id: 'ADMIN_LIST' },
        'Profile',
      ],
    }),
    removeLentBook: builder.mutation<boolean, string>({
      query: (id) => ({
        document: `
          mutation DeleteLentBook($bookId: String!) {
            deleteLentBook(bookId: $bookId)
          }
        `,
        variables: { bookId: id },
      }),
      transformResponse: (response: { deleteLentBook: boolean }) =>
        response.deleteLentBook,
      invalidatesTags: [
        { type: 'Book', id: 'LIST' },
        { type: 'Book', id: 'ADMIN_LIST' },
        'Profile',
      ],
    }),
  }),
});

export const {
  useGetBooksQuery,
  useSearchBooksQuery,
  useGetBookDetailsQuery,
  useCreateLendBookMutation,
  useUpdateLentBookMutation,
  useRemoveLentBookMutation,
} = bookApi;
