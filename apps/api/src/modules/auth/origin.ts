import type { FastifyRequest } from 'fastify';
import type { ApiConfig } from '../../config';
import { ApiError } from '../../shared/errors';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function firstHeader(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value?.split(',')[0]?.trim();
}

function normalizeOrigin(value: string | undefined): string | null {
  if (!value) {
    return null;
  }
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`.toLowerCase();
  } catch {
    return null;
  }
}

function getRequestOrigin(request: FastifyRequest): string | null {
  const host = firstHeader(request.headers['x-forwarded-host']) || request.headers.host;
  if (!host) {
    return null;
  }
  const protocol = firstHeader(request.headers['x-forwarded-proto']) || request.protocol || 'http';
  return normalizeOrigin(`${protocol}://${host}`);
}

export function createOriginGuard(config: ApiConfig) {
  const allowedOrigins = new Set(config.allowedOrigins.map((origin) => origin.toLowerCase()));

  return async (request: FastifyRequest): Promise<void> => {
    if (SAFE_METHODS.has(request.method) || !request.url.startsWith('/api/')) {
      return;
    }

    const originHeader = request.headers.origin;
    const referer = request.headers.referer;
    if (!originHeader && !referer) {
      return;
    }
    if (originHeader === 'null') {
      throw new ApiError(403, 'csrf_origin_rejected', 'Request origin is not allowed.');
    }

    const origin = normalizeOrigin(originHeader || referer);
    if (!origin || (origin !== getRequestOrigin(request) && !allowedOrigins.has(origin))) {
      throw new ApiError(403, 'csrf_origin_rejected', 'Request origin is not allowed.');
    }
  };
}
