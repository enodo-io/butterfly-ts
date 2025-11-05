import type * as PostBody from './post.js';
import type { Property, Author, Category, Media, Post, Taxonomy, Term } from './resources.js';

/**
 * Module namespace export for the post body types.
 * Allows importing as `PostBody.X` for convenience.
 *
 * The post body is represented as a typed, serializable rich-text AST with
 * inline and block nodes (text, formatting marks, links, embeds, quotes, code, etc.).
 * This export exposes the node types and payload data structures used to
 * compose and render content. Refer to `src/post.ts` for details.
 */
export { PostBody };

/**
 * A lightweight pointer to a related entity.
 * Use when you only need to reference another resource by its identity
 * without embedding full attributes/relationships.
 */
export type Related<T extends string = string> = {
  id: string | number;
  type: T;
};

/**
 * Generic resource envelope following a JSON:API-inspired shape.
 *
 * Type parameters:
 * - TId: identifier type (e.g. string | number)
 * - TType: resource type discriminator (e.g. "post", "author")
 * - TAttributes: domain attributes of the resource
 * - TRelationships: related entity links or identifiers
 */
export interface IResource<
  TId extends string | number,
  TType extends string,
  TAttributes,
  TRelationships,
> {
  id: TId;
  type: TType;
  attributes: TAttributes;
  relationships: TRelationships;
}

/**
 * Concrete resource models (domain entities) exposed by the API.
 * These include content and taxonomy objects with strongly-typed attributes
 * and relationships. See `src/resources.ts` for full definitions.
 */
export * from './resources.js';

/**
 * Standard API response envelope.
 *
 * - meta: optional pagination/info (e.g. total, size)
 * - data: primary payload (single resource, collection, or primitives)
 * - included: side-loaded resources to de-normalize relationships
 * - links: navigational links (e.g. next, prev, self)
 */
export interface ApiResponse<T> {
  meta?: { total?: number; size?: number };
  data: T;
  included: Resource[];
  links: {
    [key: string]: string | undefined;
  };
}

/**
 * Union of all concrete resource variants that can appear in `included`
 * or be used as `data` in responses.
 */
export type Resource = Property | Author | Category | Media | Post | Taxonomy | Term;

/**
 * Pagination parameters for query options.
 */
export interface QueryPage {
  size?: number;
  number?: number;
}

/**
 * Filter options for querying resources.
 * Supports dynamic taxonomy filters using the pattern `terms<$taxonomyId>`.
 */
export interface QueryFilter {
  id?: string | number;
  types?: string;
  query?: string;
  categories?: string | number;
  taxonomies?: string;
  authors?: string;
  before?: string | number;
  after?: string | number;
  [key: `terms<${string}>`]: string;
  flags?: string,
}

/**
 * Query parameters for API requests.
 */
export interface Query {
  /**
   * List of relationships to include, separated by commas.
   * If undefined, all relationships are included.
   */
  include?: string;
  /**
   * Field to sort by. Prefix with `-` to reverse order (DESC).
   * Example: `-id` for descending order by id.
   */
  sort?: string;
  /**
   * Pagination options.
   */
  page?: QueryPage;
  /**
   * Filter options for filtering data.
   */
  filter?: QueryFilter;
}
