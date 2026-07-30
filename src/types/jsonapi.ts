export interface JsonApiError {
  status?: string;
  title?: string;
  detail?: string;
}

export interface JsonApiDocument {
  errors?: JsonApiError[];
}
