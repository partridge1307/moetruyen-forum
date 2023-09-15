import type { SerializedEditorState, SerializedLexicalNode } from 'lexical';
import { ZodType, z } from 'zod';

const CreateCommentType = z.enum(['COMMENT', 'SUB_COMMENT']);
export type CreateCommentEnum = z.infer<typeof CreateCommentType>;

export const CreateCommentValidator = z.object({
  type: CreateCommentType,
  id: z.number(),
  content: z.any() as ZodType<SerializedEditorState<SerializedLexicalNode>>,
  oEmbed: z
    .object({
      link: z
        .string()
        .refine(
          (value) =>
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test(
              value
            ),
          'Invalid URL'
        ),
      meta: z.object({
        title: z.string(),
        description: z.string(),
        image: z.object({ url: z.string() }),
      }),
    })
    .optional(),
});
export type CreateCommentPayload = z.infer<typeof CreateCommentValidator>;
