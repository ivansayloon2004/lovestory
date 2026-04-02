export type ThemeMode = "light" | "dark" | "system";
export type SpecialMomentType = "anniversary" | "birthday" | "trip" | "important_event" | null;

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  relationship_id: string | null;
  theme_mode: ThemeMode;
  created_at: string;
}

export interface Relationship {
  id: string;
  invite_code: string;
  started_on: string | null;
  status: "open" | "paired";
  created_at: string;
}

export interface MemoryPhoto {
  id: string;
  storage_path: string;
  caption: string | null;
  sort_order: number;
  signed_url?: string;
}

export interface MemoryRecord {
  id: string;
  relationship_id: string;
  title: string;
  memory_date: string;
  mood: string;
  story_html: string;
  tags: string[];
  location_label: string | null;
  is_special_moment: boolean;
  special_type: SpecialMomentType;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  memory_photos?: MemoryPhoto[];
}

export interface LetterRecord {
  id: string;
  relationship_id: string;
  sender_id: string;
  recipient_id: string;
  title: string;
  body: string;
  created_at: string;
  opened_at: string | null;
}

export interface ReminderPreference {
  relationship_id: string;
  weekly_memory_prompt: boolean;
  weekly_memory_day: number;
  weekly_memory_hour: number;
  anniversary_reminders: boolean;
  anniversary_lead_days: number;
  email_enabled: boolean;
  push_enabled: boolean;
}

export interface ViewerContext {
  userId: string;
  email: string;
  profile: Profile;
  relationship: Relationship | null;
  partner: Profile | null;
  reminders: ReminderPreference | null;
}

export interface DashboardSnapshot {
  daysTogether: number | null;
  totalMemories: number;
  specialMoments: number;
  recentMemories: MemoryRecord[];
  recentLetters: LetterRecord[];
}
