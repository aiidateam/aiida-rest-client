export interface JsonApiErrorObject {
  status?: string;
  title?: string;
  detail?: string;
}

export interface JsonApiDocument {
  errors?: JsonApiErrorObject[];
}
