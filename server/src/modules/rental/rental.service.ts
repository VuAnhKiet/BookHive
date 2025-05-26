import { Injectable } from '@nestjs/common';
import { CreateRentalInput } from './dto/create-rental.input';
import { UpdateRentalInput } from './dto/update-rental.input';

@Injectable()
export class RentalService {
  create(createRentalInput: CreateRentalInput) {
    return 'This action adds a new rental';
  }

  findAll() {
    return `This action returns all rental`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rental`;
  }

  update(id: number, updateRentalInput: UpdateRentalInput) {
    return `This action updates a #${id} rental`;
  }

  remove(id: number) {
    return `This action removes a #${id} rental`;
  }
}
