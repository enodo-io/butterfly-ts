# butterfly-ts

A TypeScript SDK for the **Enodo Butterfly API**, with full type safety and error handling.

---

## Installation

```bash
npm install @enodo/butterfly-ts
```

## Usage

```ts
import type * as Butterfly from '@enodo/butterfly-ts';
import { Client, RedirectError, ApiError } from '@enodo/butterfly-ts';

const client = new Client({
  domain: 'https://xxx.pubbtf.eno.do',
  publicKey: 'PUBLIC_KEY',
});

try {
  // get some posts
  const posts = await client.get<Butterfly.Post[]>({ endpoint: 'posts', query: { page: 1 } });
  console.log(posts.data);

  // get next page
  if (posts.links?.next) {
    const nextPage = await client.get<Butterfly.Post[]>({ url: posts.links.next });
  }
} catch (err) {
  if (err instanceof RedirectError) {
    console.log(`Redirect to: ${err.location}`);
  } else if (err instanceof ApiError) {
    console.error('API error', err.status, err.details);
  }
}
```

## Category Utilities

The SDK provides a utility to get all children categories recursively:

```ts
import { getCategoryChildrenIds } from '@enodo/butterfly-ts';

// Get all children categories (including the parent)
const techCategory = categories.find((cat) => cat.id === 1);
const categoryIds = getCategoryChildrenIds(techCategory, categories);
// Result: [1, 2, 3, 4, 5] - Tech and all its subcategories

// Use with API calls
const posts = await client.get<Butterfly.Post[]>({
  endpoint: 'posts',
  query: {
    filter: {
      categories: categoryIds.join(','),
    },
  },
});
```

## Example with SvelteKit

You can inject SvelteKit's `fetch` from a `load()` function:

```ts
export async function load({ fetch }) {
  const client = new Client({
    domain: 'https://xxx.pubbtf.eno.do',
    publicKey: 'PUBLIC_KEY',
  });

  const posts = await client.get<Butterfly.Post[]>({
    endpoint: 'posts',
    fetch, // use SvelteKit's fetch
  });

  return { posts };
}
```

## Utilities

### Generate Media URLs with `getMediaUrl()`

Use the `getMediaUrl()` helper to generate URLs for media resources:

```ts
import { getMediaUrl } from '@enodo/butterfly-ts';

// Get an image URL with width
const imageUrl = getMediaUrl({
  domain: 'https://xxx.staticbtf.eno.do',
  media: myImage,
  format: 'cover',
  width: 1200,
  slug: 'my-image',
  ext: 'webp',
});
// https://xxx.staticbtf.eno.do/v1/123-cover-1200/abc123/my-image.webp

// Get an image URL without width (responsive)
const responsiveImageUrl = getMediaUrl({
  domain: 'https://xxx.staticbtf.eno.do',
  media: myImage,
  slug: 'my-image',
});
// https://xxx.staticbtf.eno.do/v1/123-default/abc123/my-image (uses 'default' format)

// Get a video URL with numeric width
const videoUrl = getMediaUrl({
  domain: 'https://xxx.staticbtf.eno.do',
  media: myVideo,
  format: 'source',
  width: 1920,
  slug: 'my-video',
  ext: 'mp4',
});

// Get a video URL with HD definition
const videoHdUrl = getMediaUrl({
  domain: 'https://xxx.staticbtf.eno.do',
  media: myVideo,
  format: 'default',
  width: 1920,
  definition: 'hd', // or 'sd' for standard definition
  slug: 'my-video',
  ext: 'mp4',
});

// Get an audio URL (requires definition for .mp3)
const audioUrl = getMediaUrl({
  domain: 'https://xxx.staticbtf.eno.do',
  media: myAudio,
  format: 'default',
  width: 0,
  slug: 'my-audio',
  ext: 'mp3',
  definition: 'sd',
});

// Get a video preview image (no definition needed)
const videoPreviewUrl = getMediaUrl({
  domain: 'https://xxx.staticbtf.eno.do',
  media: myVideo,
  format: 'cover',
  width: 1200,
  slug: 'my-video',
  ext: 'jpg',
});
```

**Available formats:**

- `'default'` - Default format (used if not specified)
- `'source'` - Original source (required for GIFs)
- `'thumb'` - Thumbnail
- `'square'` - Square crop
- `'cover'` - Cover format
- `'stories'` - Stories format

**Important rules:**

- **Format** is optional and defaults to `'default'`
- **Width** is optional for images
- For **videos/audio with `.mp4` or `.mp3` extension**:
  - Only `'default'` or `'source'` formats are allowed
  - Requires `definition` parameter (`'hd'` or `'sd'`)
- For **videos/audio without `.mp4`/`.mp3` extension**: returns a preview image (no `definition` needed)
- For **GIF images with `.gif` extension**: must use `'source'` format
- **Extensions** (`.jpg`, `.webp`, `.avif`, `.png`, `.gif`, `.mp4`, `.mp3`) are optional and force the output format
- Without extension, the server returns the format based on request headers

