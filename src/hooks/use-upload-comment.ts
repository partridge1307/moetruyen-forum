import type { CreateCommentPayload } from '@/lib/validators/comment';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import type { LexicalEditor } from 'lexical';
import { CLEAR_EDITOR_COMMAND } from 'lexical';
import { useCustomToast } from './use-custom-toast';
//import { socket } from '@/lib/socket';

export const useUploadComment = (
  editor: LexicalEditor | null,
  refetch?: () => void
) => {
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();

  return useMutation({
    mutationKey: ['comment-upload-query'],
    mutationFn: async ({
      payload,
      callbackURL,
    }: {
      payload: CreateCommentPayload;
      callbackURL: string;
      mentionUsers?: Set<{ id: string; name: string }>;
    }) => {
      await axios.post(callbackURL, payload);
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }

      return serverErrorToast();
    },
    onSuccess: (_, data) => {
      if (!editor?.isEditable()) editor?.setEditable(true);
      editor?.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);

      !!refetch && refetch();

      if (data.mentionUsers) {
        let users: { id: string; name: string }[] = [];
        data.mentionUsers.forEach((user) => users.push(user));
      }

      return successToast();
    },
  });
};
