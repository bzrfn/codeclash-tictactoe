import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GameContext = createContext(null);

const STORAGE_KEYS = {
  theme: 'theme',
  profile: 'profile',
  settings: 'settings',
  friends: 'friends',
};

const createPlayerId = () => {
  return 'DEV-' + Math.random().toString(36).substring(2, 7).toUpperCase();
};

const DEFAULT_PROFILE = {
  name: 'Dev Player',
  avatar: '♙',
  playerId: createPlayerId(),
  stats: {
    played: 0,
    wins: 0,
    losses: 0,
    draws: 0,
  },
};

const DEFAULT_SETTINGS = {
  sound: true,
  volume: 70,
  vibration: true,
  effects: true,
};

const DEFAULT_FRIENDS = [];

function safeJsonParse(value, fallback) {
  try {
    if (!value) return fallback;
    return JSON.parse(value);
  } catch (error) {
    console.log('JSON parse error:', error);
    return fallback;
  }
}

function normalizeStats(stats) {
  return {
    played: Number(stats?.played || 0),
    wins: Number(stats?.wins || 0),
    losses: Number(stats?.losses || 0),
    draws: Number(stats?.draws || 0),
  };
}

function normalizeProfile(profile) {
  return {
    ...DEFAULT_PROFILE,
    ...(profile || {}),
    name: profile?.name || DEFAULT_PROFILE.name,
    avatar: profile?.avatar || DEFAULT_PROFILE.avatar,
    playerId: profile?.playerId || createPlayerId(),
    stats: normalizeStats(profile?.stats),
  };
}

function normalizeSettings(settings) {
  return {
    ...DEFAULT_SETTINGS,
    ...(settings || {}),
    volume: Number(settings?.volume ?? DEFAULT_SETTINGS.volume),
    sound: typeof settings?.sound === 'boolean' ? settings.sound : DEFAULT_SETTINGS.sound,
    vibration:
      typeof settings?.vibration === 'boolean'
        ? settings.vibration
        : DEFAULT_SETTINGS.vibration,
    effects:
      typeof settings?.effects === 'boolean'
        ? settings.effects
        : DEFAULT_SETTINGS.effects,
  };
}

function normalizeFriend(friend) {
  return {
    id: friend?.id || 'FR-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    name: friend?.name || 'Jugador',
    avatar: friend?.avatar || '♟',
    playerId: friend?.playerId || friend?.id || null,
    socketId: friend?.socketId || null,
    lastResult: friend?.lastResult || null,
    lastPlayedAt: friend?.lastPlayedAt || null,
    played: Number(friend?.played || 0),
    wins: Number(friend?.wins || 0),
    losses: Number(friend?.losses || 0),
    draws: Number(friend?.draws || 0),
  };
}

function normalizeFriends(friends) {
  if (!Array.isArray(friends)) return [];
  return friends.map(normalizeFriend);
}

function getFriendKey(friend) {
  return String(
    friend?.playerId ||
      friend?.socketId ||
      friend?.id ||
      friend?.name ||
      ''
  )
    .trim()
    .toLowerCase();
}

function getResultCounters(result) {
  return {
    wins: result === 'win' ? 1 : 0,
    losses: result === 'loss' ? 1 : 0,
    draws: result === 'draw' ? 1 : 0,
  };
}

