export type JsonApiMeta = Record<string, unknown>;

export interface JsonApiLinkObject {
  href: string;
  rel?: string;
  describedby?: JsonApiLink;
  title?: string;
  type?: string;
  hreflang?: string | string[];
  meta?: JsonApiMeta;
}

export type JsonApiLink = string | JsonApiLinkObject;

export interface JsonApiImplementation {
  version: string;
  ext?: string[];
  profile?: string[];
  meta?: JsonApiMeta;
}

export interface JsonApiBaseTopLevelLinks {
  self?: JsonApiLink;
  [key: string]: JsonApiLink | undefined;
}

export interface JsonApiTopLevelLinks extends JsonApiBaseTopLevelLinks {
  first?: JsonApiLink;
  prev?: JsonApiLink;
  next?: JsonApiLink;
  last?: JsonApiLink;
  related?: JsonApiLink;
  describedby?: JsonApiLink;
}

export interface JsonApiErrorLinks {
  about?: JsonApiLink;
  type?: JsonApiLink;
}

export interface JsonApiErrorSource {
  pointer?: string;
  parameter?: string;
  header?: string;
}

export interface JsonApiErrorObject {
  id?: string;
  links?: JsonApiErrorLinks;
  status?: string;
  code?: string;
  title?: string;
  detail?: string;
  source?: JsonApiErrorSource;
  meta?: JsonApiMeta;
}

export interface JsonApiBaseDocument {
  jsonapi: JsonApiImplementation;
  meta?: JsonApiMeta;
}

export interface JsonApiDocument extends JsonApiBaseDocument {
  links?: JsonApiBaseTopLevelLinks;
  errors?: JsonApiErrorObject[];
}

export interface JsonApiResourceIdentifier {
  id: string;
  type: string;
}

export interface JsonApiRelationshipLinks {
  self?: JsonApiLink;
  related?: JsonApiLink;
}

export interface JsonApiRelationship {
  links?: JsonApiRelationshipLinks;
  meta?: JsonApiMeta;
  data?: JsonApiResourceIdentifier | JsonApiResourceIdentifier[] | null;
}

export type JsonApiRelationships = Record<string, JsonApiRelationship>;

export interface JsonApiResourceLinks {
  self: JsonApiLink;
}

export type JsonApiAttributes = Record<string, unknown>;

export interface JsonApiResource<
  TAttributes extends JsonApiAttributes = JsonApiAttributes,
> extends JsonApiResourceIdentifier {
  links?: JsonApiResourceLinks;
  meta?: JsonApiMeta;
  attributes?: TAttributes;
  relationships?: JsonApiRelationships;
}

export interface JsonApiResourceDocument<
  TResource extends JsonApiResource = JsonApiResource,
> extends JsonApiBaseDocument {
  links?: JsonApiTopLevelLinks;
  data: TResource;
  included?: JsonApiResource[];
}

export interface JsonApiCollectionDocument<
  TResource extends JsonApiResource = JsonApiResource,
> extends JsonApiBaseDocument {
  links?: JsonApiTopLevelLinks;
  data: TResource[];
  included?: JsonApiResource[];
}

export interface JsonApiErrorDocument extends JsonApiBaseDocument {
  links?: JsonApiBaseTopLevelLinks;
  errors: JsonApiErrorObject[];
}
