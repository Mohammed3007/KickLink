import {
  findEvent,
  findOrganization,
  mockEvents,
  mockNotifications,
  mockOrganizations,
  mockRegistrations,
  mockStore,
  registrationsForEvent,
  spotsLeft,
} from '@kicklink/shared';

export const repo = {
  me: mockStore.me,
  organizations: mockOrganizations,
  events: mockEvents,
  notifications: mockNotifications,
  registrations: mockRegistrations,
  findEvent,
  findOrganization,
  registrationsForEvent,
  spotsLeft,
};
