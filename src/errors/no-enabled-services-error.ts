export class NoEnabledServicesError extends Error {
  constructor() {
    super("You must enable at least one service to fetch the latest track.");
  }
}
