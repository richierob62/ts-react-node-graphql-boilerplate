import * as bcrypt from 'bcrypt';

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

  @Column({ type: 'boolean', default: false })
  account_locked: boolean;

  @Column({ nullable: true })
  profileId: number;

  @OneToOne(() => Profile, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  profile: Profile;

  @OneToMany(() => Photo, (photo) => photo.user)
  photos: Photo[];

  @BeforeUpdate()
  async hashPasswordBeforeUpdate() {
    this.password = await bcrypt.hash(this.password, 12);
  }

  @BeforeInsert()
  async hashPasswordBeforeInsert() {
    this.password = await bcrypt.hash(this.password, 12);
  }
}
