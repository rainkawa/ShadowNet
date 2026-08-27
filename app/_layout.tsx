import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GameProvider } from '../context/GameContext';

export default function RootLayout() {
  return (
    <GameProvider>
      <StatusBar
        style="light"
        backgroundColor="#05070D"
      />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: '#05070D',
          },
        }}
      />
    </GameProvider>
  );
}
