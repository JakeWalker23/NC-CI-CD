describe('app', () => {
  it('should display the name of the S3 service and display a description on button press and hide the button', () => {
    cy.visit('/s3');
    cy.contains('S3 Buckets - Simple Storage Solution');
    cy.contains('S3 buckets are cool!').should('not.be.visible');
    cy.get('[data-test-id=reveal-button]').as('btn').click();
    cy.contains('S3 buckets are cool!').should('be.visible');
    cy.get('@btn').should('not.be.visible');
  });

  it('should display the name of the ec2 service and display a description on button press and hide the button', () => {
    cy.visit('/ec2');
    cy.contains('EC2 - Elastic Compute Cloud');
    cy.contains('EC2 is just the coolest!').should('not.be.visible');
    cy.get('[data-test-id=reveal-button]').as('btn').click();
    cy.contains('EC2 is just the coolest!').should('be.visible');
    cy.get('@btn').should('not.be.visible');
  });

  it('should display the name of the lambda service and display a description on button press and hide the button', () => {
    cy.visit('/lambda');
    cy.contains('Lambda Functions');
    cy.contains('Lambda functions are even cooler!').should('not.be.visible');
    cy.get('[data-test-id=reveal-button]').as('btn').click();
    cy.contains('Lambda functions are even cooler!').should('be.visible');
    cy.get('@btn').should('not.be.visible');
  });
});
