import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { DisputeStatus } from 'src/common/enum/admin/dispute-status.enum';
import { UserRole } from 'src/common/enum/user/user-role.enum';
import { Book } from 'src/entities/book.entity';
import { BookTransfer } from 'src/entities/book-transfer.entity';
import { Dispute } from 'src/entities/dispute.entity';
import { User } from 'src/entities/user.entity';
import { JwtPayload } from '../auth/interface/jwt-payload.interface';
import { GqlAuthGuard } from '../guard/jwt.guard';
import { AdminDashboard } from './admin-dashboard.object';
import { AdminService } from './admin.service';

@Resolver()
@UseGuards(GqlAuthGuard)
export class AdminResolver {
  constructor(private readonly adminService: AdminService) {}

  @Query(() => AdminDashboard)
  getDashboard(@CurrentUser() user: JwtPayload) {
    return this.adminService.getDashboard(user.role);
  }

  @Query(() => [User])
  manageUsers(@CurrentUser() user: JwtPayload) {
    return this.adminService.manageUsers(user.role);
  }

  @Mutation(() => User)
  updateUserRole(
    @CurrentUser() admin: JwtPayload,
    @Args('userId') userId: string,
    @Args('role', { type: () => UserRole }) role: UserRole,
  ) {
    return this.adminService.updateUserRole(userId, role, admin.role);
  }

  @Query(() => [Book])
  manageBooks(@CurrentUser() user: JwtPayload) {
    return this.adminService.manageBooks(user.role);
  }

  @Mutation(() => Book)
  approveBook(
    @CurrentUser() user: JwtPayload,
    @Args('bookId') bookId: string,
  ) {
    return this.adminService.approveBook(bookId, user.role);
  }

  @Mutation(() => Book)
  rejectBook(
    @CurrentUser() user: JwtPayload,
    @Args('bookId') bookId: string,
  ) {
    return this.adminService.rejectBook(bookId, user.role);
  }

  @Mutation(() => BookTransfer)
  createTransfer(
    @CurrentUser() user: JwtPayload,
    @Args('bookId') bookId: string,
    @Args('sourceStoreId') sourceStoreId: string,
    @Args('destinationStoreId') destinationStoreId: string,
  ) {
    return this.adminService.createTransfer(
      bookId,
      sourceStoreId,
      destinationStoreId,
      user.id,
      user.role,
    );
  }

  @Query(() => [BookTransfer])
  findTransfers(@CurrentUser() user: JwtPayload) {
    return this.adminService.findTransfers(user.role);
  }

  @Mutation(() => BookTransfer)
  approveTransfer(
    @CurrentUser() user: JwtPayload,
    @Args('transferId') transferId: string,
  ) {
    return this.adminService.approveTransfer(
      transferId,
      user.id,
      user.role,
    );
  }

  @Mutation(() => BookTransfer)
  rejectTransfer(
    @CurrentUser() user: JwtPayload,
    @Args('transferId') transferId: string,
    @Args('reason', { nullable: true }) reason?: string,
  ) {
    return this.adminService.rejectTransfer(
      transferId,
      user.id,
      user.role,
      reason,
    );
  }

  @Mutation(() => Dispute)
  createDispute(
    @CurrentUser() user: JwtPayload,
    @Args('reason') reason: string,
    @Args('rentalId', { nullable: true }) rentalId?: string,
    @Args('deliveryId', { nullable: true }) deliveryId?: string,
  ) {
    return this.adminService.createDispute(
      user.id,
      reason,
      rentalId,
      deliveryId,
    );
  }

  @Query(() => [Dispute])
  findDisputes(@CurrentUser() user: JwtPayload) {
    return this.adminService.findDisputes(user.role);
  }

  @Mutation(() => Dispute)
  handleDispute(
    @CurrentUser() user: JwtPayload,
    @Args('disputeId') disputeId: string,
    @Args('resolution') resolution: string,
    @Args('status', { type: () => DisputeStatus })
    status: DisputeStatus.RESOLVED | DisputeStatus.REJECTED,
  ) {
    return this.adminService.handleDispute(
      disputeId,
      resolution,
      status,
      user.id,
      user.role,
    );
  }
}
