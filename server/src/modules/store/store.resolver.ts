import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { StoreService } from './store.service';
import { Store } from 'src/entities/store.entity';
import { Book } from 'src/entities/book.entity';
import { CreateStoreInput } from './input/create-store.input';
import { UpdateStoreInput } from './input/update-store.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guard/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interface/jwt-payload.interface';

@Resolver(() => Store)
export class StoreResolver {
  constructor(private readonly storeService: StoreService) {}

  @Mutation(() => Store)
  createStore(@Args('createStoreInput') createStoreInput: CreateStoreInput) {
    return this.storeService.create(createStoreInput);
  }

  @Query(() => [Store], { name: 'stores' })
  findAll() {
    return this.storeService.findAll();
  }

  @Query(() => Store, { name: 'store' })
  findById(@Args('id') id: string) {
    return this.storeService.findById(id);
  }

  @Mutation(() => Store)
  updateStore(
    @Args('id') id: string,
    @Args('updateStoreInput') updateStoreInput: UpdateStoreInput,
  ) {
    return this.storeService.update(id, updateStoreInput);
  }

  @Mutation(() => Boolean)
  deleteStore(@Args('id') id: string) {
    return this.storeService.delete(id);
  }

  @Query(() => [Book])
  getInventory(@Args('storeId') storeId: string) {
    return this.storeService.getInventory(storeId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Book)
  addBook(
    @CurrentUser() lender: JwtPayload,
    @Args('storeId') storeId: string,
    @Args('bookId') bookId: string,
  ) {
    return this.storeService.addBook(storeId, bookId, lender.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Book)
  removeBook(
    @CurrentUser() manager: JwtPayload,
    @Args('storeId') storeId: string,
    @Args('bookId') bookId: string,
  ) {
    return this.storeService.removeBook(
      storeId,
      bookId,
      manager.id,
      manager.role,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Book)
  approveBookHandover(
    @CurrentUser() manager: JwtPayload,
    @Args('storeId') storeId: string,
    @Args('bookId') bookId: string,
  ) {
    return this.storeService.approveBookHandover(
      storeId,
      bookId,
      manager.id,
      manager.role,
    );
  }
}
