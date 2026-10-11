import { Field, ObjectType } from '@nestjs/graphql';
import { Delivery } from 'src/entities/delivery.entity';
import { DeliveryRelay } from 'src/entities/delivery-relay.entity';
import { DeliveryTracking } from 'src/entities/delivery-tracking.entity';
import { DeliveryLeg } from 'src/entities/delivery-leg.entity';
import { DeliveryRoute } from 'src/entities/delivery-route.entity';

@ObjectType()
export class DeliveryTrackingResult {
  @Field(() => Delivery)
  delivery!: Delivery;

  @Field(() => [DeliveryTracking])
  events!: DeliveryTracking[];

  @Field(() => [DeliveryRelay])
  relays!: DeliveryRelay[];

  @Field(() => [DeliveryLeg])
  legs!: DeliveryLeg[];

  @Field(() => [DeliveryRoute])
  routes!: DeliveryRoute[];
}
