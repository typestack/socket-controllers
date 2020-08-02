/**
 * Caused when user parameter is given, but is invalid and cannot be parsed.
 */
export class ParameterParseJsonError extends Error {
  name = 'ParameterParseJsonError';

  constructor(value: any) {
    super('Parameter is invalid. Value (' + JSON.stringify(value) + ') cannot be parsed to JSON');
    this.stack = new Error().stack;
  }
}
