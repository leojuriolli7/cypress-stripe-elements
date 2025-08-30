export type StripeElementName =
  | "number"
  | "cvc"
  | "expiry"
  | "email"
  | (string & {});

declare global {
  namespace Cypress {
    interface Chainable {
      /** Fills a Stripe Element input.
       *
       * @param name string - Stripe Element name to fill (Credit card, CVC, Expiry, E-mail)
       * @param value string - The value to fill the input with.
       */
      fillStripeElement(
        name: StripeElementName,
        value: string
      ): Chainable<Element>;
    }
  }
}

const getSelectorForField = (name: string) => `input[name="${name}"]`;

/**
 * Code for the `fillStripeElement` command was taken from the `cypress-plugin-stripe-elements` library.
 * The library was unmaintaned and I had to fix the selector for the inputs for it to work.
 *
 * https://github.com/dbalatero/cypress-plugin-stripe-elements/
 */
Cypress.Commands.add(
  "fillStripeElement",
  (field: StripeElementName, value: string): void => {
    if (Cypress.config("chromeWebSecurity")) {
      throw new Error(
        'You must set `{ "chromeWebSecurity": false }` in `cypress.json`, ' +
          "or cypress-stripe-elements cannot access the Stripe Elements " +
          "<iframe> to perform autofill."
      );
    }

    const selector = getSelectorForField(field);

    cy.get("iframe")
      .should((iframe) => expect(iframe.contents().find(selector)).to.exist)
      .then((iframe) => cy.wrap(iframe.contents().find(selector)))
      .within((input) => {
        /**
         * The .should("not.be.disabled") check implements a Cypress-team-recommended
         * workaround for cases where the iframe isn't completely loaded,
         * so Cypress fails on the type() command because the input is
         * temporarily disabled.
         *
         * See https://github.com/cypress-io/cypress/issues/5827#issuecomment-751995883
         */
        cy.wrap(input).should("not.be.disabled").clear().type(value);
      });
  }
);
