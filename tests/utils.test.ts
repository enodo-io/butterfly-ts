import { describe, it, expect } from 'vitest';

import type { Image, Video, Audio, Post, Category, Related, Resource } from '../src/types.js';
import { getMediaUrl, getRelated, getCategoryChildrenIds } from '../src/utils.js';

describe('getMediaUrl', () => {
  const mockImage = {
    id: 123,
    type: 'image',
    attributes: {
      name: 'Test Image',
      description: 'A test image',
      credits: 'Test',
      keywords: [],
      mimetype: 'image/jpeg',
      createdAt: '2024-01-01',
      width: 1920,
      height: 1080,
      fingerprints: {
        source: 'abc123source',
        default: 'abc123default',
        thumb: 'abc123thumb',
        square: 'abc123square',
        cover: 'abc123cover',
        stories: 'abc123stories',
      },
    },
    relationships: {},
  } as unknown as Image;

  const mockVideo = {
    id: 456,
    type: 'video',
    attributes: {
      name: 'Test Video',
      description: 'A test video',
      credits: 'Test',
      keywords: [],
      mimetype: 'video/mp4',
      createdAt: '2024-01-01',
      width: 1920,
      height: 1080,
      duration: 120,
      fingerprints: {
        source: 'def456source',
        default: 'def456default',
        thumb: 'def456thumb',
        square: 'def456square',
        cover: 'def456cover',
        stories: 'def456stories',
      },
    },
    relationships: {},
  } as unknown as Video;

  const mockAudio = {
    id: 789,
    type: 'audio',
    attributes: {
      name: 'Test Audio',
      description: 'A test audio',
      credits: 'Test',
      keywords: [],
      mimetype: 'audio/mpeg',
      createdAt: '2024-01-01',
      duration: 180,
      fingerprints: {
        source: 'ghi789source',
        default: 'ghi789default',
        thumb: 'ghi789thumb',
        square: 'ghi789square',
        cover: 'ghi789cover',
        stories: 'ghi789stories',
      },
    },
    relationships: {},
  } as unknown as Audio;

  it('should generate basic image URL', () => {
    const url = getMediaUrl({
      domain: 'https://xxx.staticbtf.eno.do',
      media: mockImage,
      format: 'cover',
      width: 1200,
    });

    expect(url).toBe('https://xxx.staticbtf.eno.do/v1/123-cover-1200/abc123cover/media');
  });

  it('should generate image URL with custom slug', () => {
    const url = getMediaUrl({
      domain: 'https://xxx.staticbtf.eno.do',
      media: mockImage,
      format: 'thumb',
      width: 300,
      slug: 'mon-image-test',
    });

    expect(url).toBe('https://xxx.staticbtf.eno.do/v1/123-thumb-300/abc123thumb/mon-image-test');
  });

  it('should generate image URL with extension', () => {
    const url = getMediaUrl({
      domain: 'https://xxx.staticbtf.eno.do',
      media: mockImage,
      format: 'default',
      width: 800,
      slug: 'test',
      ext: 'webp',
    });

    expect(url).toBe('https://xxx.staticbtf.eno.do/v1/123-default-800/abc123default/test.webp');
  });

  it('should generate video URL with mp4 extension', () => {
    const url = getMediaUrl({
      domain: 'https://xxx.staticbtf.eno.do',
      media: mockVideo,
      format: 'source',
      width: 1920,
      slug: 'my-video',
      ext: 'mp4',
      definition: 'hd',
    });

    expect(url).toBe('https://xxx.staticbtf.eno.do/v1/456-source-hd/def456source/my-video.mp4');
  });

  it('should generate video URL with hd definition', () => {
    const url = getMediaUrl({
      domain: 'https://xxx.staticbtf.eno.do',
      media: mockVideo,
      format: 'default',
      width: 1920,
      slug: 'my-video',
      ext: 'mp4',
      definition: 'hd',
    });

    expect(url).toBe('https://xxx.staticbtf.eno.do/v1/456-default-hd/def456default/my-video.mp4');
  });

  it('should generate video URL with sd definition', () => {
    const url = getMediaUrl({
      domain: 'https://xxx.staticbtf.eno.do',
      media: mockVideo,
      format: 'source',
      width: 1920,
      slug: 'video-sd',
      ext: 'mp4',
      definition: 'sd',
    });

    expect(url).toBe('https://xxx.staticbtf.eno.do/v1/456-source-sd/def456source/video-sd.mp4');
  });

  it('should generate audio URL with mp3 extension', () => {
    const url = getMediaUrl({
      domain: 'https://xxx.staticbtf.eno.do',
      media: mockAudio,
      format: 'default',
      width: 0,
      slug: 'my-audio',
      ext: 'mp3',
      definition: 'sd',
    });

    expect(url).toBe('https://xxx.staticbtf.eno.do/v1/789-default-sd/ghi789default/my-audio.mp3');
  });

  it('should throw error for video with invalid format and mp4 extension', () => {
    expect(() =>
      getMediaUrl({
        domain: 'https://xxx.staticbtf.eno.do',
        media: mockVideo,
        format: 'thumb',
        width: 300,
        ext: 'mp4',
      }),
    ).toThrow(`Format 'thumb' is not allowed for video with ext .mp4`);
  });

  it('should throw error for audio with invalid format and mp3 extension', () => {
    expect(() =>
      getMediaUrl({
        domain: 'https://xxx.staticbtf.eno.do',
        media: mockAudio,
        format: 'cover',
        width: 800,
        ext: 'mp3',
      }),
    ).toThrow(`Format 'cover' is not allowed for audio with ext .mp3`);
  });

  it('should throw error for GIF without source format', () => {
    const gifImage = {
      ...mockImage,
      attributes: {
        ...mockImage.attributes,
        mimetype: 'image/gif',
      },
    } as unknown as Image;

    expect(() =>
      getMediaUrl({
        domain: 'https://xxx.staticbtf.eno.do',
        media: gifImage,
        format: 'cover',
        width: 800,
        ext: 'gif',
      }),
    ).toThrow(`GIF images must use 'source' format`);
  });

  it('should allow GIF with source format', () => {
    const gifImage = {
      ...mockImage,
      attributes: {
        ...mockImage.attributes,
        mimetype: 'image/gif',
      },
    } as unknown as Image;

    const url = getMediaUrl({
      domain: 'https://xxx.staticbtf.eno.do',
      media: gifImage,
      format: 'source',
      width: 800,
      ext: 'gif',
    });

    expect(url).toBe('https://xxx.staticbtf.eno.do/v1/123-source-800/abc123source/media.gif');
  });

  it('should generate image URL without width', () => {
    const url = getMediaUrl({
      domain: 'https://xxx.staticbtf.eno.do',
      media: mockImage,
      format: 'default',
      slug: 'my-image',
    });

    expect(url).toBe('https://xxx.staticbtf.eno.do/v1/123-default/abc123default/my-image');
  });

  it('should use default format when format is not specified', () => {
    const url = getMediaUrl({
      domain: 'https://xxx.staticbtf.eno.do',
      media: mockImage,
      width: 800,
      slug: 'my-image',
    });

    expect(url).toBe('https://xxx.staticbtf.eno.do/v1/123-default-800/abc123default/my-image');
  });

  it('should throw error for video with mp4 extension but no definition', () => {
    expect(() =>
      getMediaUrl({
        domain: 'https://xxx.staticbtf.eno.do',
        media: mockVideo,
        format: 'default',
        ext: 'mp4',
      }),
    ).toThrow("video requires 'definition' parameter for extension .mp4");
  });

  it('should throw error for audio with mp3 extension but no definition', () => {
    expect(() =>
      getMediaUrl({
        domain: 'https://xxx.staticbtf.eno.do',
        media: mockAudio,
        format: 'default',
        ext: 'mp3',
      }),
    ).toThrow("audio requires 'definition' parameter for extension .mp3");
  });

  it('should generate video preview image URL without definition', () => {
    const url = getMediaUrl({
      domain: 'https://xxx.staticbtf.eno.do',
      media: mockVideo,
      format: 'cover',
      width: 800,
      ext: 'jpg',
    });

    expect(url).toBe('https://xxx.staticbtf.eno.do/v1/456-cover-800/def456cover/media.jpg');
  });

  it('should generate audio preview image URL without definition', () => {
    const url = getMediaUrl({
      domain: 'https://xxx.staticbtf.eno.do',
      media: mockAudio,
      format: 'thumb',
      width: 300,
    });

    expect(url).toBe('https://xxx.staticbtf.eno.do/v1/789-thumb-300/ghi789thumb/media');
  });
});