export function GameProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [friends, setFriends] = useState(DEFAULT_FRIENDS);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const persistProfile = async (updatedProfile) => {
    setProfile(updatedProfile);
    await AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(updatedProfile));
  };

  const persistFriends = async (updatedFriends) => {
    setFriends(updatedFriends);
    await AsyncStorage.setItem(STORAGE_KEYS.friends, JSON.stringify(updatedFriends));
  };

  const loadData = async () => {
    try {
      const [storedTheme, storedProfile, storedSettings, storedFriends] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.theme),
          AsyncStorage.getItem(STORAGE_KEYS.profile),
          AsyncStorage.getItem(STORAGE_KEYS.settings),
          AsyncStorage.getItem(STORAGE_KEYS.friends),
        ]);

      if (storedTheme) {
        setTheme(storedTheme);
      }

      const parsedProfile = safeJsonParse(storedProfile, DEFAULT_PROFILE);
      const parsedSettings = safeJsonParse(storedSettings, DEFAULT_SETTINGS);
      const parsedFriends = safeJsonParse(storedFriends, DEFAULT_FRIENDS);

      setProfile(normalizeProfile(parsedProfile));
      setSettings(normalizeSettings(parsedSettings));
      setFriends(normalizeFriends(parsedFriends));
    } catch (error) {
      console.log('Error loading local game data:', error);
    } finally {
      setIsReady(true);
    }
  };

  const updateTheme = async (value) => {
    try {
      const nextTheme = value === 'light' ? 'light' : 'dark';
      setTheme(nextTheme);
      await AsyncStorage.setItem(STORAGE_KEYS.theme, nextTheme);

      return { ok: true, theme: nextTheme };
    } catch (error) {
      console.log('Error saving theme:', error);
      return { ok: false, message: 'No se pudo guardar el tema.' };
    }
  };

  const updateProfile = async (data) => {
    try {
      const updated = normalizeProfile({
        ...profile,
        ...(data || {}),
        stats: {
          ...(profile.stats || DEFAULT_PROFILE.stats),
          ...(data?.stats || {}),
        },
      });

      await persistProfile(updated);

      return { ok: true, profile: updated };
    } catch (error) {
      console.log('Error saving profile:', error);
      return { ok: false, message: 'No se pudo guardar el perfil.' };
    }
  };

  const updateSettings = async (data) => {
    try {
      const updated = normalizeSettings({
        ...settings,
        ...(data || {}),
      });

      setSettings(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(updated));

      return { ok: true, settings: updated };
    } catch (error) {
      console.log('Error saving settings:', error);
      return { ok: false, message: 'No se pudieron guardar los ajustes.' };
    }
  };

  const registerMatchResult = async (result) => {
    try {
      const currentStats = normalizeStats(profile.stats);
      const counters = getResultCounters(result);

      const updatedStats = {
        played: currentStats.played + 1,
        wins: currentStats.wins + counters.wins,
        losses: currentStats.losses + counters.losses,
        draws: currentStats.draws + counters.draws,
      };

      const updatedProfile = normalizeProfile({
        ...profile,
        stats: updatedStats,
      });

      await persistProfile(updatedProfile);

      return { ok: true, stats: updatedStats };
    } catch (error) {
      console.log('Error registering match result:', error);
      return { ok: false, message: 'No se pudo registrar el resultado.' };
    }
  };

  /*
    Uso correcto después de una partida por código:

    addFriendFromMatch({
      id: opponent.id,
      socketId: opponent.id,
      playerId: opponent.playerId,
      name: opponent.name,
      avatar: opponent.avatar,
      result: 'win' | 'loss' | 'draw'
    });

    Importante:
    - result debe ser desde la perspectiva del usuario local.
    - Si tú ganas, result = 'win'.
    - Si pierdes, result = 'loss'.
    - Si empatan, result = 'draw'.
  */
  const addFriendFromMatch = async ({
    id,
    socketId,
    playerId,
    name,
    avatar,
    result = 'draw',
  }) => {
    try {
      const cleanName = String(name || '').trim();

      if (!cleanName) {
        return {
          ok: false,
          message: 'No se encontró el nombre del jugador rival.',
        };
      }

      const friendIdentity = {
        id:
          playerId ||
          id ||
          socketId ||
          'FR-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        socketId: socketId || id || null,
        playerId: playerId || null,
        name: cleanName,
        avatar: avatar || '♟',
      };

      const counters = getResultCounters(result);
      const currentFriends = normalizeFriends(friends);

      const incomingKey = getFriendKey(friendIdentity);
      const incomingName = cleanName.toLowerCase();

      const existingIndex = currentFriends.findIndex((friend) => {
        const friendKey = getFriendKey(friend);
        const friendName = String(friend.name || '').trim().toLowerCase();

        return (
          friendKey === incomingKey ||
          friend.playerId === friendIdentity.playerId ||
          friend.socketId === friendIdentity.socketId ||
          friendName === incomingName
        );
      });

      let updatedFriends = [];

      if (existingIndex >= 0) {
        updatedFriends = currentFriends.map((friend, index) => {
          if (index !== existingIndex) return friend;

          return normalizeFriend({
            ...friend,
            ...friendIdentity,
            id: friend.id || friendIdentity.id,
            played: Number(friend.played || 0) + 1,
            wins: Number(friend.wins || 0) + counters.wins,
            losses: Number(friend.losses || 0) + counters.losses,
            draws: Number(friend.draws || 0) + counters.draws,
            lastResult: result,
            lastPlayedAt: new Date().toISOString(),
          });
        });

        await persistFriends(updatedFriends);

        return {
          ok: true,
          updated: true,
          friend: updatedFriends[existingIndex],
          friends: updatedFriends,
        };
      }

      const newFriend = normalizeFriend({
        ...friendIdentity,
        played: 1,
        wins: counters.wins,
        losses: counters.losses,
        draws: counters.draws,
        lastResult: result,
        lastPlayedAt: new Date().toISOString(),
      });

      updatedFriends = [...currentFriends, newFriend];

      await persistFriends(updatedFriends);

      return {
        ok: true,
        created: true,
        friend: newFriend,
        friends: updatedFriends,
      };
    } catch (error) {
      console.log('Error saving friend from match:', error);
      return {
        ok: false,
        message: 'No se pudo guardar el amigo.',
      };
    }
  };

  const registerOnlineMatch = async ({ opponent, result }) => {
    try {
      const profileResult = await registerMatchResult(result);

      const friendResult = await addFriendFromMatch({
        id: opponent?.id,
        socketId: opponent?.socketId || opponent?.id,
        playerId: opponent?.playerId,
        name: opponent?.name,
        avatar: opponent?.avatar,
        result,
      });

      return {
        ok: profileResult.ok && friendResult.ok,
        profileResult,
        friendResult,
      };
    } catch (error) {
      console.log('Error registering online match:', error);
      return {
        ok: false,
        message: 'No se pudo registrar la partida online.',
      };
    }
  };

  const resetStats = async () => {
    try {
      const updatedProfile = normalizeProfile({
        ...profile,
        stats: {
          played: 0,
          wins: 0,
          losses: 0,
          draws: 0,
        },
      });

      await persistProfile(updatedProfile);

      return { ok: true };
    } catch (error) {
      console.log('Error resetting stats:', error);
      return { ok: false, message: 'No se pudieron reiniciar las estadísticas.' };
    }
  };

  const clearFriends = async () => {
    try {
      await persistFriends([]);
      return { ok: true };
    } catch (error) {
      console.log('Error clearing friends:', error);
      return { ok: false, message: 'No se pudo limpiar la lista de amigos.' };
    }
  };

  const resetAllLocalData = async () => {
    try {
      const freshProfile = normalizeProfile({
        ...DEFAULT_PROFILE,
        playerId: createPlayerId(),
      });

      setTheme('dark');
      setProfile(freshProfile);
      setSettings(DEFAULT_SETTINGS);
      setFriends([]);

      await AsyncStorage.multiSet([
        [STORAGE_KEYS.theme, 'dark'],
        [STORAGE_KEYS.profile, JSON.stringify(freshProfile)],
        [STORAGE_KEYS.settings, JSON.stringify(DEFAULT_SETTINGS)],
        [STORAGE_KEYS.friends, JSON.stringify([])],
      ]);

      return { ok: true };
    } catch (error) {
      console.log('Error resetting local data:', error);
      return { ok: false, message: 'No se pudieron reiniciar los datos locales.' };
    }
  };

  const value = useMemo(
    () => ({
      isReady,
      theme,
      profile,
      settings,
      friends,

      updateTheme,
      updateProfile,
      updateSettings,

      registerMatchResult,
      addFriendFromMatch,
      registerOnlineMatch,

      resetStats,
      clearFriends,
      resetAllLocalData,
    }),
    [isReady, theme, profile, settings, friends]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export const useGame = () => useContext(GameContext);