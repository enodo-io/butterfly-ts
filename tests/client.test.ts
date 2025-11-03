import fs from 'node:fs';
import path from 'node:path';

import { describe, it, expect } from 'vitest';

import { Client } from '../src/client.js';
import { ApiError } from '../src/errors.js';
import { Post, Property } from '../src/types.js';

function createFixtureFetch() {
  const fixturesDir = path.join(__dirname, 'fixtures');
  function loadRaw(name: string): string {
    const file = path.join(fixturesDir, name);
    return fs.readFileSync(file, 'utf-8');
  }
  return (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let request: Request;
    if (typeof input === 'string' || input instanceof URL) {
      request = new Request(input, init);
    } else if (input instanceof Request) {
      request = input;
    } else {
      request = new Request(String(input), init);
    }
    const u = new URL(request.url);
    const pathname = u.pathname;
    const qs = u.searchParams;

    let body: string | undefined;
    let status = 200;

    if (pathname === '/v1/') {
      body = loadRaw('property.json');
    } else if (
      pathname.replace(/\/$/, '') === '/v1/posts' &&
      (!qs.get('page[number]') || qs.get('page[number]') === '1')
    ) {
      body = loadRaw('posts_page1.json');
    } else if (pathname.replace(/\/$/, '') === '/v1/posts') {
      // Match whatever "next" the page1 fixture returns
      const raw = loadRaw('posts_page1.json');
      type PageLinks = { links?: { next?: string } };
      const p1 = JSON.parse(raw) as PageLinks;
      const next = p1.links?.next;
      if (next) {
        const expected = next.startsWith('http')
          ? new URL(next).pathname + new URL(next).search
          : next;
        if (expected === pathname + (u.search || '')) {
          body = loadRaw('posts_page2.json');
        }
      }
      if (!body) {
        body = loadRaw('path_404.json');
        status = 404;
      }
    } else if (pathname === '/v1/posts/1337') {
      body = loadRaw('post_404.json');
      status = 404;
    } else if (pathname === '/v1/yolo') {
      body = loadRaw('path_404.json');
      status = 404;
    } else {
      body = loadRaw('path_404.json');
      status = 404;
    }

    const headers = { 'content-type': 'application/json' };
    return Promise.resolve(new Response(body, { status, headers }));
  };
}

describe('Client', () => {
  const client = new Client({
    domain: 'https://local.test',
    fetch: createFixtureFetch(),
  });

  it('should get property from root path', async () => {
    const res = await client.get<Property>({ path: '/v1/' });
    expect(res.data.type).toBe('property');
  });

  it('should get only last published post', async () => {
    const res = await client.get<Post[]>({
      endpoint: 'posts',
      query: { page: { size: 1 } },
    });

    expect(res.data.length).toEqual(1);
  });

  it('should get page 1 and page 2', async () => {
    const p1 = await client.get<Post[]>({
      endpoint: 'posts',
      query: { page: { size: 1 } },
    });
    const p2 = await client.get<Post[]>({
      path: p1.links.next,
    });

    expect(p2.data.length).toEqual(1);
  });

  it('should throw 404 ApiError from an unexistant post', async () => {
    await expect(client.get({ endpoint: 'posts', id: 1337 })).rejects.toBeInstanceOf(ApiError);
  });

  it('should throw 404 ApiError from an unexistant path', async () => {
    await expect(client.get({ path: '/v1/yolo' })).rejects.toBeInstanceOf(ApiError);
  });

  it('should throw Error from an invalid path', async () => {
    await expect(client.get({ path: '/vyolo' })).rejects.toBeInstanceOf(Error);
  });

  it('should intercept response to access headers', async () => {
    let headers: Headers | undefined;
    let status: number | undefined;

    const res = await client.get<Post[]>({
      endpoint: 'posts',
      query: { page: { size: 1 } },
      intercept: (response) => {
        headers = response.headers;
        status = response.status;
      },
    });

    expect(res.data.length).toEqual(1);
    expect(headers).toBeDefined();
    expect(status).toBe(200);
    expect(headers?.get('content-type')).toContain('application/json');
  });
});
