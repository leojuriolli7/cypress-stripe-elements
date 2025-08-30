# cypress-stripe-elements

A Cypress plugin that provides a command to easily fill Stripe Elements inputs within iframes. Without `cy.wait()` hacks or else.

## Installation

```bash
npm install --save-dev cypress-stripe-elements
# or
yarn add --dev cypress-stripe-elements
# or
pnpm install --save-dev cypress-stripe-elements
```

Set `{ "chromeWebSecurity": false }` in your `cypress.config.js` file, or the plugin will not work:

```js
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    chromeWebSecurity: false,
  },
});
```

Import the plugin in your Cypress support file:

```js
// cypress/support/e2e.js
import "cypress-stripe-elements";
```

### TypeScript

If you encounter type errors, make sure to include the following `types` in your `tsconfig.json` file:

```json
{
  "compilerOptions": {
    "types": ["cypress", "cypress-stripe-elements"]
  }
}
```

## Usage

This package provides a `cy.fillStripeElement(name, value)` command. It works with every Stripe Element that renders a text input.

### How it works

The `fillStripeElement` command targets Stripe Elements inputs via their `name` attribute (e.g., `input[name="number"]` for Credit Card number input). While some field names are typed for common PaymentElement fields (`number`, `cvc`, `expiry`) and LinkAuthenticationElement (`email`), you can pass any name string to support any text input field from Stripe's iframes.

### Basic Usage

```js
cy.fillStripeElement("number", "4242424242424242"); // Fill Credit Card number field
cy.fillStripeElement("expiry", "0442"); // Fill CC Expiry field
cy.fillStripeElement("cvc", "424");
cy.fillStripeElement("email", "test@example.com");
```

### Working with Multiple Iframes

When you have multiple Stripe Elements on a page (e.g., PaymentElement + LinkAuthenticationElement), use Cypress's `within()` command to scope your interactions to the correct iframe:

```js
// E-mail input is in the LinkAuthenticationElement iframe
cy.getBySelector("PaymentForm-LinkAuthenticationElement").within(() => {
  cy.fillStripeElement("email", "placeholder@mail.com");
});

// Card inputs are in the PaymentElement iframe
cy.getBySelector("PaymentForm-PaymentElement").within(() => {
  cy.fillStripeElement("number", "4242424242424242");
  cy.fillStripeElement("expiry", "0442");
  cy.fillStripeElement("cvc", "424");
});

cy.getBySelector("payment-submit-button").click();
```

### Complete Example

Given a form component like this:

```tsx
<form onSubmit={handleSubmit} data-test="payment-form">
  <div data-test="PaymentForm-LinkAuthenticationElement">
    <LinkAuthenticationElement />
  </div>

  <div data-test="PaymentForm-PaymentElement">
    <PaymentElement />
  </div>

  <button type="submit" data-test="PaymentForm-SubmitButton">
    Submit
  </button>
</form>
```

Your Cypress test would look like:

```js
describe("Payment Form", () => {
  it("successfully fills payment information", () => {
    cy.visit("/payment");

    // Fill email in LinkAuthenticationElement
    cy.getBySelector("PaymentForm-LinkElement").within(() => {
      cy.fillStripeElement("email", "test@example.com");
    });

    // Fill card details in PaymentElement
    cy.getBySelector("PaymentForm-PaymentElementContainer").within(() => {
      cy.fillStripeElement("number", "4242424242424242");
      cy.fillStripeElement("expiry", "0442");
      cy.fillStripeElement("cvc", "424");
    });

    cy.getBySelector("PaymentForm-SubmitButton").click();

    // Assert success state
    cy.contains("Payment successful").should("be.visible");
  });
});
```

## Credits

This library is based on and heavily inspired by [`cypress-plugin-stripe-elements`](https://github.com/dbalatero/cypress-plugin-stripe-elements) by [@dbalatero](https://github.com/dbalatero). The original library was unmaintained, and this version includes fixes for updated Stripe Element selectors and modern Cypress compatibility.

## License

MIT
