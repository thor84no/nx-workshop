import { getGreeting } from '../support/app.po';

describe('store', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getGreeting().should('have.text', 'Board Game Hoard');
  });
});
