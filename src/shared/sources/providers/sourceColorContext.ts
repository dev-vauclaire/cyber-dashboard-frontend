import * as React from 'react';
import type { SourceColorRegistry } from '../utils/sourceColors';

type SourceColorContextValue = {
  sourceColorRegistry: SourceColorRegistry;
};

const EMPTY_SOURCE_COLOR_REGISTRY: SourceColorRegistry = new Map<string, string>();

export const SourceColorContext = React.createContext<SourceColorContextValue>({
  sourceColorRegistry: EMPTY_SOURCE_COLOR_REGISTRY,
});

export function useSourceColorContext() {
  return React.useContext(SourceColorContext);
}
