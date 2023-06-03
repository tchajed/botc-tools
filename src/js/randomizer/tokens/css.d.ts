import type * as CSS from 'csstype';

declare module 'csstype' {
  interface Properties {
    // Add a CSS Custom Property
    'stroke-width'?: number;
    'font-size'?: string;
    'font-weight'?: number | string;

    // allow anything
    // [index: string]: any;
  }
}
