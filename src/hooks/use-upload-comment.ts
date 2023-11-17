import type { CreateCommentPayload } from '@/lib/validators/comment';
import type { Prisma } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { CLEAR_EDITOR_COMMAND, type LexicalEditor } from 'lexical';
import type { Session } from 'next-auth';
import { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { useCustomToast } from './use-custom-toast';

export const useUploadComment = <TData>({
  type,
  id: commentId,
  session,
  setComments,
  editorRef,
  APIQuery,
}: {
  type: 'COMMENT' | 'SUB_COMMENT';
  id: number;
  session: Session;
  setComments: Dispatch<SetStateAction<TData[]>>;
  editorRef: MutableRefObject<LexicalEditor | null>;
  APIQuery: string;
}) => {
  const { loginToast, notFoundToast, rateLimitToast, serverErrorToast } =
    useCustomToast();

  return useMutation({
    mutationKey: ['comment-upload', commentId],
    mutationFn: async (payload: CreateCommentPayload) => {
      const { data } = await axios.post(APIQuery, payload);

      return data as number;
    },
    onError: (err) => {
      setComments((prev) => prev.slice(1, prev.length));

      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
        if (err.response?.status === 429) return rateLimitToast();
      }

      return serverErrorToast();
    },
    onMutate: (payload) => {
      const optimisticComment = {
        id: crypto.randomUUID(),
        content: payload.content,
        oEmbed: payload.oEmbed as Prisma.JsonValue,
        createdAt: new Date(Date.now()),
        votes: [],
        creatorId: session.user.id,
        creator: {
          name: session.user.name,
          color: session.user.color,
          image: session.user.image,
        },
        isSending: true,
        ...(type === 'COMMENT' && {
          _count: {
            replies: 0,
          },
        }),
      };

      type === 'COMMENT'
        ? // @ts-expect-error
          setComments((prev) => [optimisticComment, ...prev])
        : // @ts-expect-error
          setComments((prev) => [...prev, optimisticComment]);
    },
    onSuccess: (id) => {
      type === 'COMMENT'
        ? setComments((prev) => {
            const firstComment = prev[0];
            // @ts-expect-error
            firstComment.id = id;
            // @ts-expect-error
            firstComment.isSending = false;

            return [firstComment, ...prev.slice(1)];
          })
        : setComments((prev) => {
            const lastComment = prev[prev.length - 1];
            // @ts-expect-error
            lastComment.id = id;
            // @ts-expect-error
            lastComment.isSending = false;

            return [...prev.slice(0, -1), lastComment];
          });
    },
    onSettled: () => {
      editorRef.current?.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
      editorRef.current?.setEditable(true);
    },
  });
};
