import * as bcrypt from 'bcrypt';

import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Photo } from './Photo';
import { Profile } from './Profile';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: '100' })
  firstName: string;

  @Column({ type: 'varchar', length: '100' })
  lastName: string;

  @Column({ type: 'varchar', length: '100', unique: true })
  email: string;

  @Column('text')
  password: string;

  @Column({ type: 'boolean', default: false })
  confirmed: boolean;

  @Column({ nullable: true })
  profileId: number;

  @OneToOne(() => Profile, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  profile: Profile;

  @OneToMany(() => Photo, (photo) => photo.user)
  photos: Photo[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 12);
  }
}
