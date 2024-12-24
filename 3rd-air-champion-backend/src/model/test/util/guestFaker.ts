import { faker } from "@faker-js/faker";

export const generateGuest = () => {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    numberOfGuests: faker.number.int({ min: 1, max: 5 }),
    returning: faker.datatype.boolean(),
    notes: faker.lorem.lines({ min: 1, max: 3 }),
  };
};
