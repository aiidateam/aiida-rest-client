import type { NodeIdentifier, NodeListOptions } from "./types/nodes";
import type { EntitySchemaOptions } from "./types/entities";

export function collectionQuery(options: NodeListOptions = {}): string {
  const params = new URLSearchParams();
  if (options.filters) params.set("filters", JSON.stringify(options.filters));
  if (options.orderBy) params.set("order_by", JSON.stringify(options.orderBy));
  if (options.page !== undefined) params.set("page", String(options.page));
  if (options.pageSize !== undefined)
    params.set("page_size", String(options.pageSize));
  if (options.offset !== undefined)
    params.set("offset", String(options.offset));
  if (options.include?.length) params.set("include", options.include.join(","));
  return params.toString();
}

export function collectionPath(
  path: string,
  options?: NodeListOptions,
): string {
  const query = collectionQuery(options);
  return query ? `${path}?${query}` : path;
}

export function includeQuery(include?: string[]): string {
  if (!include?.length) return "";
  return `?${new URLSearchParams({ include: include.join(",") })}`;
}

export function resourcePath(collection: string, identifier: NodeIdentifier) {
  return `/${collection}/${encodeURIComponent(String(identifier))}`;
}

export function schemaPath(
  collection: string,
  options?: EntitySchemaOptions,
): string {
  const params = new URLSearchParams();
  if (options?.which) params.set("which", options.which);
  const query = params.toString();
  return `/${collection}/schema${query ? `?${query}` : ""}`;
}
