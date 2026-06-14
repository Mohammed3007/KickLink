import { useLocalSearchParams } from 'expo-router';
import { OrganizationDetailScreen } from '../../../src/screens/TabScreens';

export default function OrganizationDetailRoute() {
  const { orgId } = useLocalSearchParams<{ orgId: string }>();
  return <OrganizationDetailScreen orgId={orgId} />;
}
