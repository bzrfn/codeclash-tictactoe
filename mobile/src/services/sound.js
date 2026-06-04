import { Audio } from 'expo-av';

const soundFiles = {
  move: require('../../assets/audio/move.wav'),
  invalid: require('../../assets/audio/invalid.wav'),
  roundWin: require('../../assets/audio/round_win.wav'),
  draw: require('../../assets/audio/draw.wav'),
  matchWin: require('../../assets/audio/match_win.wav'),
  matchLoss: require('../../assets/audio/match_loss.wav'),
  tap: require('../../assets/audio/tap.wav'),
};

export async function playSound(name, settings) {
  try {
    if (!settings?.sound) return;

    const file = soundFiles[name];
    if (!file) return;

    const { sound } = await Audio.Sound.createAsync(file, {
      volume: Math.max(0, Math.min(1, (settings.volume || 70) / 100)),
      shouldPlay: true,
    });

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.log('Sound error:', error);
  }
}