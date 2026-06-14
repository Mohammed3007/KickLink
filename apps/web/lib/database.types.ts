export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          archived_at: string | null
          author_id: string
          body: string
          created_at: string
          created_by: string | null
          delivery: Json
          event_id: string | null
          id: string
          organization_id: string
          title: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          author_id: string
          body: string
          created_at?: string
          created_by?: string | null
          delivery?: Json
          event_id?: string | null
          id?: string
          organization_id: string
          title: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          author_id?: string
          body?: string
          created_at?: string
          created_by?: string | null
          delivery?: Json
          event_id?: string | null
          id?: string
          organization_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          archived_at: string | null
          correction_reason: string | null
          created_at: string
          event_id: string
          id: string
          recorded_at: string
          recorded_by: string | null
          registration_id: string | null
          state: Database["public"]["Enums"]["attendance_state"]
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          correction_reason?: string | null
          created_at?: string
          event_id: string
          id?: string
          recorded_at?: string
          recorded_by?: string | null
          registration_id?: string | null
          state: Database["public"]["Enums"]["attendance_state"]
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          correction_reason?: string | null
          created_at?: string
          event_id?: string
          id?: string
          recorded_at?: string
          recorded_by?: string | null
          registration_id?: string | null
          state?: Database["public"]["Enums"]["attendance_state"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log_entries: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          id: string
          metadata: Json
          organization_id: string | null
          reason: string | null
          request_id: string | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          organization_id?: string | null
          reason?: string | null
          request_id?: string | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          organization_id?: string | null
          reason?: string | null
          request_id?: string | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_entries_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      device_push_tokens: {
        Row: {
          created_at: string
          environment: string
          id: string
          platform: string
          revoked_at: string | null
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          environment?: string
          id?: string
          platform: string
          revoked_at?: string | null
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          environment?: string
          id?: string
          platform?: string
          revoked_at?: string | null
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          allow_guests: boolean
          archived_at: string | null
          arrive_at: string
          capacity: number
          created_at: string
          created_by: string | null
          currency: string
          duration_min: number
          format: string
          id: string
          max_guests: number
          organization_id: string
          payment_model: string
          price_gross: number
          public_code: string
          recurring_series_id: string | null
          refund_policy: Json
          series_occurrence_at: string | null
          skill_level: string
          start_at: string
          status: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at: string
          venue: Json
          venue_time_zone: string
          waitlist_capacity: number
        }
        Insert: {
          allow_guests?: boolean
          archived_at?: string | null
          arrive_at: string
          capacity: number
          created_at?: string
          created_by?: string | null
          currency?: string
          duration_min: number
          format: string
          id?: string
          max_guests?: number
          organization_id: string
          payment_model?: string
          price_gross?: number
          public_code: string
          recurring_series_id?: string | null
          refund_policy?: Json
          series_occurrence_at?: string | null
          skill_level: string
          start_at: string
          status?: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at?: string
          venue: Json
          venue_time_zone: string
          waitlist_capacity?: number
        }
        Update: {
          allow_guests?: boolean
          archived_at?: string | null
          arrive_at?: string
          capacity?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          duration_min?: number
          format?: string
          id?: string
          max_guests?: number
          organization_id?: string
          payment_model?: string
          price_gross?: number
          public_code?: string
          recurring_series_id?: string | null
          refund_policy?: Json
          series_occurrence_at?: string | null
          skill_level?: string
          start_at?: string
          status?: Database["public"]["Enums"]["event_status"]
          title?: string
          updated_at?: string
          venue?: Json
          venue_time_zone?: string
          waitlist_capacity?: number
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_recurring_series_id_fkey"
            columns: ["recurring_series_id"]
            isOneToOne: false
            referencedRelation: "recurring_event_series"
            referencedColumns: ["id"]
          },
        ]
      }
      idempotency_keys: {
        Row: {
          created_at: string
          expires_at: string
          key: string
          operation: string
          result: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          key: string
          operation: string
          result?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          key?: string
          operation?: string
          result?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "idempotency_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_records: {
        Row: {
          archived_at: string | null
          body: string
          created_at: string
          deep_link: string | null
          id: string
          idempotency_key: string | null
          kind: string
          read_at: string | null
          title: string
          unread: boolean
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          body: string
          created_at?: string
          deep_link?: string | null
          id?: string
          idempotency_key?: string | null
          kind: string
          read_at?: string | null
          title: string
          unread?: boolean
          user_id: string
        }
        Update: {
          archived_at?: string | null
          body?: string
          created_at?: string
          deep_link?: string | null
          id?: string
          idempotency_key?: string | null
          kind?: string
          read_at?: string | null
          title?: string
          unread?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invitations: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string | null
          expires_at: string
          id: string
          invited_email: string | null
          max_uses: number | null
          organization_id: string
          revoked_at: string | null
          role: string
          token_hash: string
          updated_at: string
          use_count: number
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          expires_at: string
          id?: string
          invited_email?: string | null
          max_uses?: number | null
          organization_id: string
          revoked_at?: string | null
          role: string
          token_hash: string
          updated_at?: string
          use_count?: number
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string
          id?: string
          invited_email?: string | null
          max_uses?: number | null
          organization_id?: string
          revoked_at?: string | null
          role?: string
          token_hash?: string
          updated_at?: string
          use_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string | null
          id: string
          organization_id: string
          status: Database["public"]["Enums"]["membership_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id: string
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id?: string
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_staff: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          organization_id: string
          revoked_at: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id: string
          revoked_at?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id?: string
          revoked_at?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_staff_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_staff_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_staff_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_staff_permissions: {
        Row: {
          created_at: string
          created_by: string | null
          organization_id: string
          permission: string
          revoked_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          organization_id: string
          permission: string
          revoked_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          organization_id?: string
          permission?: string
          revoked_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_staff_permissions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_staff_permissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_staff_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          archived_at: string | null
          blurb: string
          city: string
          cover_url: string | null
          created_at: string
          created_by: string | null
          handle: string
          id: string
          is_private: boolean
          logo_url: string | null
          name: string
          owner_user_id: string
          requires_approval: boolean
          status: Database["public"]["Enums"]["organization_status"]
          updated_at: string
          venue_default: string | null
          whatsapp_url: string | null
        }
        Insert: {
          archived_at?: string | null
          blurb?: string
          city: string
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          handle: string
          id?: string
          is_private?: boolean
          logo_url?: string | null
          name: string
          owner_user_id: string
          requires_approval?: boolean
          status?: Database["public"]["Enums"]["organization_status"]
          updated_at?: string
          venue_default?: string | null
          whatsapp_url?: string | null
        }
        Update: {
          archived_at?: string | null
          blurb?: string
          city?: string
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          handle?: string
          id?: string
          is_private?: boolean
          logo_url?: string | null
          name?: string
          owner_user_id?: string
          requires_approval?: boolean
          status?: Database["public"]["Enums"]["organization_status"]
          updated_at?: string
          venue_default?: string | null
          whatsapp_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizations_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizer_applications: {
        Row: {
          admin_note: string | null
          archived_at: string | null
          city: string
          collects_money: boolean
          created_at: string
          created_by: string | null
          decided_by: string | null
          decision_reason: string | null
          description: string
          display_name: string
          email: string
          expected_games: number
          expected_players: number
          id: string
          legal_name: string
          organization_name: string
          phone: string
          status: Database["public"]["Enums"]["organizer_application_status"]
          updated_at: string
          user_id: string
          verification_status: string
        }
        Insert: {
          admin_note?: string | null
          archived_at?: string | null
          city: string
          collects_money: boolean
          created_at?: string
          created_by?: string | null
          decided_by?: string | null
          decision_reason?: string | null
          description: string
          display_name: string
          email: string
          expected_games: number
          expected_players: number
          id?: string
          legal_name: string
          organization_name: string
          phone: string
          status?: Database["public"]["Enums"]["organizer_application_status"]
          updated_at?: string
          user_id: string
          verification_status?: string
        }
        Update: {
          admin_note?: string | null
          archived_at?: string | null
          city?: string
          collects_money?: boolean
          created_at?: string
          created_by?: string | null
          decided_by?: string | null
          decision_reason?: string | null
          description?: string
          display_name?: string
          email?: string
          expected_games?: number
          expected_players?: number
          id?: string
          legal_name?: string
          organization_name?: string
          phone?: string
          status?: Database["public"]["Enums"]["organizer_application_status"]
          updated_at?: string
          user_id?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizer_applications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizer_applications_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizer_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string
          event_id: string
          fee: number
          gross: number
          id: string
          idempotency_key: string
          method: string
          net: number
          organization_id: string
          provider_reference: string | null
          receipt_url: string | null
          registration_id: string
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency?: string
          event_id: string
          fee?: number
          gross: number
          id?: string
          idempotency_key: string
          method?: string
          net: number
          organization_id: string
          provider_reference?: string | null
          receipt_url?: string | null
          registration_id: string
          status: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string
          event_id?: string
          fee?: number
          gross?: number
          id?: string
          idempotency_key?: string
          method?: string
          net?: number
          organization_id?: string
          provider_reference?: string | null
          receipt_url?: string | null
          registration_id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_admin_permissions: {
        Row: {
          created_at: string
          created_by: string | null
          permission: string
          revoked_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          permission: string
          revoked_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          permission?: string
          revoked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_admin_permissions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_admin_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "platform_admins"
            referencedColumns: ["user_id"]
          },
        ]
      }
      platform_admins: {
        Row: {
          created_at: string
          created_by: string | null
          status: Database["public"]["Enums"]["platform_admin_status"]
          suspended_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          status?: Database["public"]["Enums"]["platform_admin_status"]
          suspended_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          status?: Database["public"]["Enums"]["platform_admin_status"]
          suspended_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_admins_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_admins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          archived_at: string | null
          city: string | null
          completed_at: string | null
          created_at: string
          display_name: string
          email: string
          id: string
          legal_name: string | null
          notification_preferences: Json
          phone: string | null
          photo_url: string | null
          position: string | null
          profile_completed: boolean
          skill_level: string | null
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          city?: string | null
          completed_at?: string | null
          created_at?: string
          display_name?: string
          email: string
          id: string
          legal_name?: string | null
          notification_preferences?: Json
          phone?: string | null
          photo_url?: string | null
          position?: string | null
          profile_completed?: boolean
          skill_level?: string | null
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          city?: string | null
          completed_at?: string | null
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          legal_name?: string | null
          notification_preferences?: Json
          phone?: string | null
          photo_url?: string | null
          position?: string | null
          profile_completed?: boolean
          skill_level?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      recurring_event_series: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string | null
          ends_at: string | null
          id: string
          organization_id: string
          recurrence_rule: string
          starts_at: string
          title: string
          updated_at: string
          venue_time_zone: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: string
          organization_id: string
          recurrence_rule: string
          starts_at: string
          title: string
          updated_at?: string
          venue_time_zone: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: string
          organization_id?: string
          recurrence_rule?: string
          starts_at?: string
          title?: string
          updated_at?: string
          venue_time_zone?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_event_series_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_event_series_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      refunds: {
        Row: {
          created_at: string
          currency: string
          decided_by: string | null
          decision_reason: string | null
          fee: number
          gross: number
          id: string
          idempotency_key: string | null
          net: number
          payment_id: string
          reason: string | null
          requested_by: string | null
          status: Database["public"]["Enums"]["refund_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          decided_by?: string | null
          decision_reason?: string | null
          fee?: number
          gross: number
          id?: string
          idempotency_key?: string | null
          net: number
          payment_id: string
          reason?: string | null
          requested_by?: string | null
          status?: Database["public"]["Enums"]["refund_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          decided_by?: string | null
          decision_reason?: string | null
          fee?: number
          gross?: number
          id?: string
          idempotency_key?: string | null
          net?: number
          payment_id?: string
          reason?: string | null
          requested_by?: string | null
          status?: Database["public"]["Enums"]["refund_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "refunds_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      registration_guests: {
        Row: {
          archived_at: string | null
          attendance_state:
            | Database["public"]["Enums"]["attendance_state"]
            | null
          created_at: string
          created_by: string | null
          display_name: string
          id: string
          registration_id: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          attendance_state?:
            | Database["public"]["Enums"]["attendance_state"]
            | null
          created_at?: string
          created_by?: string | null
          display_name: string
          id?: string
          registration_id: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          attendance_state?:
            | Database["public"]["Enums"]["attendance_state"]
            | null
          created_at?: string
          created_by?: string | null
          display_name?: string
          id?: string
          registration_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "registration_guests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registration_guests_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          amount_paid_gross: number | null
          archived_at: string | null
          created_at: string
          created_by: string | null
          currency: string
          event_id: string
          id: string
          idempotency_key: string
          payment_deadline_at: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          registration_status: Database["public"]["Enums"]["registration_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_paid_gross?: number | null
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          event_id: string
          id?: string
          idempotency_key: string
          payment_deadline_at?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          registration_status?: Database["public"]["Enums"]["registration_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_paid_gross?: number | null
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          event_id?: string
          id?: string
          idempotency_key?: string
          payment_deadline_at?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          registration_status?: Database["public"]["Enums"]["registration_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      spot_offers: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string | null
          event_id: string
          expires_at: string
          id: string
          idempotency_key: string | null
          status: Database["public"]["Enums"]["spot_offer_status"]
          updated_at: string
          user_id: string
          waitlist_entry_id: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          event_id: string
          expires_at: string
          id?: string
          idempotency_key?: string | null
          status?: Database["public"]["Enums"]["spot_offer_status"]
          updated_at?: string
          user_id: string
          waitlist_entry_id: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          event_id?: string
          expires_at?: string
          id?: string
          idempotency_key?: string | null
          status?: Database["public"]["Enums"]["spot_offer_status"]
          updated_at?: string
          user_id?: string
          waitlist_entry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spot_offers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spot_offers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spot_offers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spot_offers_waitlist_entry_id_fkey"
            columns: ["waitlist_entry_id"]
            isOneToOne: false
            referencedRelation: "waitlist_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      transfer_requests: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string | null
          deadline_at: string
          event_id: string
          from_user_id: string
          id: string
          idempotency_key: string | null
          registration_id: string
          status: Database["public"]["Enums"]["transfer_status"]
          to_user_id: string | null
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          deadline_at: string
          event_id: string
          from_user_id: string
          id?: string
          idempotency_key?: string | null
          registration_id: string
          status?: Database["public"]["Enums"]["transfer_status"]
          to_user_id?: string | null
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          deadline_at?: string
          event_id?: string
          from_user_id?: string
          id?: string
          idempotency_key?: string | null
          registration_id?: string
          status?: Database["public"]["Enums"]["transfer_status"]
          to_user_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfer_requests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_requests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_requests_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_requests_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_requests_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_reports: {
        Row: {
          archived_at: string | null
          created_at: string
          decision_reason: string | null
          details: string | null
          event_id: string | null
          id: string
          organization_id: string | null
          reason: string
          reported_user_id: string | null
          reporter_id: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["report_status"]
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          decision_reason?: string | null
          details?: string | null
          event_id?: string | null
          id?: string
          organization_id?: string | null
          reason: string
          reported_user_id?: string | null
          reporter_id?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          decision_reason?: string | null
          details?: string | null
          event_id?: string | null
          id?: string
          organization_id?: string | null
          reason?: string
          reported_user_id?: string | null
          reporter_id?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_reports_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist_entries: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string | null
          event_id: string
          id: string
          idempotency_key: string | null
          position: number
          status: Database["public"]["Enums"]["waitlist_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          event_id: string
          id?: string
          idempotency_key?: string | null
          position: number
          status?: Database["public"]["Enums"]["waitlist_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          event_id?: string
          id?: string
          idempotency_key?: string | null
          position?: number
          status?: Database["public"]["Enums"]["waitlist_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_entries_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_organization_permission: {
        Args: {
          required_permission: string
          target_org_id: string
          target_user_id?: string
        }
        Returns: boolean
      }
      has_platform_permission: {
        Args: { required_permission: string; target_user_id?: string }
        Returns: boolean
      }
      is_organization_member: {
        Args: { target_org_id: string; target_user_id?: string }
        Returns: boolean
      }
      is_organization_owner: {
        Args: { target_org_id: string; target_user_id?: string }
        Returns: boolean
      }
      is_platform_admin: { Args: { target_user_id?: string }; Returns: boolean }
    }
    Enums: {
      attendance_state: "present" | "late" | "no_show" | "excused"
      event_status:
        | "draft"
        | "published"
        | "almost_full"
        | "full"
        | "registration_closed"
        | "cancelled"
        | "completed"
      membership_status: "pending" | "active" | "removed" | "suspended"
      organization_status: "draft" | "active" | "suspended" | "archived"
      organizer_application_status:
        | "new"
        | "under_review"
        | "verification_pending"
        | "more_info_requested"
        | "approved"
        | "rejected"
        | "suspended"
      payment_status:
        | "not_required"
        | "unpaid"
        | "payment_due"
        | "processing"
        | "paid"
        | "failed"
        | "partially_refunded"
        | "refunded"
        | "disputed"
      platform_admin_status: "active" | "suspended"
      recurrence_edit_scope:
        | "one_occurrence"
        | "this_and_following"
        | "entire_series"
      refund_status:
        | "not_requested"
        | "requested"
        | "under_review"
        | "approved"
        | "rejected"
        | "processing"
        | "completed"
        | "failed"
      registration_status:
        | "pending"
        | "provisional"
        | "confirmed"
        | "waitlisted"
        | "spot_offered"
        | "transfer_pending"
        | "cancelled"
        | "attended"
        | "no_show"
      report_status: "new" | "under_review" | "resolved" | "dismissed"
      spot_offer_status:
        | "offered"
        | "accepted"
        | "declined"
        | "expired"
        | "cancelled"
      transfer_status:
        | "transfer_pending"
        | "approval_pending"
        | "replacement_pending"
        | "complete"
        | "failed"
        | "expired"
        | "cancelled"
      waitlist_status:
        | "waitlisted"
        | "spot_offered"
        | "offer_accepted"
        | "offer_declined"
        | "offer_expired"
        | "removed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      attendance_state: ["present", "late", "no_show", "excused"],
      event_status: [
        "draft",
        "published",
        "almost_full",
        "full",
        "registration_closed",
        "cancelled",
        "completed",
      ],
      membership_status: ["pending", "active", "removed", "suspended"],
      organization_status: ["draft", "active", "suspended", "archived"],
      organizer_application_status: [
        "new",
        "under_review",
        "verification_pending",
        "more_info_requested",
        "approved",
        "rejected",
        "suspended",
      ],
      payment_status: [
        "not_required",
        "unpaid",
        "payment_due",
        "processing",
        "paid",
        "failed",
        "partially_refunded",
        "refunded",
        "disputed",
      ],
      platform_admin_status: ["active", "suspended"],
      recurrence_edit_scope: [
        "one_occurrence",
        "this_and_following",
        "entire_series",
      ],
      refund_status: [
        "not_requested",
        "requested",
        "under_review",
        "approved",
        "rejected",
        "processing",
        "completed",
        "failed",
      ],
      registration_status: [
        "pending",
        "provisional",
        "confirmed",
        "waitlisted",
        "spot_offered",
        "transfer_pending",
        "cancelled",
        "attended",
        "no_show",
      ],
      report_status: ["new", "under_review", "resolved", "dismissed"],
      spot_offer_status: [
        "offered",
        "accepted",
        "declined",
        "expired",
        "cancelled",
      ],
      transfer_status: [
        "transfer_pending",
        "approval_pending",
        "replacement_pending",
        "complete",
        "failed",
        "expired",
        "cancelled",
      ],
      waitlist_status: [
        "waitlisted",
        "spot_offered",
        "offer_accepted",
        "offer_declined",
        "offer_expired",
        "removed",
      ],
    },
  },
} as const

