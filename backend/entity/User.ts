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

  @Column({ type: 'varchar', length: '100', nullable: true })
  firstName: string | null;

  @Column({ type: 'varchar', length: '100', nullable: true })
  lastName: string | null;

  @Column({ type: 'varchar', length: '100', unique: true, nullable: true })
  email: string | null;

  @Column('text', { nullable: true })
  password: string | null;

  @Column({ type: 'boolean', default: false })
  confirmed: boolean;

  @Column({ type: 'boolean', default: false })
  account_locked: boolean;

  @Column({ nullable: true })
  profileId: number;

  @Column({ type: 'varchar', length: '255', nullable: true })
  twitter_id: string | null;

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
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }
}
