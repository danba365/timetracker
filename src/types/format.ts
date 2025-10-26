export interface Format {
  id: string;
  name: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFormatInput {
  name: string;
  icon?: string;
}

export interface UpdateFormatInput extends Partial<CreateFormatInput> {
  id: string;
}

