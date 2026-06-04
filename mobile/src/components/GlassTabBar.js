import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

const tabs = [
  { label: 'Inicio', screen: 'Home', icon: '⌂' },
  { label: 'Perfil', screen: 'Profile', icon: '♙' },
  { label: 'Amigos', screen: 'Friends', icon: '♟' },
  { label: 'Ajustes', screen: 'Settings', icon: '⚙' },
];

export default function GlassTabBar({ navigation, active = 'Home', colors }) {
  return (
    <View style={[styles.wrap, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
      {tabs.map((tab) => {
        const selected = active === tab.screen;

        return (
          <Pressable
            key={tab.screen}
            onPress={() => navigation.navigate(tab.screen)}
            style={[
              styles.item,
              selected && { backgroundColor: colors.soft },
            ]}
          >
            <Text style={[styles.icon, { color: selected ? colors.accent : colors.muted }]}>
              {tab.icon}
            </Text>
            <Text style={[styles.label, { color: selected ? colors.text : colors.muted }]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 22,
    height: 76,
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  item: {
    flex: 1,
    height: 58,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
    fontWeight: '900',
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    marginTop: 2,
  },
});