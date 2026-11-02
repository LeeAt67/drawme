import type { CookieSerializeOptions } from '@fastify/cookie';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ApiConfig } from '../../config';

function getBaseCookieOptions(config: ApiConfig): CookieSerializeOptions {
  return {
    path: '/',
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: 'lax',
  };
}

export function readSessionCookie(request: FastifyRequest, config: ApiConfig): string | undefined {
  const token = request.cookies[config.sessionCookieName];
  return typeof token === 'string' && token.trim() ? token.trim() : undefined;
}

export function setSessionCookie(
  reply: FastifyReply,
  config: ApiConfig,
  token: string,
  expiresAt: number
): void {
  reply.setCookie(config.sessionCookieName, token, {
    ...getBaseCookieOptions(config),
    maxAge: Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)),
  });
}

export function clearSessionCookie(reply: FastifyReply, config: ApiConfig): void {
  reply.clearCookie(config.sessionCookieName, getBaseCookieOptions(config));
}
