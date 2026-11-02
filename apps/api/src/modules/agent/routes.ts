import type { FastifyInstance } from 'fastify';
import { createHash } from 'node:crypto';
import { isAgentConfigured, type ApiConfig } from '../../config';
import { ApiError } from '../../shared/errors';
import type { AuthGuard } from '../auth/guard';
import { agentChatRequestSchema } from './schema';
import { requestAgentCompletion } from './service';

export type RegisterAgentRoutesOptions = {
  config: ApiConfig;
  fetchImpl?: typeof fetch;
  requireAuth: AuthGuard;
};

export async function registerAgentRoutes(
  app: FastifyInstance,
  { config, fetchImpl, requireAuth }: RegisterAgentRoutesOptions
): Promise<void> {
  app.get('/config', { onRequest: requireAuth }, async () => ({
    configured: isAgentConfigured(config),
    model: config.model,
  }));

  const chatRouteOptions =
    config.rateLimitPerMinute > 0
      ? {
          config: {
            rateLimit: {
              max: config.rateLimitPerMinute,
              timeWindow: '1 minute',
              keyGenerator: (request: {
                cookies: Record<string, string | undefined>;
                ip: string;
              }) => {
                const token = request.cookies[config.sessionCookieName];
                return token ? createHash('sha256').update(token).digest('hex') : request.ip;
              },
            },
          },
        }
      : {};

  app.post('/chat', { onRequest: requireAuth, ...chatRouteOptions }, async (request) => {
    const parsedBody = agentChatRequestSchema.safeParse(request.body);
    if (!parsedBody.success) {
      const issue = parsedBody.error.issues[0];
      throw new ApiError(400, 'invalid_request', issue?.message || 'Invalid request body.');
    }

    if (!isAgentConfigured(config)) {
      throw new ApiError(
        503,
        'agent_not_configured',
        'The agent model is not configured on the server.'
      );
    }

    const message = await requestAgentCompletion({
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      model: config.model,
      timeoutMs: config.timeoutMs,
      messages: parsedBody.data.messages,
      toolChoice: parsedBody.data.tool_choice,
      signal: request.signal,
      fetchImpl,
    });

    return { message };
  });
}
