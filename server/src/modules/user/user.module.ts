import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Wishlist } from 'src/entities/wishlist.entity';
import { Book } from 'src/entities/book.entity';
import { Cart } from 'src/entities/cart.entity';
import { GqlAuthGuard } from '../guard/jwt.guard';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([User, Wishlist, Book, Cart])],
  providers: [UserResolver, UserService, GqlAuthGuard],
})
export class UserModule {}
