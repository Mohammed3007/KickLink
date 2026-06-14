import type { OrganizerPermission } from '@kicklink/shared';
import { createUserServerSupabaseClient } from '../supabase/server';

export async function hasOrganizationPermission(
  organizationId: string,
  permission: OrganizerPermission,
  userId: string,
) {
  const supabase = await createUserServerSupabaseClient();
  const { data, error } = await supabase.rpc('has_organization_permission', {
    target_org_id: organizationId,
    required_permission: permission,
    target_user_id: userId,
  });

  if (error) {
    return false;
  }

  return data === true;
}
