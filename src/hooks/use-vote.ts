import type { VotePayload } from '@/lib/validators/vote';
import { usePrevious } from '@mantine/hooks';
import type { VoteType } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useCustomToast } from './use-custom-toast';

export const useVote = (
  id: number,
  initialVoteAmt: number,
  voteType: 'POST' | 'COMMENT',
  initialVote?: VoteType | null
) => {
  const { loginToast, notFoundToast, serverErrorToast } = useCustomToast();
  const [voteAmt, setVoteAmt] = useState<number>(initialVoteAmt);
  const [currentVote, setCurrentVote] = useState(initialVote);
  const prevVote = usePrevious(currentVote);

  const { mutate: Vote } = useMutation({
    mutationKey: ['vote-query', id],
    mutationFn: async (type: VoteType) => {
      const payload: VotePayload = {
        id,
        voteType: type,
      };

      await axios.post(
        `/api/${voteType === 'COMMENT' ? 'comment' : 'm'}/vote`,
        payload
      );
    },
    onError: (err, voteType) => {
      if (voteType === 'UP_VOTE') setVoteAmt((prev) => prev - 1);
      else setVoteAmt((prev) => prev + 1);

      setCurrentVote(prevVote);

      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }

      return serverErrorToast();
    },
    onMutate: (type: VoteType) => {
      if (currentVote === type) {
        setCurrentVote(undefined);
        if (type === 'UP_VOTE') setVoteAmt((prev) => prev - 1);
        if (type === 'DOWN_VOTE') setVoteAmt((prev) => prev + 1);
      } else {
        setCurrentVote(type);
        if (type === 'UP_VOTE') {
          setVoteAmt((prev) => prev + (currentVote ? 2 : 1));
        }
        if (type === 'DOWN_VOTE')
          setVoteAmt((prev) => prev - (currentVote ? 2 : 1));
      }
    },
  });

  useEffect(() => {
    setCurrentVote(initialVote);
  }, [initialVote]);

  return { Vote, voteAmt, currentVote };
};
