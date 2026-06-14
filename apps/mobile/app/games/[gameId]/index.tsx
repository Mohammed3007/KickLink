import { useLocalSearchParams } from 'expo-router';
import { GameDetailScreen } from '../../../src/screens/TabScreens';

export default function GameDetailRoute() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  return <GameDetailScreen gameId={gameId} />;
}
