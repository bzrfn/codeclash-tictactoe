import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

import { useGame } from '../context/GameContext';
import { palette } from '../styles/theme';
import PixelButton from '../components/PixelButton';
import GlassTabBar from '../components/GlassTabBar';

export default function FriendsScreen({ navigation }) {
  const { theme, friends } = useGame();
  const colors = palette[theme];

  const sortedFriends = [...friends].sort((a, b) => b.wins - a.wins);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.page}
      >
        <Text style={[styles.title, { color: colors.accent }]}>Amigos</Text>
        <Text style={[styles.sub, { color: colors.muted }]}>
          Aquí aparecerán los jugadores que agregues después de conectar una partida por código.
        </Text>

        <View style={[styles.card, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Ranking local</Text>
          <Text style={[styles.cardSub, { color: colors.muted }]}>
            No se agregan amigos manualmente. Primero juega con alguien por código y después podrás guardarlo como amigo.
          </Text>
        </View>

        {sortedFriends.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.soft, borderColor: colors.glassBorder }]}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Sin amigos registrados</Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Crea una partida por código, juega con otro usuario y al finalizar podrás agregarlo.
            </Text>
          </View>
        ) : (
          sortedFriends.map((friend, index) => {
            const winRate = friend.played > 0 ? Math.round((friend.wins / friend.played) * 100) : 0;

            return (
              <View
                key={friend.id}
                style={[styles.rankCard, { backgroundColor: colors.card, borderColor: colors.grid }]}
              >
                <Text style={[styles.rank, { color: colors.accent }]}>#{index + 1}</Text>

                <View style={styles.rankInfo}>
                  <Text style={[styles.friendName, { color: colors.text }]}>{friend.name}</Text>
                  <Text style={[styles.stats, { color: colors.muted }]}>
                    Jugadas {friend.played} · Ganadas {friend.wins} · Perdidas {friend.losses} · Empates {friend.draws}
                  </Text>
                </View>

                <View style={[styles.rateBadge, { backgroundColor: colors.soft, borderColor: colors.glassBorder }]}>
                  <Text style={[styles.rate, { color: colors.accent }]}>{winRate}%</Text>
                </View>
              </View>
            );
          })
        )}

        <PixelButton title="IR A MULTIJUGADOR" onPress={() => navigation.navigate('Home')} colors={colors} />
      </ScrollView>

      <GlassTabBar navigation={navigation} active="Friends" colors={colors} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  page: {
    padding: 22,
    paddingTop: 80,
    paddingBottom: 118,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
  },
  sub: {
    marginTop: 8,
    lineHeight: 22,
    fontSize: 15,
  },
  card: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 18,
    marginVertical: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '900',
  },
  cardSub: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  empty: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 20,
    marginVertical: 10,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  rankCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 14,
    marginVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rank: {
    fontSize: 28,
    fontWeight: '900',
    width: 54,
  },
  rankInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 19,
    fontWeight: '900',
  },
  stats: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '700',
    lineHeight: 17,
  },
  rateBadge: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  rate: {
    fontWeight: '900',
  },
});