### Resolve Related Resources with `getRelated()`

Use the `getRelated()` helper to resolve `Related` objects to their full resources from the `included` array:

```ts
import { getRelated } from '@enodo/butterfly-ts';

const response = await client.get<Post[]>({ endpoint: 'posts' });
const post = response.data[0];

// Get the thumbnail image
const thumbnailRelated = post.relationships.thumbnail.data;
if (thumbnailRelated) {
  const thumbnail = getRelated<Image>(thumbnailRelated, response.included);
  if (thumbnail) {
    console.log(thumbnail.attributes.name);
  }
}

// Get the category
const categoryRelated = post.relationships.category.data;
if (categoryRelated) {
  const category = getRelated<Category>(categoryRelated, response.included);
  if (category) {
    console.log(category.attributes.name);
  }
}
```

The function returns `undefined` if the related resource is not found in the `included` array.

## Advanced Features

### Canceling requests with `signal`

You can cancel requests using an `AbortController`:

```ts
const controller = new AbortController();

const promise = client.get<Butterfly.Post[]>({
  endpoint: 'posts',
  signal: controller.signal,
});

// Cancel the request if needed
setTimeout(() => controller.abort(), 1000);

try {
  const posts = await promise;
} catch (err) {
  if (err.name === 'AbortError') {
    console.log('Request was cancelled');
  }
}
```

### Accessing response headers with `intercept`

Use the `intercept` callback to access fetch response:

```ts
let headers: Headers;
let status: number;

const posts = await client.get<Butterfly.Post[]>({
  endpoint: 'posts',
  intercept: (response) => {
    headers = response.headers;
    status = response.status;
  },
});

// Access headers after the request
const age = headers.get('age');
const cacheControl = headers.get(cache-control');
console.log(`Age: ${status}, Cache-Control: ${cacheControl}`);
```

## API

### `Client`

```ts
new Client({
  domain: string;
  publicKey?: string;
  version?: string;
  fetch?: typeof globalThis.fetch;
})
```

### `.get<T>()`

```ts
get<T extends Butterfly.Resource>({
  path?: string;
  endpoint?: string;
  id?: string | number;
  query?: Record<string, any>;
  fetch?: typeof globalThis.fetch;
  signal?: AbortSignal;
  intercept?: (response: Response) => void;
}): Promise<Butterfly.ApiResponse<T>>
```

**Parameters:**

- `path`: Direct API path (must start with `/v1`)
- `endpoint`: API endpoint name (e.g., `'posts'`, `'categories'`)
- `id`: Resource ID for single resource requests
- `query`: Query parameters (automatically stringified)
- `fetch`: Custom fetch implementation (useful for SSR)
- `signal`: AbortSignal for request cancellation
- `intercept`: Callback to access raw Response object (headers, status)

## Types

### `ApiResponse<T>`

The standard response envelope returned by the client methods.

```ts
type ApiResponse<T> = {
  meta?: { total?: number; size?: number };
  data: T; // primary payload (single resource, collection, or primitives)
  included: Resource[]; // side-loaded resources for relationships
  links: Record<string, string | undefined>; // e.g. self, next, prev
};
```

- **meta**: optional pagination/metadata values
- **data**: the main payload returned by the endpoint
- **included**: denormalized resources used to resolve relationships
- **links**: navigational links (pagination, self, next, prev, etc.)

### `Resource`

Union of all concrete domain entities that can appear in `data` or `included`.

```ts
type Resource = Property | Author | Category | Media | Post | Taxonomy | Term;
```

Each resource follows a JSON:API-inspired shape with: `id`, `type`, `attributes`, and `relationships`.

### `Related<TType = string>`

A lightweight pointer to a related entity when only identity is needed (no attributes embedded).

```ts
type Related<TType extends string = string> = {
  id: string | number;
  type: TType;
};
```

You can resolve a `Related` to a full resource using `getRelated()` against the `included` array (see example below in Utilities).

### `PostBody` (overview)

The post content is modeled as a typed, serializable rich‑text AST composed of inline and block nodes (text, formatting marks, links, quotes, code blocks, embeds, etc.). The SDK exposes these node types via a module namespace for convenience:

```ts
import type { PostBody } from '@enodo/butterfly-ts';
// e.g. PostBody.BodyData, PostBody.Paragraph, PostBody.Title2, ...
```

Refer to the exported types for the complete set of nodes and data payloads.

## Error handling

The API may respond with errors:

- **RedirectError**: when API responds with a 410 but recommand a 30x redirect for the content
- **ApiError**: when API responds with a 40x/50x error

## Development

- Build : `npm run build`
- Lint : `npm run lint`
- Format : `npm run format`
- Test : `npm run test`

## License

MIT
