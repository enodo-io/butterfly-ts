// Post body types
export interface TextNode {
  type: 'text';
  value: string | StyledNode[];
}

export interface StrongNode {
  type: 'strong';
  value: string | StyledNode[];
}

export interface EmphasisNode {
  type: 'emphasis';
  value: string | StyledNode[];
}

export interface UnderlineNode {
  type: 'underline';
  value: string | StyledNode[];
}

export interface StrikethroughNode {
  type: 'strikethrough';
  value: string | StyledNode[];
}

export interface SubscriptNode {
  type: 'subscript';
  value: string | StyledNode[];
}

export interface SuperscriptNode {
  type: 'superscript';
  value: string | StyledNode[];
}

export interface CodeNode {
  type: 'code';
  value: string | StyledNode[];
}

// Union type for backward compatibility
export type BaseStyledNode =
  | TextNode
  | StrongNode
  | EmphasisNode
  | UnderlineNode
  | StrikethroughNode
  | SubscriptNode
  | SuperscriptNode
  | CodeNode;

export interface LinkNode {
  type: 'link';
  href: string;
  title?: string;
  sponsored?: string;
  value: string | StyledNode[];
}

export interface QuoteNode {
  type: 'quote';
  cite?: string;
  value: string | StyledNode[];
}

export interface AbbreviationNode {
  type: 'abbreviation';
  title: string;
  value: string | StyledNode[];
}

export interface BreakNode {
  type: 'break';
}

export type StyledNode =
  | TextNode
  | StrongNode
  | EmphasisNode
  | UnderlineNode
  | StrikethroughNode
  | SubscriptNode
  | SuperscriptNode
  | CodeNode
  | LinkNode
  | QuoteNode
  | AbbreviationNode
  | BreakNode;
export type BodyInlineNode = StyledNode;

export interface MediaData {
  mediaId: number;
  credits: string;
  description: string;
  caption: string;
}

export interface OEmbed {
  type: string;
  version: string;
  provider_name: string;
  provider_url: string;
  width: number;
  height: number | null;
  html: string;
  title?: string;
  author_name?: string;
  author_url?: string;
  thumbnail_url?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
  thumbnail_url_with_play_button?: string;
  url?: string;
  description?: string;
  duration?: number;
  upload_date?: string;
  video_id?: number;
  uri?: string;
  is_plus?: string;
  account_type?: string;
  embed_product_id?: string;
  embed_type?: string;
  author_unique_id?: string;
  cache_age?: string;
}

export interface IframeData {
  width: number;
  height: number;
  src: string;
  title: string;
}

export interface QuoteBlockData {
  value: string | BodyInlineNode[];
  source: {
    url?: string;
    title?: string;
    author?: string;
  };
}

export interface FAQData {
  question: string;
  value: string | BodyInlineNode[];
}

export interface CodeData {
  language: string;
  value: string;
}

// Block types
export interface Title2 {
  type: 'title2';
  data: string;
}

export interface Title3 {
  type: 'title3';
  data: string;
}

export interface Title4 {
  type: 'title4';
  data: string;
}

export interface Title5 {
  type: 'title5';
  data: string;
}

export interface Title6 {
  type: 'title6';
  data: string;
}

export type Title = Title2 | Title3 | Title4 | Title5 | Title6;

export interface Image {
  type: 'image';
  data: MediaData;
}

export interface Video {
  type: 'video';
  data: MediaData;
}

export interface Audio {
  type: 'audio';
  data: MediaData;
}

export type Media = Image | Video | Audio;

export interface Gallery {
  type: 'gallery';
  data: MediaData[];
}

export interface Youtube {
  type: 'youtube';
  data: {
    url: string;
    oembed: OEmbed;
  };
}

export interface Dailymotion {
  type: 'dailymotion';
  data: {
    url: string;
    oembed: OEmbed;
  };
}

export interface Vimeo {
  type: 'vimeo';
  data: {
    url: string;
    oembed: OEmbed & {
      duration?: number;
      upload_date?: string;
      video_id?: number;
      uri?: string;
      is_plus?: string;
      account_type?: string;
      thumbnail_url_with_play_button?: string;
    };
  };
}

export interface X {
  type: 'x';
  data: {
    url: string;
    oembed: OEmbed & {
      cache_age?: string;
    };
  };
}

export interface Tiktok {
  type: 'tiktok';
  data: {
    url: string;
    oembed: OEmbed & {
      embed_product_id?: string;
      embed_type?: string;
      author_unique_id?: string;
    };
  };
}

export interface Facebook {
  type: 'facebook';
  data: {
    url: string;
    oembed: OEmbed;
  };
}

export interface Instagram {
  type: 'instagram';
  data: {
    url: string;
    oembed: OEmbed;
  };
}

export interface Iframe {
  type: 'iframe';
  data: IframeData;
}

export interface Quote {
  type: 'quote';
  data: QuoteBlockData;
}

export interface FAQ {
  type: 'faq';
  data: FAQData;
}

export interface BulletList {
  type: 'bulletList';
  data: (string | BodyInlineNode[])[][];
}

export interface OrderedList {
  type: 'orderedList';
  data: (string | BodyInlineNode[])[][];
}

export interface ReversedList {
  type: 'reversedList';
  data: (string | BodyInlineNode[])[][];
}

export type List = BulletList | OrderedList | ReversedList;

export interface Paragraph {
  type: 'paragraph';
  data: string | BodyInlineNode[];
}

export interface Pagebreak {
  type: 'pagebreak';
}

export interface Markdown {
  type: 'markdown';
  data: string;
}

export interface Code {
  type: 'code';
  data: CodeData;
}

export interface Embed {
  type: 'embed';
  data: string;
}

export type BodyData =
  | Title
  | Title2
  | Title3
  | Title4
  | Title5
  | Title6
  | Paragraph
  | Quote
  | List
  | BulletList
  | OrderedList
  | ReversedList
  | Image
  | Video
  | Audio
  | Gallery
  | Iframe
  | Youtube
  | Dailymotion
  | Vimeo
  | X
  | Tiktok
  | Facebook
  | Instagram
  | FAQ
  | Pagebreak
  | Markdown
  | Code
  | Embed;
