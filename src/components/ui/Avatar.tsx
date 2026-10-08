import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  ViewStyle,
} from 'react-native';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: AvatarSize;
  isOnline?: boolean;
  hasBorder?: boolean;
  borderColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name = 'User',
  size = 'md',
  isOnline = false,
  hasBorder = false,
  borderColor = '#FF5757',
  onPress,
  style,
}) => {
  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return { size: 36, radius: 18, onlineSize: 10, borderWidth: 2 };
      case 'md':
        return { size: 52, radius: 26, onlineSize: 12, borderWidth: 2.5 };
      case 'lg':
        return { size: 76, radius: 38, onlineSize: 16, borderWidth: 3 };
      case 'xl':
        return { size: 108, radius: 54, onlineSize: 20, borderWidth: 3.5 };
    }
  };

  const dim = getDimensions();

  const containerStyle: ViewStyle = {
    width: dim.size,
    height: dim.size,
    borderRadius: dim.radius,
    position: 'relative',
    ...(hasBorder && {
      borderWidth: dim.borderWidth,
      borderColor: borderColor,
    }),
  };

  const initial = name.trim().charAt(0).toUpperCase();

  const content = (
    <View style={[styles.avatarWrapper, containerStyle, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[
            styles.image,
            { width: '100%', height: '100%', borderRadius: dim.radius },
          ]}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.fallback,
            { width: '100%', height: '100%', borderRadius: dim.radius },
          ]}
        >
          <Text style={[styles.fallbackText, { fontSize: dim.size * 0.4 }]}>
            {initial}
          </Text>
        </View>
      )}

      {isOnline && (
        <View
          style={[
            styles.onlineIndicator,
            {
              width: dim.onlineSize,
              height: dim.onlineSize,
              borderRadius: dim.onlineSize / 2,
              bottom: 1,
              right: 1,
            },
          ]}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  avatarWrapper: {
    backgroundColor: '#EFEAE4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    backgroundColor: '#E5DFD9',
  },
  fallback: {
    backgroundColor: '#FFE9E4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    color: '#FF5757',
    fontWeight: '800',
  },
  onlineIndicator: {
    position: 'absolute',
    backgroundColor: '#4CD964',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
