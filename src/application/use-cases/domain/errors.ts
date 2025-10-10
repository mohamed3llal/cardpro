export class DomainNotFoundError extends Error {
  constructor(key: string) {
    super(`Domain with key '${key}' not found`);
    this.name = "DomainNotFoundError";
  }
}

export class DomainValidationError extends Error {
  constructor(message: string, public readonly details: string[]) {
    super(message);
    this.name = "DomainValidationError";
  }
}

export class DuplicateDomainKeyError extends Error {
  constructor(key: string) {
    super(`Domain with key '${key}' already exists`);
    this.name = "DuplicateDomainKeyError";
  }
}
