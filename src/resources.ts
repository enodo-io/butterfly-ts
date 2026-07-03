import type { BodyData } from './post.js';
import type { Related, IResource } from './types.js';

// Common types
export type CustomAttr = string | number | boolean | string[] | number[] | Related | Related[];

// =======================
// All Butterfly Resource Objects
// =======================

export type Property = IResource<
  string,
  'property',
  {
    title: string;
    description: string;
    custom: Record<string, CustomAttr>;
  },
  Record<string, never>
>;

export type Author = IResource<
  string,
  'author',
  {
    name: string;
    resume: string | null;
    url: string | null;
    email: string | null;
    telephone: string | null;
    type: 'person' | 'organization';
    jobTitle: string | null;
    custom: Record<string, CustomAttr>;
  },
  {
    thumbnail: { data: Related<'image'> | Related<'video'> | Related<'audio'> | null };
  }
>;

export type Category = IResource<
  number,
  'category',
  {
    name: string;
    description: string | null;
    path: `/${string}`;
    slug: string;
    custom: Record<string, CustomAttr>;
  },
  {
    thumbnail: { data: Related<'image'> | Related<'video'> | Related<'audio'> | null };
    parentCategory: { data: Related<'category'> | null };
  }
>;

export interface IMedia<TType extends 'image' | 'video' | 'audio'> {
  id: number;
  type: TType;
  attributes: {
    name: string;
    description: string | null;
    credits: string;
    keywords: string[];
    mimetype: string;
    createdAt: string;
    fingerprints: {
      source: string;
      default: string;
      thumb: string;
      square: string;
      cover: string;
      stories: string;
    };
  } & (TType extends 'image' | 'video'
    ? { width: number; height: number }
    : Record<string, never>) &
    (TType extends 'video' | 'audio' ? { duration: number } : Record<string, never>);
  relationships: Record<string, unknown>;
}

export type Image = IMedia<'image'>;
export type Video = IMedia<'video'>;
export type Audio = IMedia<'audio'>;
export type Media = Image | Video | Audio;

export type Post = IResource<
  number,
  'post',
  {
    title: string;
    resume: string;
    canonical: string | null;
    hreflangs: Record<string, string>;
    slug: string;
    publishedAt: string;
    updatedAt: string;
    custom: Record<string, CustomAttr>;
    flags: string[];
    type: string;
    body?: BodyData[];
    /**
     * Estimated reading time in seconds, computed server-side from the body
     * and the property locale. Only present when the property's `reading-time`
     * plugin is enabled. Read-only.
     */
    readingTime?: number | null;
  },
  {
    category: { data: Related<'category'> | null };
    thumbnail: { data: Related<'image'> | Related<'video'> | Related<'audio'> | null };
    authors: { data: Related<'author'>[] };
    terms: { data: Related<`term<${string}>`>[] };
  }
>;

export interface Taxonomy {
  id: string;
  type: 'taxonomy';
}

export type Term = IResource<
  string,
  `term<${string}>`,
  {
    name: string;
    description: string | null;
    slug: string;
    custom: Record<string, CustomAttr>;
  },
  {
    thumbnail: { data: Related<'image'> | Related<'video'> | Related<'audio'> | null };
    category: { data: Related<'category'> | null };
    taxonomy: { data: Related<'taxonomy'> | null };
  }
>;

export type SyndicateAuthor = IResource<
  number,
  'author',
  {
    name: string;
  },
  Record<string, never>
>;

export type SyndicateTerm = IResource<
  number,
  'term',
  {
    name: string;
  },
  Record<string, never>
>;

export type SyndicatePost = IResource<
  number,
  'post',
  {
    title: string;
    slug: string;
    updatedAt: string;
    canonical: string;
    type: string;
    category: string | null;
  },
  Record<string, never>
>;

export type Syndicate = SyndicateAuthor | SyndicatePost | SyndicateTerm;

/**
 * Whitelisted CSS properties allowed on a custom style.
 * Anything outside this set is rejected by the API at write time.
 */
export interface CustomStyleCss {
  color?: string;
  backgroundColor?: string;
  fontWeight?: string | number;
  fontStyle?: string;
  fontFamily?: string;
  fontSize?: string;
  textTransform?: string;
  letterSpacing?: string;
  textDecoration?: string;
}

/**
 * A named, reusable visual style applicable to one or several block types.
 * Referenced from a block via its `style` field (= the `key`).
 */
export type CustomStyle = IResource<
  number,
  'customstyle',
  {
    name: string;
    key: string;
    description: string | null;
    targets: string[];
    css: CustomStyleCss;
  },
  Record<string, never>
>;

/**
 * A named template variant for a block (e.g. "info bulle"). Referenced from
 * a block via its `template` field (= the `key`). The site that renders the
 * post is free to interpret the template `key` however it wants — Butterfly
 * itself stores nothing about how the variant should look.
 */
export type BlockTemplate = IResource<
  number,
  'blocktemplate',
  {
    name: string;
    key: string;
    description: string | null;
    targets: string[];
  },
  Record<string, never>
>;
