import type { BodyData } from './post.js';
import type { Related, IResource } from './types.js';

// Common types
export type CustomAttr = string | number | boolean | string[] | number[] | Related | Related[];

// =======================
// All Butterfly Resource Objects
// =======================

export type Property = IResource<
  number,
  'property',
  {
    title: string;
    description: string;
    /** BCP 47 locale of the content, e.g. `fr-FR` */
    locale: string;
    /** IANA timezone, e.g. `Europe/Paris` */
    timezone: string;
    /** Public URL of the website */
    hostname: string;
    /** Pattern of a post URL, e.g. `{slug}-{id}.html` */
    permalink: string;
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
    custom: Record<string, CustomAttr>;
    fingerprints: {
      /** Not returned by every media: use `default` unless you know it is there */
      source?: string;
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
    /** Reserved to signed-in readers: its body is only served to them */
    private: boolean;
    body?: BodyData[];
    /**
     * Estimated reading time in seconds, computed server-side from the body
     * and the property locale. Only present when the property's `reading-time`
     * plugin is enabled. Read-only.
     */
    readingTime?: number | null;
    /**
     * Comments shown under the post. Only present when the property's
     * `comments` plugin is enabled. Follows on the cache of the post: the
     * `meta.total` of the comments list is the exact number. Read-only.
     */
    commentsCount?: number;
    /**
     * Does the post take new comments? Only present when the property's
     * `comments` plugin is enabled. Read-only.
     */
    commentsOpen?: boolean;
  },
  {
    category: { data: Related<'category'> | null };
    thumbnail: { data: Related<'image'> | Related<'video'> | Related<'audio'> | null };
    authors: { data: Related<'author'>[] };
    terms: { data: Related<`term<${string}>`>[] };
  }
>;

/**
 * A comment of a reader under a post (`comments` plugin).
 *
 * Read with `GET /v1/posts/{id}/relationships/comments` (the threads of a
 * post, their first replies in `included`) and
 * `GET /v1/comments/{id}/relationships/replies`.
 *
 * `body` is plain text (no HTML, no markdown, line breaks kept): render it as
 * text. Replies have one level: `parent` is always the comment that started
 * the thread, `replyTo` the comment answered inside it.
 */
export type Comment = IResource<
  number,
  'comment',
  {
    /** Plain text. `null` once removed by its author. */
    body: string | null;
    authorName: string | null;
    /** A reader signed in on the site, a reader under a free name, or the newsroom */
    authorType: 'member' | 'guest' | 'staff' | null;
    /**
     * Tells the comments of a same member apart. Never the id of the reader
     * on the site. `null` for guests and the newsroom.
     */
    authorId: number | null;
    /** Removed by its author and kept above the replies of others: its other attributes are `null` */
    deleted: boolean;
    /** Comments that start a thread only: the replies shown under it */
    repliesCount?: number;
    createdAt: string;
    /** Set once the author edited the comment */
    editedAt: string | null;
    /**
     * Only in the answer to a write, for the author: a `pending` comment
     * awaits approval and is not in the lists yet.
     */
    status?: 'approved' | 'pending';
  },
  {
    parent: { data: Related<'comment'> | null };
    replyTo: { data: Related<'comment'> | null };
    /** Comments that start a thread only: the first replies, found in `included` */
    replies?: { data: Related<'comment'>[]; links?: { related: string } };
  }
>;

/** `meta` of the comments of a post (`GET /v1/posts/{id}/relationships/comments`) */
export interface CommentsMeta {
  /** Every comment shown under the post, replies included */
  total: number;
  /** Comments that start a thread */
  threads: number;
  /** Does the post take new comments? */
  open: boolean;
  /** Are replies open on the site? */
  replies: boolean;
  /** Who comments: readers signed in on the site, anyone under a free name, or both */
  identity: 'members' | 'guests' | 'both';
}

/** Reason a reader gives when reporting a comment (`POST /v1/comments/{id}/reports`) */
export type CommentReportReason = 'spam' | 'abuse' | 'illegal' | 'other';

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
