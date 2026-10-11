import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from 'src/entities/user.entity';
import { UpdateProfileInput } from './input/update-profile.input';
import { RegisterInput } from '../auth/input/register.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guard/jwt.guard';
import { JwtPayload } from '../auth/interface/jwt-payload.interface';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Wishlist } from 'src/entities/wishlist.entity';
import { Cart } from 'src/entities/cart.entity';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => User)
  me(@CurrentUser() user: JwtPayload) {
    return this.userService.findById(user.id);
  }

  @Query(() => [User], { name: 'user' })
  findAll() {
    return this.userService.findAll();
  }

  @Query(() => User, { name: 'userById' })
  findById(@Args('id') id: string) {
    return this.userService.findById(id);
  }

  @Query(() => User, { name: 'userByEmail' })
  findByEmail(@Args('email') email: string) {
    return this.userService.findByEmail(email);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Wishlist])
  myWishlist(@CurrentUser() user: JwtPayload) {
    return this.userService.getWishlist(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Wishlist)
  addToWishlist(
    @CurrentUser() user: JwtPayload,
    @Args('bookId') bookId: string,
  ) {
    return this.userService.addToWishlist(user.id, bookId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  removeFromWishlist(
    @CurrentUser() user: JwtPayload,
    @Args('bookId') bookId: string,
  ) {
    return this.userService.removeFromWishlist(user.id, bookId);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Cart])
  myCart(@CurrentUser() user: JwtPayload) {
    return this.userService.getCart(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Cart)
  addToCart(
    @CurrentUser() user: JwtPayload,
    @Args('bookId') bookId: string,
  ) {
    return this.userService.addToCart(user.id, bookId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Cart)
  updateCartQuantity(
    @CurrentUser() user: JwtPayload,
    @Args('bookId') bookId: string,
    @Args('quantity') quantity: number,
  ) {
    return this.userService.updateCartQuantity(user.id, bookId, quantity);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  removeFromCart(
    @CurrentUser() user: JwtPayload,
    @Args('bookId') bookId: string,
  ) {
    return this.userService.removeFromCart(user.id, bookId);
  }

  @Mutation(() => User)
  updateUser(
    @Args('id') id: string,
    @Args('updateUserInput') updateUserInput: UpdateProfileInput,
  ) {
    return this.userService.update(id, updateUserInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User)
  updateProfile(
    @CurrentUser() user: JwtPayload,
    @Args('updateProfileInput') updateProfileInput: UpdateProfileInput,
  ) {
    return this.userService.updateProfile(user.id, updateProfileInput);
  }

  @Mutation(() => Boolean)
  removeUser(@Args('id') id: string) {
    return this.userService.delete(id);
  }

  @Mutation(() => Boolean)
  sendRequestToAdmin(@Args('userId') userId: string) {
    return this.userService.sendRequestToAdmin(userId);
  }
}
