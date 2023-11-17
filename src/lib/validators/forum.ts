import type { SerializedEditorState, SerializedLexicalNode } from 'lexical';
import { ZodType, z } from 'zod';
import { zfd } from 'zod-form-data';
import { vieRegex } from '../utils';

export const CreateThreadValidator = z.object({
  slug: z
    .string()
    .optional()
    .refine((value) => {
      if (value) {
        return value.length <= 32 && /[a-z0-9-]/.test(value);
      } else return true;
    }, 'Tối đa 32 kí tự, chỉ nhận kí tự thường, số, gạch ngang'),
  thumbnail: z.string().optional(),
  title: z
    .string()
    .min(3, 'Tối thiểu 3 kí tự')
    .max(64, 'Tối đa 64 kí tự')
    .refine(
      (value) => vieRegex.test(value),
      'Chỉ chấp nhận kí tự in hoa, in thường, gạch dưới, khoảng cách hoặc số'
    ),
  canSend: z.boolean(),
});
export type CreateThreadPayload = z.infer<typeof CreateThreadValidator>;

export const CreateThreadFormValidator = zfd.formData({
  slug: zfd
    .text(
      z
        .string()
        .max(32, 'Tối đa 32 kí tự')
        .refine((value) => /[a-z0-9-]/.test(value), 'Không hợp lệ')
    )
    .optional(),
  thumbnail: zfd
    .file()
    .or(zfd.text())
    .optional()
    .refine((file) => {
      if (file) {
        if (file instanceof File)
          return ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type);
        else return file.startsWith(`${process.env.IMG_DOMAIN}`);
      } else return true;
    }, 'Chỉ nhận định dạng .jpg, .png, .jpeg')
    .refine((file) => {
      if (file) {
        if (file instanceof File) return file.size < 4 * 1000 * 1000;
        else return file.startsWith(`${process.env.IMG_DOMAIN}`);
      } else return true;
    }, 'Chỉ nhận ảnh dưới 4MB'),
  title: zfd.text(
    z
      .string()
      .min(3, 'Tối thiểu 3 kí tự')
      .max(64, 'Tối đa 64 kí tự')
      .refine(
        (value) => vieRegex.test(value),
        'Chỉ chấp nhận kí tự in hoa, in thường, gạch dưới, khoảng cách hoặc số'
      )
  ),
  canSend: zfd.text(z.enum(['true', 'false'])),
});

export const EditThreadValidator = CreateThreadValidator.extend({
  managers: z.array(z.object({ id: z.string(), name: z.string().nullish() })),
});
export type EditThreadPayload = z.infer<typeof EditThreadValidator>;

export const EditThreadFormValidator = zfd.formData({
  slug: zfd
    .text(
      z
        .string()
        .max(32, 'Tối đa 32 kí tự')
        .refine((value) => /[a-z0-9-]/.test(value), 'Không hợp lệ')
    )
    .optional(),
  thumbnail: zfd
    .file()
    .or(zfd.text())
    .optional()
    .refine((file) => {
      if (file) {
        if (file instanceof File)
          return ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type);
        else return file.startsWith(`${process.env.IMG_DOMAIN}`);
      } else return true;
    }, 'Chỉ nhận định dạng .jpg, .png, .jpeg')
    .refine((file) => {
      if (file) {
        if (file instanceof File) return file.size < 4 * 1000 * 1000;
        else return file.startsWith(`${process.env.IMG_DOMAIN}`);
      } else return true;
    }, 'Chỉ nhận ảnh dưới 4MB'),
  title: zfd.text(
    z
      .string()
      .min(3, 'Tối thiểu 3 kí tự')
      .max(64, 'Tối đa 64 kí tự')
      .refine(
        (value) => vieRegex.test(value),
        'Chỉ chấp nhận kí tự in hoa, in thường, gạch dưới, khoảng cách hoặc số'
      )
  ),
  canSend: zfd.text(z.enum(['true', 'false'])),
  managers: zfd.repeatableOfType(
    zfd.json(z.object({ id: z.string(), name: z.string().nullish() }))
  ),
});

export const CreateSubscriptionValidator = z.object({
  type: z.enum(['SUBSCRIBE', 'UNSUBSCRIBE']),
  subForumId: z.number(),
});
export type CreateSubscriptionPayload = z.infer<
  typeof CreateSubscriptionValidator
>;

export const CreatePostValidator = z.object({
  title: z
    .string()
    .min(5, 'Tối thiểu 5 kí tự')
    .max(256, 'Tối đa 256 kí tự')
    .refine(
      (value) => vieRegex.test(value),
      'Chỉ chấp nhận kí tự in hoa, in thường, gạch dưới, khoảng cách hoặc số'
    ),
  content: z.any() as ZodType<SerializedEditorState<SerializedLexicalNode>>,
  plainTextContent: z.string().optional(),
});
export type CreatePostPayload = z.infer<typeof CreatePostValidator>;
