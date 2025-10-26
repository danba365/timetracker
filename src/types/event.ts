export type EventType = 'birthday' | 'anniversary' | 'custom';

export interface Event {
  id: string;
  name: string;
  event_type: EventType;
  icon?: string;
  date: string; // Format: DD-MM (e.g., "15-01" for 15th January)
  year?: number; // Optional: original year of the event
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEventInput {
  name: string;
  event_type: EventType;
  icon?: string | null;
  date: string; // Format: DD-MM
  year?: number | null;
  notes?: string | null;
}

export interface UpdateEventInput extends Partial<CreateEventInput> {
  id: string;
}

