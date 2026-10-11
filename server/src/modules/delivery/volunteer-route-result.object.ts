import { Field, ObjectType } from '@nestjs/graphql';
import { DeliveryRelay } from '../../entities/delivery-relay.entity';
import { DeliveryRoute } from '../../entities/delivery-route.entity';

@ObjectType()
export class VolunteerRouteResult {
  @Field(() => DeliveryRoute)
  route!: DeliveryRoute;

  @Field(() => [DeliveryRelay])
  relays!: DeliveryRelay[];
}
