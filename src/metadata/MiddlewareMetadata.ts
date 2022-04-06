import { getFromContainer } from '../container';
import { MiddlewareMetadataArgs } from './args/MiddlewareMetadataArgs';
import { MiddlewareInterface } from '../MiddlewareInterface';

export class MiddlewareMetadata {
  // -------------------------------------------------------------------------
  // Properties
  // -------------------------------------------------------------------------

  target: Function;
  priority: number | undefined;
  nsp: RegExp | string[];

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  constructor(args: MiddlewareMetadataArgs) {
    this.target = args.target;
    this.priority = args.priority;
    this.nsp = args.nsp;
  }

  // -------------------------------------------------------------------------
  // Accessors
  // -------------------------------------------------------------------------

  get instance(): MiddlewareInterface {
    return getFromContainer<MiddlewareInterface>(this.target);
  }
}
