import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

const HORIZONTAL_PADDING_MIN = 16;
const HORIZONTAL_PADDING_MAX = 24;
export const CONTENT_MAX_WIDTH = 600;

export function useResponsiveLayout() {
  const { width } = useWindowDimensions();

  return useMemo(
    () => ({
      width,
      horizontalPadding: Math.min(
        Math.max(width * 0.05, HORIZONTAL_PADDING_MIN),
        HORIZONTAL_PADDING_MAX
      ),
      contentMaxWidth: CONTENT_MAX_WIDTH,
      contentPadding: {
        paddingHorizontal: Math.min(
          Math.max(width * 0.05, HORIZONTAL_PADDING_MIN),
          HORIZONTAL_PADDING_MAX
        ),
      },
    }),
    [width]
  );
}
