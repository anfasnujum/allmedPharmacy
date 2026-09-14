import { branches } from './branches';
import { staff } from './staff';
import { products } from './products';
import { customers } from './customers';
import { requirements } from './requirements';
import { orders } from './orders';
import { trips } from './trips';
import { collections } from './collections';
import { completed } from './completed';
import { prescriptions } from './prescriptions';
import { enquiries } from './enquiries';
import type { AppData } from '@/types';

export const initialData: AppData = {
  branches,
  staff,
  products,
  customers,
  requirements,
  orders,
  trips,
  collections,
  completed,
  prescriptions,
  enquiries,
};

export {
  branches,
  staff,
  products,
  customers,
  requirements,
  orders,
  trips,
  collections,
  completed,
  prescriptions,
  enquiries,
};
