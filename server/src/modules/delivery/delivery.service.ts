import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  ILike,
  In,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { BookStatus } from '../../common/enum/book/book-status.enum';
import { DeliveryStatus } from '../../common/enum/delivery/delivery-status.enum';
import { RentalStatus } from '../../common/enum/user/rental-status.enum';
import { PaymentStatus } from '../../common/enum/payment/payment-status.enum';
import { UserRole } from '../../common/enum/user/user-role.enum';
import { Delivery } from '../../entities/delivery.entity';
import { DeliveryRelay } from '../../entities/delivery-relay.entity';
import { DeliveryRoute } from '../../entities/delivery-route.entity';
import { DeliveryTracking } from '../../entities/delivery-tracking.entity';
import { DeliveryLeg } from '../../entities/delivery-leg.entity';
import { Book } from '../../entities/book.entity';
import { Rental } from '../../entities/rental.entity';
import { Store } from '../../entities/store.entity';
import { DeliveryTrackingResult } from './delivery-tracking-result.object';
import { Notification } from '../../entities/notification.entity';
import { NotificationStatus } from '../../common/enum/notification/notification-status.enum';
import { NotificationType } from '../../common/enum/notification/notification-type.enum';
import { BookTransfer } from '../../entities/book-transfer.entity';
import { BookTransferStatus } from '../../common/enum/admin/book-transfer-status.enum';
import { VolunteerRouteResult } from './volunteer-route-result.object';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,
    @InjectRepository(DeliveryRoute)
    private readonly routeRepository: Repository<DeliveryRoute>,
    @InjectRepository(DeliveryRelay)
    private readonly relayRepository: Repository<DeliveryRelay>,
    @InjectRepository(DeliveryTracking)
    private readonly trackingRepository: Repository<DeliveryTracking>,
    @InjectRepository(Rental)
    private readonly rentalRepository: Repository<Rental>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(DeliveryLeg)
    private readonly deliveryLegRepository: Repository<DeliveryLeg>,
  ) {}

  async createRequest(
    rentalId: string,
    destinationStoreId: string,
    requesterId: string,
  ): Promise<Delivery> {
    const rental = await this.rentalRepository.findOne({
      where: { id: rentalId },
      relations: { store: true },
    });
    if (!rental) {
      throw new NotFoundException(`Rental with ID ${rentalId} not found`);
    }
    if (rental.renter_id !== requesterId) {
      throw new ForbiddenException('Only the renter can request delivery');
    }
    if (rental.status !== RentalStatus.APPROVED) {
      throw new BadRequestException(
        'Delivery can only be requested for an approved rental',
      );
    }
    if (rental.payment_status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException(
        'Rental must be paid before requesting delivery',
      );
    }
    if (!rental.store?.location?.trim()) {
      throw new BadRequestException('The rental store has no pickup location');
    }
    const destinationStore = await this.storeRepository.findOneBy({
      id: destinationStoreId,
    });
    if (!destinationStore) {
      throw new NotFoundException(
        `Destination hub with ID ${destinationStoreId} not found`,
      );
    }
    if (destinationStore.id === rental.store_id) {
      throw new BadRequestException(
        'Delivery is unnecessary when the book is already at the destination hub',
      );
    }
    if (await this.deliveryRepository.findOneBy({ rental_id: rentalId })) {
      throw new ConflictException('A delivery request already exists for this rental');
    }

    return this.deliveryRepository.manager.transaction(async (manager) => {
      const bookRepository = manager.getRepository(Book);
      const book = await bookRepository.findOne({
        where: { id: rental.book_id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!book || book.store_id !== rental.store_id) {
        throw new BadRequestException(
          'The rental book is no longer available at its source hub',
        );
      }
      if (book.status !== BookStatus.AVAILABLE) {
        throw new BadRequestException(
          'The book is no longer available for delivery',
        );
      }
      book.status = BookStatus.TRANSFERRING;
      await bookRepository.save(book);

      const delivery = await manager.getRepository(Delivery).save(
        manager.getRepository(Delivery).create({
          rental_id: rental.id,
          transfer_id: null,
          book_id: rental.book_id,
          requester_id: requesterId,
          store_id: rental.store_id,
          destination_store_id: destinationStore.id,
          pickup_location: rental.store.location.trim(),
          delivery_location: destinationStore.location,
          status: DeliveryStatus.REQUESTED,
          route_id: null,
          volunteer_id: null,
          handover_at: null,
          completed_at: null,
        }),
      );
      await manager.getRepository(DeliveryTracking).save({
        delivery_id: delivery.id,
        status: delivery.status,
        location: delivery.pickup_location,
        note: 'Delivery requested',
        updated_by: requesterId,
      });
      return delivery;
    });
  }

  async findRoutes(
    originLocation: string,
    destinationLocation: string,
  ): Promise<DeliveryRoute[]> {
    const origin = originLocation.trim();
    const destination = destinationLocation.trim();
    if (!origin || !destination) {
      throw new BadRequestException(
        'Origin and destination locations are required',
      );
    }

    return this.findRouteChain(origin, destination);
  }

  async getVolunteerRoutes(
    volunteerId: string,
    volunteerRole: string,
  ): Promise<VolunteerRouteResult[]> {
    this.assertVolunteer(volunteerRole);
    const routes = await this.routeRepository.find({
      where: { volunteer_id: volunteerId },
      order: { travel_date: 'ASC', created_at: 'DESC' },
    });
    if (!routes.length) {
      return [];
    }
    const relays = await this.relayRepository.find({
      where: { route_id: In(routes.map(({ id }) => id)) },
      order: { route_id: 'ASC', sequence: 'ASC' },
    });
    return routes.map((route) => ({
      route,
      relays: relays.filter((relay) => relay.route_id === route.id),
    }));
  }

  async getVolunteerAssignments(
    volunteerId: string,
    volunteerRole: string,
  ): Promise<DeliveryTrackingResult[]> {
    this.assertVolunteer(volunteerRole);
    const legs = await this.deliveryLegRepository.find({
      where: { volunteer_id: volunteerId },
      order: { created_at: 'DESC' },
    });
    const deliveryIds = [...new Set(legs.map(({ delivery_id }) => delivery_id))];
    return Promise.all(
      deliveryIds.map((deliveryId) =>
        this.getTracking(deliveryId, volunteerId, volunteerRole),
      ),
    );
  }

  async createRoute(
    originLocation: string,
    destinationLocation: string,
    travelDate: Date,
    capacity: number,
    volunteerId: string,
    volunteerRole: string,
  ): Promise<DeliveryRoute> {
    this.assertVolunteer(volunteerRole);
    const origin = originLocation.trim();
    const destination = destinationLocation.trim();
    const date = new Date(travelDate);
    if (!origin || !destination || this.normalizeLocation(origin) === this.normalizeLocation(destination)) {
      throw new BadRequestException('A route needs distinct origin and destination locations');
    }
    if (Number.isNaN(date.getTime()) || date < new Date(new Date().setHours(0, 0, 0, 0))) {
      throw new BadRequestException('Travel date must be today or later');
    }
    if (!Number.isInteger(capacity) || capacity < 1) {
      throw new BadRequestException('Route capacity must be a positive integer');
    }

    return this.routeRepository.save(
      this.routeRepository.create({
        volunteer_id: volunteerId,
        origin_location: origin,
        destination_location: destination,
        travel_date: date,
        capacity,
        is_active: true,
      }),
    );
  }

  async createRelay(
    routeId: string,
    location: string,
    sequence: number,
    volunteerId: string,
    volunteerRole: string,
  ): Promise<DeliveryRelay> {
    this.assertVolunteer(volunteerRole);
    const route = await this.findRoute(routeId);
    if (route.volunteer_id !== volunteerId) {
      throw new ForbiddenException('Only the route volunteer can add relay stops');
    }
    if (!location.trim() || !Number.isInteger(sequence) || sequence < 1) {
      throw new BadRequestException(
        'Relay location and a positive sequence number are required',
      );
    }
    if (await this.relayRepository.findOneBy({ route_id: routeId, sequence })) {
      throw new ConflictException('A relay already exists at this sequence');
    }

    return this.relayRepository.save(
      this.relayRepository.create({
        route_id: routeId,
        location: location.trim(),
        sequence,
      }),
    );
  }

  async assignVolunteer(
    deliveryId: string,
    managerId: string,
    managerRole: string,
  ): Promise<Delivery> {
    const delivery = await this.findDelivery(deliveryId);
    await this.assertStoreManager(delivery, managerId, managerRole);
    if (
      delivery.status !== DeliveryStatus.REQUESTED &&
      delivery.status !== DeliveryStatus.REJECTED
    ) {
      throw new BadRequestException(
        'A volunteer can only be assigned to a new or rejected request',
      );
    }

    return this.deliveryRepository.manager.transaction(async (manager) => {
      const routeRepository = manager.getRepository(DeliveryRoute);
      const legRepository = manager.getRepository(DeliveryLeg);
      const routes = await this.findRouteChain(
        delivery.pickup_location,
        delivery.delivery_location,
        routeRepository,
        legRepository,
      );
      if (!routes.length) {
        throw new BadRequestException(
          'No available volunteer route chain connects the pickup and destination hubs',
        );
      }

      for (const route of routes) {
        await routeRepository.findOne({
          where: { id: route.id },
          lock: { mode: 'pessimistic_write' },
        });
        const activeAssignments = await legRepository.count({
          where: {
            route_id: route.id,
            status: In([
              DeliveryStatus.ASSIGNED,
              DeliveryStatus.ACCEPTED,
              DeliveryStatus.HANDED_OVER,
              DeliveryStatus.IN_TRANSIT,
              DeliveryStatus.AT_RELAY,
            ]),
          },
        });
        if (activeAssignments >= route.capacity) {
          throw new BadRequestException(
            'A volunteer route no longer has available capacity; try assigning again',
          );
        }
      }

      await legRepository.save(
        routes.map((route, index) =>
          legRepository.create({
            delivery_id: delivery.id,
            route_id: route.id,
            volunteer_id: route.volunteer_id,
            sequence: index + 1,
            status: DeliveryStatus.ASSIGNED,
          }),
        ),
      );
      delivery.route_id = routes[0].id;
      delivery.volunteer_id = routes[0].volunteer_id;
      delivery.status = DeliveryStatus.ASSIGNED;
      const savedDelivery = await manager.getRepository(Delivery).save(delivery);
      await manager.getRepository(DeliveryTracking).save({
        delivery_id: savedDelivery.id,
        status: savedDelivery.status,
        location: savedDelivery.pickup_location,
        note: `Assigned ${routes.length} volunteer route leg(s)`,
        updated_by: managerId,
      });
      await manager.getRepository(Notification).save({
        user_id: savedDelivery.requester_id,
        message: 'Volunteers have been assigned to your delivery route.',
        type: NotificationType.DELIVERY_UPDATE,
        status: NotificationStatus.UNREAD,
      });
      return savedDelivery;
    });
  }

  async acceptAssignment(
    deliveryId: string,
    volunteerId: string,
    volunteerRole: string,
  ): Promise<Delivery> {
    this.assertVolunteer(volunteerRole);
    const delivery = await this.findDelivery(deliveryId);
    this.assertAssignedVolunteer(delivery, volunteerId);
    this.assertStatus(delivery, DeliveryStatus.ASSIGNED);
    const leg = await this.deliveryLegRepository.findOneBy({
      delivery_id: deliveryId,
      volunteer_id: volunteerId,
      status: DeliveryStatus.ASSIGNED,
    });
    if (!leg) {
      throw new NotFoundException('No pending leg found for this volunteer');
    }
    leg.status = DeliveryStatus.ACCEPTED;
    delivery.status =
      leg.sequence === 1
        ? DeliveryStatus.ACCEPTED
        : DeliveryStatus.HANDED_OVER;
    return this.deliveryRepository.manager.transaction(async (manager) => {
      await manager.getRepository(DeliveryLeg).save(leg);
      const savedDelivery = await manager.getRepository(Delivery).save(delivery);
      await this.saveTrackingAndNotify(
        manager,
        savedDelivery,
        volunteerId,
        'Assignment accepted',
      );
      return savedDelivery;
    });
  }

  async rejectAssignment(
    deliveryId: string,
    volunteerId: string,
    volunteerRole: string,
  ): Promise<Delivery> {
    this.assertVolunteer(volunteerRole);
    const delivery = await this.findDelivery(deliveryId);
    this.assertAssignedVolunteer(delivery, volunteerId);
    this.assertStatus(delivery, DeliveryStatus.ASSIGNED);
    const leg = await this.deliveryLegRepository.findOneBy({
      delivery_id: deliveryId,
      volunteer_id: volunteerId,
      status: DeliveryStatus.ASSIGNED,
    });
    if (!leg) {
      throw new NotFoundException('No pending leg found for this volunteer');
    }
    if (leg.sequence !== 1) {
      throw new BadRequestException(
        'A later relay leg cannot be rejected after the book has left its source hub',
      );
    }
    delivery.status = DeliveryStatus.REJECTED;
    delivery.route_id = null;
    delivery.volunteer_id = null;
    return this.deliveryRepository.manager.transaction(async (manager) => {
      await manager.getRepository(DeliveryLeg).delete({ delivery_id: deliveryId });
      const savedDelivery = await manager.getRepository(Delivery).save(delivery);
      await this.saveTrackingAndNotify(
        manager,
        savedDelivery,
        volunteerId,
        `Volunteer rejected route leg ${leg.sequence}; route needs reassignment`,
      );
      return savedDelivery;
    });
  }

  async handoverBook(
    deliveryId: string,
    managerId: string,
    managerRole: string,
  ): Promise<Delivery> {
    const delivery = await this.findDelivery(deliveryId);
    await this.assertStoreManager(delivery, managerId, managerRole);
    this.assertStatus(delivery, DeliveryStatus.ACCEPTED);
    const firstLeg = await this.deliveryLegRepository.findOneBy({
      delivery_id: deliveryId,
      sequence: 1,
      status: DeliveryStatus.ACCEPTED,
    });
    if (!firstLeg) {
      throw new BadRequestException('The first volunteer has not accepted yet');
    }
    firstLeg.status = DeliveryStatus.HANDED_OVER;
    delivery.status = DeliveryStatus.HANDED_OVER;
    delivery.handover_at = new Date();
    return this.deliveryRepository.manager.transaction(async (manager) => {
      await manager.getRepository(DeliveryLeg).save(firstLeg);
      const savedDelivery = await manager.getRepository(Delivery).save(delivery);
      if (savedDelivery.transfer_id) {
        await manager.getRepository(BookTransfer).update(
          { id: savedDelivery.transfer_id },
          { status: BookTransferStatus.IN_TRANSIT },
        );
      }
      await this.saveTrackingAndNotify(
        manager,
        savedDelivery,
        managerId,
        'Book handed over to first volunteer',
        delivery.pickup_location,
      );
      return savedDelivery;
    });
  }

  async updateStatus(
    deliveryId: string,
    status: DeliveryStatus,
    volunteerId: string,
    volunteerRole: string,
    location?: string,
    note?: string,
  ): Promise<Delivery> {
    this.assertVolunteer(volunteerRole);
    if (
      status !== DeliveryStatus.IN_TRANSIT &&
      status !== DeliveryStatus.AT_RELAY
    ) {
      throw new BadRequestException('Unsupported delivery status');
    }
    const delivery = await this.findDelivery(deliveryId);
    this.assertAssignedVolunteer(delivery, volunteerId);
    const leg = await this.deliveryLegRepository.findOneBy({
      delivery_id: deliveryId,
      volunteer_id: volunteerId,
      status: In([
        DeliveryStatus.ACCEPTED,
        DeliveryStatus.HANDED_OVER,
        DeliveryStatus.IN_TRANSIT,
        DeliveryStatus.AT_RELAY,
      ]),
    });
    if (!leg) {
      throw new BadRequestException(
        'Accept the assigned delivery leg before updating its status',
      );
    }

    if (
      ((leg.status === DeliveryStatus.HANDED_OVER ||
        leg.status === DeliveryStatus.ACCEPTED) &&
        status !== DeliveryStatus.IN_TRANSIT) ||
      (leg.status === DeliveryStatus.IN_TRANSIT &&
        status !== DeliveryStatus.AT_RELAY) ||
      (leg.status === DeliveryStatus.AT_RELAY &&
        status !== DeliveryStatus.IN_TRANSIT)
    ) {
      throw new BadRequestException('Invalid delivery status transition');
    }

    const normalizedLocation = location?.trim();
    if (status === DeliveryStatus.AT_RELAY) {
      if (!normalizedLocation) {
        throw new BadRequestException(
          'A relay location is required when stopping at a relay',
        );
      }
      const relay = await this.relayRepository.findOneBy({
        route_id: leg.route_id,
        location: ILike(normalizedLocation),
      });
      if (!relay) {
        throw new BadRequestException(
          'The location is not a relay stop on this route',
        );
      }
    }

    leg.status = status;
    delivery.status = status;
    return this.deliveryRepository.manager.transaction(async (manager) => {
      await manager.getRepository(DeliveryLeg).save(leg);
      const savedDelivery = await manager.getRepository(Delivery).save(delivery);
      await this.saveTrackingAndNotify(
        manager,
        savedDelivery,
        volunteerId,
        note?.trim() || null,
        normalizedLocation || null,
      );
      return savedDelivery;
    });
  }

  async getTracking(
    deliveryId: string,
    userId: string,
    userRole: string,
  ): Promise<DeliveryTrackingResult> {
    const delivery = await this.findDelivery(deliveryId);
    await this.assertCanViewDelivery(delivery, userId, userRole);
    const [events, legs] = await Promise.all([
      this.trackingRepository.find({
        where: { delivery_id: deliveryId },
        order: { created_at: 'ASC' },
      }),
      this.deliveryLegRepository.find({
        where: { delivery_id: deliveryId },
        order: { sequence: 'ASC' },
      }),
    ]);
    const routeIds = legs.map((leg) => leg.route_id);
    const [relays, routes] = routeIds.length
      ? await Promise.all([
        this.relayRepository.find({
          where: { route_id: In(routeIds) },
          order: { route_id: 'ASC', sequence: 'ASC' },
        }),
        this.routeRepository.findBy({ id: In(routeIds) }),
      ])
      : [[], []];
    return { delivery, events, relays, legs, routes };
  }

  async completeDelivery(
    deliveryId: string,
    volunteerId: string,
    volunteerRole: string,
  ): Promise<Delivery> {
    this.assertVolunteer(volunteerRole);
    const delivery = await this.findDelivery(deliveryId);
    this.assertAssignedVolunteer(delivery, volunteerId);
    return this.deliveryRepository.manager.transaction(async (manager) => {
      const legs = manager.getRepository(DeliveryLeg);
      const currentLeg = await legs.findOne({
        where: {
          delivery_id: deliveryId,
          volunteer_id: volunteerId,
          status: In([DeliveryStatus.IN_TRANSIT, DeliveryStatus.AT_RELAY]),
        },
        lock: { mode: 'pessimistic_write' },
      });
      if (!currentLeg) {
        throw new BadRequestException(
          'Only the assigned volunteer with an in-transit leg can complete it',
        );
      }
      currentLeg.status = DeliveryStatus.COMPLETED;
      await legs.save(currentLeg);

      const nextLeg = await legs.findOneBy({
        delivery_id: deliveryId,
        sequence: currentLeg.sequence + 1,
      });
      if (nextLeg) {
        nextLeg.status = DeliveryStatus.ASSIGNED;
        await legs.save(nextLeg);
        delivery.route_id = nextLeg.route_id;
        delivery.volunteer_id = nextLeg.volunteer_id;
        delivery.status = DeliveryStatus.ASSIGNED;
        const savedDelivery = await manager.getRepository(Delivery).save(delivery);
        await this.saveTrackingAndNotify(
          manager,
          savedDelivery,
          volunteerId,
          `Book handed over at relay to volunteer for leg ${nextLeg.sequence}`,
          currentLeg.sequence
            ? (await this.findRoute(currentLeg.route_id)).destination_location
            : null,
        );
        return savedDelivery;
      }

      const books = manager.getRepository(Book);
      const book = await books.findOne({
        where: { id: delivery.book_id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!book) {
        throw new NotFoundException('Book for this delivery was not found');
      }
      if (book.status !== BookStatus.TRANSFERRING) {
        throw new BadRequestException('Book is not in transit for this delivery');
      }
      const currentRoute = await this.findRoute(currentLeg.route_id);
      if (
        this.normalizeLocation(currentRoute.destination_location) !==
        this.normalizeLocation(delivery.delivery_location)
      ) {
        throw new BadRequestException(
          'The final volunteer route does not reach the destination hub',
        );
      }
      if (
        currentLeg.sequence === 1 &&
        book.store_id !== delivery.store_id
      ) {
        throw new BadRequestException(
          'Book is no longer at the delivery source hub',
        );
      }

      book.store_id = delivery.destination_store_id;
      book.status = BookStatus.AVAILABLE;
      if (delivery.transfer_id) {
        const transferResult = await manager.getRepository(BookTransfer).update(
          { id: delivery.transfer_id, status: BookTransferStatus.IN_TRANSIT },
          { status: BookTransferStatus.COMPLETED },
        );
        if (!transferResult.affected) {
          throw new BadRequestException(
            'Hub transfer is not in transit and cannot be completed',
          );
        }
      }
      delivery.status = DeliveryStatus.COMPLETED;
      delivery.completed_at = new Date();
      await books.save(book);
      const savedDelivery = await manager.getRepository(Delivery).save(delivery);
      await manager.getRepository(DeliveryTracking).save({
        delivery_id: savedDelivery.id,
        status: savedDelivery.status,
        location: savedDelivery.delivery_location,
        note: 'Delivery completed; book checked in at destination hub',
        updated_by: volunteerId,
      });
      await manager.getRepository(Notification).save({
        user_id: savedDelivery.requester_id,
        message: 'Your book has arrived at the destination hub and is ready for pickup.',
        type: NotificationType.DELIVERY_UPDATE,
        status: NotificationStatus.UNREAD,
      });
      return savedDelivery;
    });
  }

  private async findDelivery(deliveryId: string): Promise<Delivery> {
    const delivery = await this.deliveryRepository.findOneBy({ id: deliveryId });
    if (!delivery) {
      throw new NotFoundException(`Delivery with ID ${deliveryId} not found`);
    }
    return delivery;
  }

  private async findRoute(routeId: string): Promise<DeliveryRoute> {
    const route = await this.routeRepository.findOneBy({ id: routeId });
    if (!route) {
      throw new NotFoundException(`Delivery route with ID ${routeId} not found`);
    }
    return route;
  }

  private async findRouteChain(
    originLocation: string,
    destinationLocation: string,
    routeRepository = this.routeRepository,
    legRepository = this.deliveryLegRepository,
  ): Promise<DeliveryRoute[]> {
    const routes = await routeRepository.find({
      where: {
        is_active: true,
        travel_date: MoreThanOrEqual(new Date(new Date().setHours(0, 0, 0, 0))),
      },
      order: { travel_date: 'ASC', created_at: 'ASC' },
    });
    const availableRoutes: DeliveryRoute[] = [];
    for (const route of routes) {
      const activeLegs = await legRepository.count({
        where: {
          route_id: route.id,
          status: In([
            DeliveryStatus.ASSIGNED,
            DeliveryStatus.ACCEPTED,
            DeliveryStatus.HANDED_OVER,
            DeliveryStatus.IN_TRANSIT,
            DeliveryStatus.AT_RELAY,
          ]),
        },
      });
      if (activeLegs < route.capacity) {
        availableRoutes.push(route);
      }
    }

    const origin = this.normalizeLocation(originLocation);
    const destination = this.normalizeLocation(destinationLocation);
    const queue: Array<{ location: string; path: DeliveryRoute[] }> = [
      { location: origin, path: [] },
    ];
    const shortestPathToLocation = new Map<string, number>([[origin, 0]]);
    while (queue.length) {
      const current = queue.shift()!;
      for (const route of availableRoutes) {
        if (
          this.normalizeLocation(route.origin_location) !== current.location ||
          (current.path.length > 0 &&
            new Date(route.travel_date).getTime() <
              new Date(current.path[current.path.length - 1].travel_date).getTime()) ||
          current.path.some((pathRoute) => pathRoute.id === route.id)
        ) {
          continue;
        }
        const path = [...current.path, route];
        const nextLocation = this.normalizeLocation(route.destination_location);
        if (nextLocation === destination) {
          return path;
        }
        const priorDistance = shortestPathToLocation.get(nextLocation);
        if (priorDistance === undefined || path.length < priorDistance) {
          shortestPathToLocation.set(nextLocation, path.length);
          queue.push({ location: nextLocation, path });
        }
      }
    }
    return [];
  }

  private async assertStoreManager(
    delivery: Delivery,
    managerId: string,
    managerRole: string,
  ): Promise<void> {
    if (managerRole !== UserRole.STORE_MANAGER) {
      throw new ForbiddenException('Only the store manager can manage delivery');
    }
    const store = await this.storeRepository.findOneBy({
      id: delivery.store_id,
      store_manager_id: managerId,
    });
    if (!store) {
      throw new ForbiddenException('Only this store’s manager can manage delivery');
    }
  }

  private async assertCanViewDelivery(
    delivery: Delivery,
    userId: string,
    userRole: string,
  ): Promise<void> {
    if (
      userRole === UserRole.ADMIN ||
      delivery.requester_id === userId ||
      delivery.volunteer_id === userId
    ) {
      return;
    }
    if (
      userRole === UserRole.VOLUNTEER &&
      (await this.deliveryLegRepository.findOneBy({
        delivery_id: delivery.id,
        volunteer_id: userId,
      }))
    ) {
      return;
    }
    await this.assertStoreManager(delivery, userId, userRole);
  }

  private assertVolunteer(userRole: string): void {
    if (userRole !== UserRole.VOLUNTEER) {
      throw new ForbiddenException('Only registered volunteers can perform this action');
    }
  }

  private assertAssignedVolunteer(
    delivery: Delivery,
    volunteerId: string,
  ): void {
    if (!delivery.volunteer_id || delivery.volunteer_id !== volunteerId) {
      throw new ForbiddenException(
        'Only the assigned volunteer can perform this action',
      );
    }
  }

  private assertStatus(delivery: Delivery, expected: DeliveryStatus): void {
    if (delivery.status !== expected) {
      throw new BadRequestException(
        `Delivery must be ${expected} to perform this action`,
      );
    }
  }

  private async saveTrackingAndNotify(
    manager: EntityManager,
    delivery: Delivery,
    updatedBy: string,
    note: string | null,
    location: string | null = null,
  ): Promise<void> {
    await manager.getRepository(DeliveryTracking).save({
      delivery_id: delivery.id,
      status: delivery.status,
      location,
      note,
      updated_by: updatedBy,
    });
    await manager.getRepository(Notification).save({
      user_id: delivery.requester_id,
      message: `Delivery update: ${note ?? delivery.status.replaceAll('_', ' ')}.`,
      type: NotificationType.DELIVERY_UPDATE,
      status: NotificationStatus.UNREAD,
    });
  }

  private normalizeLocation(location: string): string {
    return location.trim().toLocaleLowerCase();
  }
}
