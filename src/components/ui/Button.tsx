import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = true,
  leftIcon,
  rightIcon,
  style,
  textStyle,
}) => {
  const getContainerStyle = () => {
    const list: ViewStyle[] = [styles.base];

    if (fullWidth) list.push(styles.fullWidth);
    if (size === 'sm') list.push(styles.sizeSm);
    if (size === 'md') list.push(styles.sizeMd);
    if (size === 'lg') list.push(styles.sizeLg);

    if (variant === 'primary') list.push(styles.primary);
    if (variant === 'secondary') list.push(styles.secondary);
    if (variant === 'outline') list.push(styles.outline);
    if (variant === 'ghost') list.push(styles.ghost);

    if (disabled) list.push(styles.disabled);
    if (style) list.push(style);

    return list;
  };

  const getTextStyle = () => {
    const list: TextStyle[] = [styles.baseText];

    if (size === 'sm') list.push(styles.textSm);
    if (size === 'md') list.push(styles.textMd);
    if (size === 'lg') list.push(styles.textLg);

    if (variant === 'primary') list.push(styles.textPrimary);
    if (variant === 'secondary') list.push(styles.textSecondary);
    if (variant === 'outline') list.push(styles.textOutline);
    if (variant === 'ghost') list.push(styles.textGhost);

    if (disabled) list.push(styles.textDisabled);
    if (textStyle) list.push(textStyle);

    return list;
  };

  return (
    <TouchableOpacity
      style={getContainerStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFFFF' : '#FF5757'}
        />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text style={getTextStyle()}>{title}</Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      } as any,
    }),
  },
  fullWidth: {
    width: '100%',
  },
  sizeSm: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 19,
  },
  sizeMd: {
    height: 50,
    paddingHorizontal: 22,
    borderRadius: 25,
  },
  sizeLg: {
    height: 56,
    paddingHorizontal: 26,
    borderRadius: 28,
  },
  primary: {
    backgroundColor: '#FF5757',
    ...Platform.select({
      ios: {
        shadowColor: '#FF5757',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  secondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE6E0',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#FF5757',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: '#E5DFD9',
    borderColor: '#E5DFD9',
    elevation: 0,
    shadowOpacity: 0,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  baseText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  textSm: {
    fontSize: 13,
  },
  textMd: {
    fontSize: 15,
  },
  textLg: {
    fontSize: 16,
  },
  textPrimary: {
    color: '#FFFFFF',
  },
  textSecondary: {
    color: '#1C1C1E',
  },
  textOutline: {
    color: '#FF5757',
  },
  textGhost: {
    color: '#FF5757',
  },
  textDisabled: {
    color: '#9E9E9E',
  },
});
