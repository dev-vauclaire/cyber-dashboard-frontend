export type CtiAction =
  | {
      action: 'validate';
      apiKey?: string;
      code: string;
      label: string;
    }
  | {
      action: 'activate' | 'deactivate' | 'delete-key';
      code: string;
      label: string;
    };

export type CtiActionName = CtiAction['action'];
