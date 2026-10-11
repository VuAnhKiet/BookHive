import { UseGuards } from '@nestjs/common';
import {
  Args,
  GraphQLISODateTime,
  Int,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { DeliveryStatus } from 'src/common/enum/delivery/delivery-status.enum';
import { Delivery } from 'src/entities/delivery.entity';
import { DeliveryRelay } from 'src/entities/delivery-relay.entity';
import { DeliveryRoute } from 'src/entities/delivery-route.entity';
import { JwtPayload } from '../auth/interface/jwt-payload.interface';
import { GqlAuthGuard } from '../guard/jwt.guard';
import { DeliveryTrackingResult } from './delivery-tracking-result.object';
import { DeliveryService } from './delivery.service';
import { VolunteerRouteResult } from './volunteer-route-result.object';

@Resolver()
@UseGuards(GqlAuthGuard)
export class DeliveryResolver {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Mutation(() => Delivery)
  createRequest(
    @CurrentUser() user: JwtPayload,
    @Args('rentalId') rentalId: string,
    @Args('destinationStoreId') destinationStoreId: string,
  ) {
    return this.deliveryService.createRequest(
      rentalId,
      destinationStoreId,
      user.id,
    );
  }

  @Query(() => [DeliveryRoute])
  findRoutes(
    @Args('originLocation') originLocation: string,
    @Args('destinationLocation') destinationLocation: string,
  ) {
    return this.deliveryService.findRoutes(
      originLocation,
      destinationLocation,
    );
  }

  @Query(() => [VolunteerRouteResult])
  getVolunteerRoutes(@CurrentUser() user: JwtPayload) {
    return this.deliveryService.getVolunteerRoutes(user.id, user.role);
  }

  @Query(() => [DeliveryTrackingResult])
  getVolunteerAssignments(@CurrentUser() user: JwtPayload) {
    return this.deliveryService.getVolunteerAssignments(user.id, user.role);
  }

  @Mutation(() => DeliveryRoute)
  createRoute(
    @CurrentUser() user: JwtPayload,
    @Args('originLocation') originLocation: string,
    @Args('destinationLocation') destinationLocation: string,
    @Args('travelDate', { type: () => GraphQLISODateTime })
    travelDate: Date,
    @Args('capacity', { type: () => Int }) capacity: number,
  ) {
    return this.deliveryService.createRoute(
      originLocation,
      destinationLocation,
      travelDate,
      capacity,
      user.id,
      user.role,
    );
  }

  @Mutation(() => DeliveryRelay)
  createRelay(
    @CurrentUser() user: JwtPayload,
    @Args('routeId') routeId: string,
    @Args('location') location: string,
    @Args('sequence', { type: () => Int }) sequence: number,
  ) {
    return this.deliveryService.createRelay(
      routeId,
      location,
      sequence,
      user.id,
      user.role,
    );
  }

  @Mutation(() => Delivery)
  assignVolunteer(
    @CurrentUser() user: JwtPayload,
    @Args('deliveryId') deliveryId: string,
  ) {
    return this.deliveryService.assignVolunteer(
      deliveryId,
      user.id,
      user.role,
    );
  }

  @Mutation(() => Delivery)
  acceptAssignment(
    @CurrentUser() user: JwtPayload,
    @Args('deliveryId') deliveryId: string,
  ) {
    return this.deliveryService.acceptAssignment(
      deliveryId,
      user.id,
      user.role,
    );
  }

  @Mutation(() => Delivery)
  rejectAssignment(
    @CurrentUser() user: JwtPayload,
    @Args('deliveryId') deliveryId: string,
  ) {
    return this.deliveryService.rejectAssignment(
      deliveryId,
      user.id,
      user.role,
    );
  }

  @Mutation(() => Delivery)
  handoverBook(
    @CurrentUser() user: JwtPayload,
    @Args('deliveryId') deliveryId: string,
  ) {
    return this.deliveryService.handoverBook(
      deliveryId,
      user.id,
      user.role,
    );
  }

  @Mutation(() => Delivery)
  updateStatus(
    @CurrentUser() user: JwtPayload,
    @Args('deliveryId') deliveryId: string,
    @Args('status', { type: () => DeliveryStatus }) status: DeliveryStatus,
    @Args('location', { nullable: true }) location?: string,
    @Args('note', { nullable: true }) note?: string,
  ) {
    return this.deliveryService.updateStatus(
      deliveryId,
      status,
      user.id,
      user.role,
      location,
      note,
    );
  }

  @Query(() => DeliveryTrackingResult)
  getTracking(
    @CurrentUser() user: JwtPayload,
    @Args('deliveryId') deliveryId: string,
  ) {
    return this.deliveryService.getTracking(
      deliveryId,
      user.id,
      user.role,
    );
  }

  @Mutation(() => Delivery)
  completeDelivery(
    @CurrentUser() user: JwtPayload,
    @Args('deliveryId') deliveryId: string,
  ) {
    return this.deliveryService.completeDelivery(
      deliveryId,
      user.id,
      user.role,
    );
  }
}