describe('getRelated', () => {
  const mockImage = {
    id: 123,
    type: 'image',
    attributes: {
      name: 'Test Image',
      description: 'A test image',
      credits: 'Test',
      keywords: [],
      mimetype: 'image/jpeg',
      createdAt: '2024-01-01',
      width: 1920,
      height: 1080,
      fingerprints: {
        source: 'abc123source',
        default: 'abc123default',
        thumb: 'abc123thumb',
        square: 'abc123square',
        cover: 'abc123cover',
        stories: 'abc123stories',
      },
    },
    relationships: {},
  } as unknown as Image;

  const mockCategory = {
    id: 456,
    type: 'category',
    attributes: {
      name: 'Tech',
      description: 'Technology category',
      path: '/tech',
      slug: 'tech',
      custom: {},
    },
    relationships: {
      thumbnail: { data: null },
      parentCategory: { data: null },
    },
  } as Category;

  const mockPost = {
    id: 789,
    type: 'post',
    attributes: {
      title: 'Test Post',
      resume: 'A test post',
      canonical: null,
      slug: 'test-post',
      publishedAt: '2024-01-01',
      updatedAt: '2024-01-01',
      custom: {},
      flags: [],
      type: 'article',
    },
    relationships: {
      category: { data: { id: 456, type: 'category' } },
      thumbnail: { data: { id: 123, type: 'image' } },
      authors: { data: [] },
      terms: { data: [] },
    },
  } as Post;

  const included: Resource[] = [mockImage, mockCategory, mockPost];

  it('should find related image resource', () => {
    const related: Related<'image'> = { id: 123, type: 'image' };
    const resource = getRelated<Image>(related, included);

    expect(resource).toBe(mockImage);
    expect(resource?.type).toBe('image');
  });

  it('should find related category resource', () => {
    const related: Related<'category'> = { id: 456, type: 'category' };
    const resource = getRelated<Category>(related, included);

    expect(resource).toBe(mockCategory);
    expect(resource?.attributes.name).toBe('Tech');
  });

  it('should return undefined for non-existent resource', () => {
    const related: Related = { id: 999, type: 'post' };
    const resource = getRelated(related, included);

    expect(resource).toBeUndefined();
  });

  it('should return undefined when type does not match', () => {
    const related: Related = { id: 123, type: 'video' };
    const resource = getRelated(related, included);

    expect(resource).toBeUndefined();
  });

  it('should work with post relationships', () => {
    const thumbnailRelated = mockPost.relationships.thumbnail.data;
    if (thumbnailRelated) {
      const thumbnail = getRelated<Image>(thumbnailRelated, included);
      expect(thumbnail).toBe(mockImage);
    }

    const categoryRelated = mockPost.relationships.category.data;
    if (categoryRelated) {
      const category = getRelated<Category>(categoryRelated, included);
      expect(category).toBe(mockCategory);
    }
  });
});

