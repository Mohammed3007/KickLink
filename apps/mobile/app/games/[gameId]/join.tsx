import { useLocalSearchParams } from 'expo-router';
import { JoinReviewScreen } from '../../../src/screens/TabScreens';

export default function JoinReviewRoute() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  return <JoinReviewScreen gameId={gameId} />;
}
