import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { User } from './User';
import { Document } from './Document';
import { QualificationStage } from './QualificationStage';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  companyName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  legalName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  taxId: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  dunsNumber: string;

  @Column({ type: 'simple-array', nullable: true })
  naicsCodes: string[];

  @Column({ type: 'varchar', length: 50, nullable: true })
  companySize: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  annualRevenue: number;

  @Column({ type: 'int', nullable: true })
  yearsInBusiness: number;

  @Column({ type: 'jsonb', nullable: true })
  geographicLocations: object;

  @Column({ type: 'varchar', length: 50, default: 'registration_pending' })
  status: string;

  @Column({ type: 'int', default: 1 })
  currentStage: number;

  @Column({ type: 'uuid', nullable: true })
  assignedAdvisorId: string;

  @ManyToOne(() => User, (user) => user.assignedCustomers)
  assignedAdvisor: User;

  @OneToMany(() => User, (user) => user.customer)
  users: User[];

  @OneToMany(() => Document, (document) => document.customer)
  documents: Document[];

  @OneToMany(() => QualificationStage, (stage) => stage.customer)
  qualificationStages: QualificationStage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
