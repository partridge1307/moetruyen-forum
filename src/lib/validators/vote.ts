import { z } from 'zod';

export const userFollowValidator = z.object({
  id: z.number().or(z.string()),
  target: z.enum(['USER', 'MANGA']),
});
export type FollowPayload = z.infer<typeof userFollowValidator>;

export const VoteValidator = z.object({
  id: z.number(),
  voteType: z.enum(['UP_VOTE', 'DOWN_VOTE']),
});
export type VotePayload = z.infer<typeof VoteValidator>;
