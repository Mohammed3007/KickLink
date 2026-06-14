import { useLocalSearchParams } from 'expo-router';
import { CheckoutScreen } from '../../../src/screens/TabScreens';

export default function CheckoutRoute() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  return <CheckoutScreen gameId={gameId} />;
}
