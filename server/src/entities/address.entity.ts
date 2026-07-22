import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
    UpdateDateColumn, ManyToOne, JoinColumn, OneToMany,
    DeleteDateColumn
} from 'typeorm';
import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Country } from './country.entity';
import { City } from './city.entity';
import { District } from './district.entity';

@ObjectType()
@Entity('addresses')
export class Address {
    @Field(() => ID)
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Field()
    @Column({ unique: true })
    name!: string;

    @Field()
    @Column('uuid')
    country_id!: string;

    @Column('uuid')
    city_id!: string;

    @Column('uuid')
    district_id!: string;

    @Field()
    @CreateDateColumn()
    created_at!: Date;

    @Field()
    @DeleteDateColumn()
    deleted_at?: Date;

    @Field()
    @UpdateDateColumn()
    updated_at!: Date;

    @ManyToOne(() => Country)
    @JoinColumn({ name: 'country_id' })
    country!: Country;

    @ManyToOne(() => City)
    @JoinColumn({ name: 'city_id' })
    city!: City;

    @ManyToOne(() => District)
    @JoinColumn({ name: 'district_id' })
    district!: District;
}