describe('getCategoryChildrenIds', () => {
  // Structure de catégories pour les tests :
  // Tech (1)
  //   ├── Programming (2)
  //   │   ├── JavaScript (3)
  //   │   └── Python (4)
  //   └── Hardware (5)
  // Sports (6)
  //   └── Football (7)
  const mockCategories: Category[] = [
    {
      id: 1,
      type: 'category',
      attributes: {
        name: 'Tech',
        description: 'Technology',
        path: '/tech',
        slug: 'tech',
        custom: {},
      },
      relationships: {
        thumbnail: { data: null },
        parentCategory: { data: null },
      },
    },
    {
      id: 2,
      type: 'category',
      attributes: {
        name: 'Programming',
        description: 'Programming languages',
        path: '/tech/programming',
        slug: 'programming',
        custom: {},
      },
      relationships: {
        thumbnail: { data: null },
        parentCategory: { data: { id: 1, type: 'category' } },
      },
    },
    {
      id: 3,
      type: 'category',
      attributes: {
        name: 'JavaScript',
        description: 'JavaScript programming',
        path: '/tech/programming/javascript',
        slug: 'javascript',
        custom: {},
      },
      relationships: {
        thumbnail: { data: null },
        parentCategory: { data: { id: 2, type: 'category' } },
      },
    },
    {
      id: 4,
      type: 'category',
      attributes: {
        name: 'Python',
        description: 'Python programming',
        path: '/tech/programming/python',
        slug: 'python',
        custom: {},
      },
      relationships: {
        thumbnail: { data: null },
        parentCategory: { data: { id: 2, type: 'category' } },
      },
    },
    {
      id: 5,
      type: 'category',
      attributes: {
        name: 'Hardware',
        description: 'Computer hardware',
        path: '/tech/hardware',
        slug: 'hardware',
        custom: {},
      },
      relationships: {
        thumbnail: { data: null },
        parentCategory: { data: { id: 1, type: 'category' } },
      },
    },
    {
      id: 6,
      type: 'category',
      attributes: {
        name: 'Sports',
        description: 'Sports category',
        path: '/sports',
        slug: 'sports',
        custom: {},
      },
      relationships: {
        thumbnail: { data: null },
        parentCategory: { data: null },
      },
    },
    {
      id: 7,
      type: 'category',
      attributes: {
        name: 'Football',
        description: 'Football sports',
        path: '/sports/football',
        slug: 'football',
        custom: {},
      },
      relationships: {
        thumbnail: { data: null },
        parentCategory: { data: { id: 6, type: 'category' } },
      },
    },
  ];

  it('should return only the category itself when no children', () => {
    const footballCategory = mockCategories.find((cat) => cat.id === 7);
    if (!footballCategory) {
      throw new Error('Category not found');
    }
    const result = getCategoryChildrenIds(footballCategory, mockCategories);
    expect(result).toEqual([7]);
  });

  it('should return category and direct children', () => {
    const programmingCategory = mockCategories.find((cat) => cat.id === 2);
    if (!programmingCategory) {
      throw new Error('Category not found');
    }
    const result = getCategoryChildrenIds(programmingCategory, mockCategories);
    expect(result).toEqual([2, 3, 4]); // Programming, JavaScript, Python
  });

  it('should return category and all nested children', () => {
    const techCategory = mockCategories.find((cat) => cat.id === 1);
    if (!techCategory) {
      throw new Error('Category not found');
    }
    const result = getCategoryChildrenIds(techCategory, mockCategories);
    expect(result).toEqual([1, 2, 3, 4, 5]); // Tech, Programming, JavaScript, Python, Hardware
  });

  it('should handle non-existent category', () => {
    const nonExistentCategory: Category = {
      id: 999,
      type: 'category',
      attributes: {
        name: 'Non existent',
        description: '',
        path: '/non-existent',
        slug: 'non-existent',
        custom: {},
      },
      relationships: {
        thumbnail: { data: null },
        parentCategory: { data: null },
      },
    };
    const result = getCategoryChildrenIds(nonExistentCategory, mockCategories);
    expect(result).toEqual([999]);
  });
});
