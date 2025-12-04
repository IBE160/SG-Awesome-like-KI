// __mocks__/uuid.js
let counter = 0;
module.exports = {
  v4: () => {
    counter += 1;
    return `mock-uuid-${counter}`;
  },
};