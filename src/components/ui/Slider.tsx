import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  LayoutChangeEvent,
  ViewStyle,
} from 'react-native';

interface SliderProps {
  label?: string;
  value: number;
  onValueChange: (val: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  style?: ViewStyle;
  quickPresets?: number[];
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  onValueChange,
  min,
  max,
  step = 1,
  unit = '',
  style,
  quickPresets,
}) => {
  const trackWidthRef = useRef<number>(200);
  const startValRef = useRef<number>(value);
  const [isDragging, setIsDragging] = useState(false);

  const percentage = Math.min(Math.max((value - min) / (max - min), 0), 1);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 4;
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 4;
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        startValRef.current = value;
        setIsDragging(true);
      },
      onPanResponderMove: (_, gestureState) => {
        const width = trackWidthRef.current || 200;
        const deltaRatio = gestureState.dx / width;
        const deltaVal = deltaRatio * (max - min);
        const rawVal = startValRef.current + deltaVal;
        const stepped = Math.round(rawVal / step) * step;
        const clamped = Math.max(min, Math.min(max, stepped));
        onValueChange(clamped);
      },
      onPanResponderRelease: (evt, gestureState) => {
        setIsDragging(false);
        if (Math.abs(gestureState.dx) < 4) {
          const width = trackWidthRef.current || 200;
          const touchX = evt.nativeEvent.locationX;
          const ratio = Math.max(0, Math.min(1, touchX / width));
          const rawVal = min + ratio * (max - min);
          const stepped = Math.round(rawVal / step) * step;
          const clamped = Math.max(min, Math.min(max, stepped));
          onValueChange(clamped);
        }
      },
      onPanResponderTerminate: () => {
        setIsDragging(false);
      },
    })
  ).current;

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    if (width > 0) {
      trackWidthRef.current = width;
    }
  };

  const handleDecrement = () => {
    const next = Math.max(min, value - step);
    onValueChange(next);
  };

  const handleIncrement = () => {
    const next = Math.min(max, value + step);
    onValueChange(next);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.headerRow}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View style={[styles.valueBadge, isDragging && styles.valueBadgeActive]}>
          <Text style={styles.valueText}>
            {value} {unit}
          </Text>
        </View>
      </View>

      <View style={styles.controlRow}>
        <TouchableOpacity
          style={styles.stepButton}
          onPress={handleDecrement}
          activeOpacity={0.65}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.stepButtonText}>−</Text>
        </TouchableOpacity>

        <View
          style={styles.trackContainer}
          onLayout={handleLayout}
          {...panResponder.panHandlers}
        >
          <View style={styles.trackBackground}>
            <View
              style={[
                styles.trackFill,
                { width: `${percentage * 100}%` },
              ]}
            />
          </View>

          <View
            pointerEvents="none"
            style={[
              styles.thumb,
              isDragging && styles.thumbActive,
              { left: `${Math.max(0, Math.min(94, percentage * 94))}%` },
            ]}
          />
        </View>

        <TouchableOpacity
          style={styles.stepButton}
          onPress={handleIncrement}
          activeOpacity={0.65}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.stepButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.boundsRow}>
        <Text style={styles.boundText}>{min} {unit}</Text>
        <Text style={styles.boundText}>{max} {unit}</Text>
      </View>

      {quickPresets && quickPresets.length > 0 && (
        <View style={styles.presetsRow}>
          {quickPresets.map((preset) => {
            const isSelected = value === preset;
            return (
              <TouchableOpacity
                key={preset}
                style={[styles.presetChip, isSelected && styles.presetChipActive]}
                onPress={() => onValueChange(preset)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.presetText,
                    isSelected && styles.presetTextActive,
                  ]}
                >
                  {preset} {unit}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  valueBadge: {
    backgroundColor: '#FFE9E4',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  valueBadgeActive: {
    backgroundColor: '#FFD3CA',
    transform: [{ scale: 1.05 }],
  },
  valueText: {
    color: '#FF5757',
    fontSize: 14,
    fontWeight: '800',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#ECE6E0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  stepButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2A2A2A',
    lineHeight: 22,
  },
  trackContainer: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    position: 'relative',
  },
  trackBackground: {
    height: 8,
    backgroundColor: '#EAE3DC',
    borderRadius: 4,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    backgroundColor: '#FF5757',
    borderRadius: 4,
  },
  thumb: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#FF5757',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 4,
  },
  thumbActive: {
    transform: [{ scale: 1.15 }],
    borderColor: '#FF3838',
  },
  boundsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingHorizontal: 48,
  },
  boundText: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    justifyContent: 'center',
  },
  presetChip: {
    backgroundColor: '#F3EFEA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  presetChipActive: {
    backgroundColor: '#FFE9E4',
    borderColor: '#FF5757',
  },
  presetText: {
    fontSize: 11,
    color: '#6E6E6E',
    fontWeight: '600',
  },
  presetTextActive: {
    color: '#FF5757',
    fontWeight: '700',
  },
});
