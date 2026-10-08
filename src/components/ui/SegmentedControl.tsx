import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';

export interface SegmentOption<T extends string = string> {
  label: string;
  value: T;
  badge?: number | string;
}

interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  style?: ViewStyle;
}

export const SegmentedControl = <T extends string = string>({
  options,
  selectedValue,
  onSelect,
  style,
}: SegmentedControlProps<T>): React.ReactElement => {
  return (
    <View style={[styles.container, style]}>
      {options.map((option) => {
        const isSelected = option.value === selectedValue;

        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.segment, isSelected && styles.selectedSegment]}
            onPress={() => onSelect(option.value)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                isSelected ? styles.selectedSegmentText : styles.unselectedSegmentText,
              ]}
            >
              {option.label}
            </Text>

            {option.badge !== undefined && (
              <View
                style={[
                  styles.badge,
                  isSelected ? styles.selectedBadge : styles.unselectedBadge,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    isSelected ? styles.selectedBadgeText : styles.unselectedBadgeText,
                  ]}
                >
                  {option.badge}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ECE6E0',
    borderRadius: 24,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedSegment: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedSegmentText: {
    color: '#FF5757',
    fontWeight: '700',
  },
  unselectedSegmentText: {
    color: '#737373',
  },
  badge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadge: {
    backgroundColor: '#FFE9E4',
  },
  unselectedBadge: {
    backgroundColor: '#DCD4CC',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  selectedBadgeText: {
    color: '#FF5757',
  },
  unselectedBadgeText: {
    color: '#666666',
  },
});
