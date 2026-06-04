import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import Slider from '@react-native-community/slider';

import { useGame } from '../context/GameContext';
import { palette } from '../styles/theme';
import PixelButton from '../components/PixelButton';
import GlassTabBar from '../components/GlassTabBar';

export default function SettingsScreen({ navigation }) {
  const { theme, settings, updateTheme, updateSettings } = useGame();
  const colors = palette[theme];

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={styles.page}>
        <Text style={[styles.title, { color: colors.accent }]}>Ajustes</Text>
        <Text style={[styles.sub, { color: colors.muted }]}>
          Personaliza la experiencia visual, sonido, vibración y efectos del juego.
        </Text>

        <View style={[styles.card, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
          <SettingRow
            label="Modo oscuro"
            value={theme === 'dark'}
            onValueChange={(value) => updateTheme(value ? 'dark' : 'light')}
            colors={colors}
          />

          <SettingRow
            label="Sonido"
            value={settings.sound}
            onValueChange={(value) => updateSettings({ sound: value })}
            colors={colors}
          />

          <SettingRow
            label="Vibración"
            value={settings.vibration}
            onValueChange={(value) => updateSettings({ vibration: value })}
            colors={colors}
          />

          <SettingRow
            label="Efectos visuales"
            value={settings.effects}
            onValueChange={(value) => updateSettings({ effects: value })}
            colors={colors}
          />

          <View style={styles.volumeBox}>
            <View style={styles.volumeHeader}>
              <Text style={[styles.label, { color: colors.text }]}>Volumen</Text>
              <Text style={[styles.value, { color: colors.accent }]}>{settings.volume}%</Text>
            </View>

            <Slider
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={settings.volume}
              minimumTrackTintColor={colors.accent}
              maximumTrackTintColor={colors.grid}
              thumbTintColor={colors.primary}
              onSlidingComplete={(value) => updateSettings({ volume: Math.round(value) })}
            />
          </View>
        </View>

        <View style={[styles.info, { backgroundColor: colors.soft, borderColor: colors.glassBorder }]}>
          <Text style={[styles.infoText, { color: colors.muted }]}>
            El volumen se usará cuando integremos efectos de audio reales: movimiento, victoria, empate y derrota.
          </Text>
        </View>

        <PixelButton title="VOLVER AL INICIO" onPress={() => navigation.navigate('Home')} colors={colors} />
      </View>

      <GlassTabBar navigation={navigation} active="Settings" colors={colors} />
    </View>
  );
}

function SettingRow({ label, value, onValueChange, colors }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.grid, true: colors.primary }}
        thumbColor={value ? colors.accent : colors.muted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  page: {
    flex: 1,
    padding: 22,
    paddingTop: 80,
    paddingBottom: 116,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
  },
  sub: {
    marginVertical: 10,
    lineHeight: 21,
    fontSize: 15,
  },
  card: {
    borderWidth: 1,
    borderRadius: 30,
    padding: 18,
    marginVertical: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 13,
  },
  label: {
    fontSize: 17,
    fontWeight: '900',
  },
  volumeBox: {
    marginTop: 18,
  },
  volumeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  value: {
    fontSize: 17,
    fontWeight: '900',
  },
  info: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    marginBottom: 14,
  },
  infoText: {
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '700',
  },
});