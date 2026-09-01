import type { Personal } from '@/types/profile';

export const personal: Personal = {
  firstName: 'Sergey',
  lastName: 'Petrosyan',
  location: {
    city: 'Yerevan',
    country: 'Armenia',
    countryCode: 'AM',
    timezone: 'Asia/Yerevan',
  },
  email: 'petrosyanserg33@gmail.com',
  photo: null,
  availability: {
    open: true,
    modes: ['onsite', 'hybrid', 'remote'],
  },
};

export const fullName = `${personal.firstName} ${personal.lastName}`;
