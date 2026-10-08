import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Slider } from './ui/Slider';
import { SegmentedControl } from './ui/SegmentedControl';
import { AppSettings } from '../types/profile';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  settings: AppSettings;
  onApply: (newSettings: Partial<AppSettings>) => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  settings,
  onApply,
}) => {
  const [distance, setDistance] = useState<number>(settings.discoveryDistance);
  const [maxAge, setMaxAge] = useState<number>(settings.maxAge);
  const [gender, setGender] = useState<'female' | 'male' | 'all'>(settings.showGender);

  const handleApply = () => {
    onApply({
      discoveryDistance: distance,
      maxAge: maxAge,
      showGender: gender,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Параметры поиска"
      variant="bottomSheet"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <SegmentedControl<'female' | 'male' | 'all'>
            options={[
              { label: 'Девушки', value: 'female' },
              { label: 'Парни', value: 'male' },
              { label: 'Все', value: 'all' },
            ]}
            selectedValue={gender}
            onSelect={setGender}
            style={styles.segmented}
          />
        </View>

        <View style={styles.section}>
          <Slider
            label="Максимальное расстояние"
            value={distance}
            onValueChange={setDistance}
            min={1}
            max={100}
            step={1}
            unit="км"
            quickPresets={[10, 25, 50, 100]}
          />
        </View>

        <View style={styles.section}>
          <Slider
            label="Максимальный возраст"
            value={maxAge}
            onValueChange={setMaxAge}
            min={18}
            max={60}
            step={1}
            unit="лет"
            quickPresets={[25, 30, 35, 45, 55]}
          />
        </View>

        <View style={styles.buttonsRow}>
          <Button
            title="Применить фильтры"
            variant="primary"
            size="lg"
            onPress={handleApply}
          />
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  segmented: {
    marginVertical: 4,
  },
  buttonsRow: {
    marginTop: 12,
    marginBottom: 8,
  },
});
