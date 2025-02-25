import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'node:util';
import { ReadableStream } from 'node:stream/web';
import { MessagePort } from 'node:worker_threads';

Object.defineProperties(globalThis, {
  TextDecoder: { value: TextDecoder },
  TextEncoder: { value: TextEncoder },
  ReadableStream: { value: ReadableStream },
  MessagePort: { value: MessagePort },
});

global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
