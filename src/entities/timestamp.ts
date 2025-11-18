import { Column } from 'typeorm';
import { set } from '../utils/entities';

export class CreatedAtEntity {
    @Column(
        set({
            name: 'created_at',
            type: 'timestamptz',
            default: () => 'CURRENT_TIMESTAMP(6)',
            select: false,
        }),
    )
    createdAt?: Date;
}

export class TimestampEntity extends CreatedAtEntity {
    @Column(
        set({
            name: 'updated_at',
            type: 'timestamptz',
            default: () => 'CURRENT_TIMESTAMP(6)',
            onUpdate: () => 'CURRENT_TIMESTAMP(6)',
            select: false,
        }),
    )
    updatedAt?: Date;

    @Column(
        set({
            name: 'deleted_at',
            type: 'timestamptz',
            default: null,
            select: false,
        }),
    )
    deletedAt?: Date;
}
