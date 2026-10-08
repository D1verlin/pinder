import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';

export type BadgeVariant = 'tag' | 'pill' | 'count' | 'status';

interface BadgeProps {
  label: string | number;
  variant?: BadgeVariant;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'tag',
  active = false,
  onPress,
  style,
  textStyle,
  icon,
}) => {
  const isInteractive = Boolean(onPress);

  const getContainerStyle = () => {
    const list: ViewStyle[] = [styles.base];

    if (variant === 'tag') {
      list.push(styles.tag);
      if (active) list.push(styles.tagActive);
    } else if (variant === 'pill') {
      list.push(styles.pill);
      if (active) list.push(styles.pillActive);
    } else if (variant === 'count') {
      list.push(styles.count);
    } else if (variant === 'status') {
      list.push(styles.status);
    }

    if (style) list.push(style);
    return list;
  };

  const getTextStyle = () => {
    const list: TextStyle[] = [styles.baseText];

    if (variant === 'tag') {
      list.push(styles.tagText);
      if (active) list.push(styles.tagTextActive);
    } else if (variant === 'pill') {
      list.push(styles.pillText);
      if (active) list.push(styles.pillTextActive);
    } else if (variant === 'count') {
      list.push(styles.countText);
    } else if (variant === 'status') {
      list.push(styles.statusText);
    }

    if (textStyle) list.push(textStyle);
    return list;
  };

  const content = (
    <View style={styles.innerRow}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={getTextStyle()}>{label}</Text>
    </View>
  );

  if (isInteractive) {
    return (
      <TouchableOpacity
        style={getContainerStyle()}
        onPress={onPress}
        activeOpacity={0.75}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={getContainerStyle()}>{content}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 20,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 6,
  },
  tag: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE6E0',
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  tagActive: {
    backgroundColor: '#FFE9E4',
    borderColor: '#FF5757',
  },
  pill: {
    backgroundColor: '#F0ECE8',
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  pillActive: {
    backgroundColor: '#FFE9E4',
  },
  count: {
    backgroundColor: '#FF5757',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
  },
  status: {
    backgroundColor: '#EAF7EE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderColor: '#4CD964',
    borderWidth: 1,
  },
  baseText: {
    fontWeight: '600',
  },
  tagText: {
    fontSize: 13,
    color: '#4A4A4A',
  },
  tagTextActive: {
    color: '#FF5757',
    fontWeight: '700',
  },
  pillText: {
    fontSize: 12,
    color: '#737373',
  },
  pillTextActive: {
    color: '#FF5757',
    fontWeight: '700',
  },
  countText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  statusText: {
    fontSize: 11,
    color: '#28A745',
    fontWeight: '700',
  },
});
