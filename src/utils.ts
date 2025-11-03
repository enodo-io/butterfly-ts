import type { Media, Related, Resource, Category } from './types.js';

export type MediaFormat = 'default' | 'source' | 'thumb' | 'square' | 'cover' | 'stories';
export type MediaExtension = 'jpg' | 'webp' | 'avif' | 'png' | 'mp4' | 'mp3' | 'gif';
export type VideoDefinition = 'hd' | 'sd';

export interface GetMediaUrlOptions {
  domain: string;
  media: Media;
  format?: MediaFormat;
  width?: number;
  slug?: string;
  ext?: MediaExtension;
  definition?: VideoDefinition;
}
export function getMediaUrl(options: GetMediaUrlOptions): string {
  const { domain, media, format = 'default', width, slug = 'media', ext, definition } = options;

  if (ext === 'mp4' || ext === 'mp3') {
    if (media.type === 'video' || media.type === 'audio') {
      if (format !== 'default' && format !== 'source') {
        throw new Error(
          `[BTF-MEDIA] Format '${format}' is not allowed for ${media.type} with ext .${ext}. Use 'default' or 'source'.`,
        );
      }
      if (!definition) {
        throw new Error(
          `[BTF-MEDIA] ${media.type} requires 'definition' parameter for extension .${ext}`,
        );
      }
    } else {
      throw new Error(`[BTF-MEDIA] Invalid media type (${media.type}) for extension .${ext}`);
    }
  }

  if (media.attributes.mimetype === 'image/gif' && ext === 'gif' && format !== 'source') {
    throw new Error(`[BTF-MEDIA] GIF images must use 'source' format`);
  }

  const fingerprint = media.attributes.fingerprints[format];
  const extension = ext ? `.${ext}` : '';
  const size = definition ?? width;

  if (size === undefined) {
    return `${domain}/v1/${media.id}-${format}/${fingerprint}/${slug}${extension}`;
  }

  return `${domain}/v1/${media.id}-${format}-${size}/${fingerprint}/${slug}${extension}`;
}

export function getRelated<T extends Resource = Resource>(
  related: Related | null | undefined,
  included: Resource[],
): T | undefined {
  if (!related) {
    return undefined;
  }

  return included.find(
    (resource) => resource.id === related.id && resource.type === related.type,
  ) as T | undefined;
}

export function getCategoryChildrenIds(category: Category, categories: Category[]): number[] {
  const childrenIds: number[] = [category.id];

  const findChildren = (parentId: number) => {
    const children = categories.filter(
      (cat) => cat.relationships.parentCategory.data?.id === parentId,
    );

    for (const child of children) {
      childrenIds.push(child.id);
      findChildren(child.id);
    }
  };

  findChildren(category.id);
  return childrenIds;
}
