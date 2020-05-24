import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, ID, ObjectType } from 'type-graphql';

import { Photo } from './Photo';
import { Profile } from './Profile';
import bcrypt from 'bcrypt';

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: '100', nullable: true })
  firstName: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: '100', nullable: true })
  lastName: string | null;

  @Field(() => String, { nullable: true })
  fullName: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: '100', unique: true, nullable: true })
  email: string | null;

  @Column('text', { nullable: true })
  password: string | null;

  @Field(() => Boolean)
  @Column({ type: 'boolean', default: false })
  confirmed: boolean;

  @Field(() => Boolean)
  @Column({ type: 'boolean', default: false })
  account_locked: boolean;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: '255', nullable: true })
  twitter_id: string | null;

  @OneToOne(() => Profile, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @OneToMany(() => Photo, (photo) => photo.user)
  photos: Photo[];

  @BeforeUpdate()
  async hashPasswordBeforeUpdate() {
    this.password = await bcrypt.hash(this.password, 12);
  }

  @BeforeInsert()
  async hashPasswordBeforeInsert() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }
}
