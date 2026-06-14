import { describe, expect, it } from 'vitest';
import { organizerPermissionSchema } from '@kicklink/shared';

describe('organization permissions', () => {
  it('accepts approved organization-scoped permissions', () => {
    expect(organizerPermissionSchema.parse('manage_members')).toBe('manage_members');
    expect(organizerPermissionSchema.parse('manage_attendance')).toBe('manage_attendance');
    expect(organizerPermissionSchema.parse('view_finances')).toBe('view_finances');
  });

  it('rejects obsolete global-style permissions', () => {
    expect(() => organizerPermissionSchema.parse('manage_players')).toThrow();
    expect(() => organizerPermissionSchema.parse('view_financial_reports')).toThrow();
  });
});
