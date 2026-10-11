import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { BookService } from './book.service';
import { Book } from 'src/entities/book.entity';
import { CreateBookInput } from './input/create.book.input';
import { PaginationInput } from './input/pagination.input';
import { UpdateBookInput } from './input/update-book.input';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interface/jwt-payload.interface';
import { GqlAuthGuard } from '../guard/jwt.guard';

@Resolver(() => Book)
export class BookResolver {
  constructor(private readonly bookService: BookService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Book)
  createLendBook(
    @CurrentUser() user: JwtPayload,
    @Args('createBookInput') createBookInput: CreateBookInput,
  ) {
    return this.bookService.create(createBookInput, user.id);
  }

  @Query(() => [Book], { name: 'books' })
  findAll(@Args('pagination', { nullable: true }) pagination?: PaginationInput) {
    return this.bookService.findAll(pagination);
  }

  @Query(() => Book, { name: 'book' })
  findById(@Args('id') id: string) {
    return this.bookService.findById(id);
  }

  @Query(() => [Book], { name: 'searchBooks' })
  search(@Args('searchTerm') searchTerm: string) {
    return this.bookService.search(searchTerm);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Book)
  updateBook(
    @CurrentUser() user: JwtPayload,
    @Args('id') id: string,
    @Args('updateBookInput') updateBookInput: UpdateBookInput,
  ) {
    return this.bookService.update(id, updateBookInput, user.id, user.role);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, { name: 'deleteLentBook' })
  deleteLentBook(
    @CurrentUser() user: JwtPayload,
    @Args('bookId') bookId: string,
  ) {
    return this.bookService.delete(bookId, user.id, user.role);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Book)
  addCopy(@CurrentUser() user: JwtPayload, @Args('id') id: string) {
    return this.bookService.addCopy(id, user.id, user.role);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Book)
  removeCopy(@CurrentUser() user: JwtPayload, @Args('id') id: string) {
    return this.bookService.removeCopy(id, user.id, user.role);
  }
}
