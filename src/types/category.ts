export interface Category {
  id: string;
  name: string;
  color: string; // HEX color
  icon?: string; // emoji or icon name
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryInput {
  name: string;
  color: string;
  icon?: string;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string;
}

