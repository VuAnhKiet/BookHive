import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { RentalService } from './rental.service';
import { Rental } from 'src/entities/rental.entity';
import { CreateRentalInput } from './dto/create-rental.input';
import { UpdateRentalInput } from './dto/update-rental.input';

@Resolver(() => Rental)
export class RentalResolver {
  constructor(private readonly rentalService: RentalService) {}

  @Mutation(() => Rental)
  createRental(@Args('createRentalInput') createRentalInput: CreateRentalInput) {
    return this.rentalService.create(createRentalInput);
  }

  @Query(() => [Rental], { name: 'rental' })
  findAll() {
    return this.rentalService.findAll();
  }

  @Query(() => Rental, { name: 'rental' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.rentalService.findOne(id);
  }

  @Mutation(() => Rental)
  updateRental(@Args('updateRentalInput') updateRentalInput: UpdateRentalInput) {
    return this.rentalService.update(updateRentalInput.id, updateRentalInput);
  }

  @Mutation(() => Rental)
  removeRental(@Args('id', { type: () => Int }) id: number) {
    return this.rentalService.remove(id);
  }
}
