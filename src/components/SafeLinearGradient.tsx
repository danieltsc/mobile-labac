import type { ReactElement, ReactNode } from 'react';
import { View } from 'react-native';
import type { LinearGradientProps } from 'expo-linear-gradient';

type GradientComponent = (props: LinearGradientProps) => ReactElement;

let LinearGradientComponent: GradientComponent | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-commonjs
  const { NativeModulesProxy } = require('expo-modules-core');
  // eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-commonjs
  const module = require('expo-linear-gradient');
  const gradient = module.LinearGradient ?? module.default ?? null;
  const hasNative =
    Boolean(NativeModulesProxy?.ExpoLinearGradient) ||
    Boolean(NativeModulesProxy?.ExpoLinearGradientModule);
  LinearGradientComponent = hasNative ? gradient : null;
} catch {
  LinearGradientComponent = null;
}

interface SafeLinearGradientProps extends LinearGradientProps {
  children?: ReactNode;
}

export const SafeLinearGradient = ({ children, colors = [], style, ...rest }: SafeLinearGradientProps) => {
  if (LinearGradientComponent) {
    const Component = LinearGradientComponent;
    return (
      <Component colors={colors} style={style} {...rest}>
        {children}
      </Component>
    );
  }

  const fallbackColor = colors[colors.length - 1] ?? 'transparent';

  return (
    <View style={[{ backgroundColor: fallbackColor }, style]}>
      {children}
    </View>
  );
};

export default SafeLinearGradient;
