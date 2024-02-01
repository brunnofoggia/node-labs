import { GenericDto } from '../../src/dto/generic.dto';


const d = new Date();

export const create: GenericDto = {
    id: 1,
    createdAt: d,
    updatedAt: d,
    deletedAt: d,
};

export const item = {
    createdAt: d,
    updatedAt: d,
    ...create
};

export const update = {
    ...create,
    createdAt: d,
    updatedAt: d,
    name: 'test2',
};

export const idResponse = { id: 1 };
