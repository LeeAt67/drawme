import { z } from 'zod';

const MAX_BOARD_ELEMENTS = 20_000;
const MAX_BOARD_TITLE_LENGTH = 120;

export const boardIdSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[A-Za-z0-9_-]+$/, 'Board id contains invalid characters.');

export const boardContentSchema = z.object({
  children: z.array(z.unknown()).max(MAX_BOARD_ELEMENTS),
  viewport: z.unknown().optional(),
  theme: z.unknown().optional(),
});

export const saveBoardRequestSchema = z.object({
  title: z.string().trim().min(1).max(MAX_BOARD_TITLE_LENGTH).optional(),
  content: boardContentSchema,
});

export type SaveBoardRequest = z.infer<typeof saveBoardRequestSchema>;
