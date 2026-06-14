import { useLocalSearchParams } from 'expo-router';
import { SuccessScreen } from '../../../src/screens/TabScreens';

export default function SuccessRoute() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  return <SuccessScreen gameId={gameId} />;
}
