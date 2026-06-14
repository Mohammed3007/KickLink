import { useLocalSearchParams } from 'expo-router';
import { RegistrationDetailsScreen } from '../../../src/screens/TabScreens';

export default function RegistrationRoute() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  return <RegistrationDetailsScreen gameId={gameId} />;
}
