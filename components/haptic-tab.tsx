import * as Haptics from 'expo-haptics';
import { PlatformPressable } from 'expo-router/react-navigation';
import type { BottomTabBarButtonProps } from 'expo-router/tabs';

/** Tab bar button with a light haptic tick on press. */
export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        Haptics.selectionAsync().catch(() => {});
        props.onPressIn?.(ev);
      }}
    />
  );
}
