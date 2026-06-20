declare module 'react-copy-to-clipboard' {
  import type { Component, ReactElement } from 'react';

  export type CopyToClipboardOptions = {
    debug?: boolean;
    message?: string;
    format?: string;
  };

  export type CopyToClipboardProps = {
    children: ReactElement;
    text: string;
    onCopy?: (text: string, result: boolean) => void;
    options?: CopyToClipboardOptions;
  };

  export class CopyToClipboard extends Component<CopyToClipboardProps> {}
}
