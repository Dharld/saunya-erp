export class OdooError extends Error {
  reason: Error;
  stackTrace: any;

  constructor(message: string, error: Error) {
    super(message);
    this.reason = error;

    this.handleErrors();
  }

  override set message(text: string) {
    this.message = text;
  }

  override get message() {
    return this.message;
  }

  handleTypeOfError(type: string) {
    const reasonMessage = this.reason.message;
    this.message += reasonMessage.slice(reasonMessage.lastIndexOf(type));
  }

  handleErrors() {
    if (this.reason.message.includes('ValueError')) {
      this.handleTypeOfError('ValueError');
    } else if (this.reason.message.includes('AttributeError')) {
      this.handleTypeOfError('AttributeError');
    }
  }
}
