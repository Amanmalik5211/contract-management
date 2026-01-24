import type { Field } from "./field";

export interface Blueprint {
  id: string;
  name: string;
  description?: string;
  fields: Field[];
  createdAt: Date;
  updatedAt: Date;
}

