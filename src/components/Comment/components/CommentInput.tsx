'use client';

import { $isImageNode, type ImageNode } from '@/components/Editor/nodes/Image';
import EditorSkeleton from '@/components/Skeleton/EditorSkeleton';
import { Button } from '@/components/ui/Button';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { useFetchOEmbed } from '@/hooks/use-fetch-oEmbed';
import { CreateCommentPayload } from '@/lib/validators/comment';
import { $isAutoLinkNode, type AutoLinkNode } from '@lexical/link';
import type { Prisma } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { CLEAR_EDITOR_COMMAND, type LexicalEditor } from 'lexical';
import type { Session } from 'next-auth';
import dynamic from 'next/dynamic';
import {
  FC,
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { ExtendedComment } from '..';
import { ExtendedSubComment } from '../SubComment';

const MTEditor = dynamic(() => import('@/components/Editor/MoetruyenEditor'), {
  ssr: false,
  loading: () => <EditorSkeleton />,
});

type CommentInputProps = {
  session: Session;
  postId: number;
} & (
  | {
      type: 'COMMENT';
      setComments: Dispatch<SetStateAction<ExtendedComment[]>>;
      prevComment?: ExtendedComment[];
    }
  | {
      type: 'SUB_COMMENT';
      setComments: Dispatch<SetStateAction<ExtendedSubComment[]>>;
      prevComment?: ExtendedSubComment[];
    }
);

const CommentInput: FC<CommentInputProps> = ({
  type,
  session,
  postId,
  setComments,
  prevComment,
}) => {
  const { loginToast, serverErrorToast, notFoundToast } = useCustomToast();

  const editorRef = useRef<LexicalEditor>(null);
  const [hasText, setHasText] = useState(false);

  const {
    data: OEmbed,
    mutate: fetch,
    isLoading: isFetching,
  } = useFetchOEmbed();

  const { mutate: Upload, isLoading: isUploading } = useMutation({
    mutationKey: ['comment-upload', postId],
    mutationFn: async (payload: CreateCommentPayload) => {
      const { data } = await axios.post('/api/comment', payload);

      return data as number;
    },
    onError: (err) => {
      type === 'COMMENT'
        ? setComments(prevComment ?? [])
        : setComments(prevComment ?? []);

      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }

      return serverErrorToast();
    },
    onMutate: (payload) => {
      const optimisticComment: ExtendedComment = {
        id: Math.floor(Math.random() * 1 * 1000 * 1000),
        // @ts-expect-error
        content: payload.content,
        oEmbed: payload.oEmbed as Prisma.JsonValue,
        createdAt: new Date(Date.now()),
        creatorId: session.user.id,
        votes: [],
        creator: {
          name: session.user.name,
          color: session.user.color,
          image: session.user.image,
        },
        _count: {
          replies: 0,
        },
      };

      type === 'COMMENT'
        ? setComments((prev) => [optimisticComment, ...prev])
        : setComments((prev) => [...prev, optimisticComment]);
    },
    onSuccess: (id) => {
      type === 'COMMENT'
        ? setComments((prev) => {
            const firstComment = prev.shift();
            if (!firstComment) return prev;
            firstComment.id = id;

            return [firstComment, ...prev];
          })
        : setComments((prev) => {
            const lastComment = prev.pop();
            if (!lastComment) return prev;
            lastComment.id = id;

            return [...prev, lastComment];
          });

      editorRef.current?.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
      editorRef.current?.setEditable(true);
    },
  });

  useEffect(() => {
    editorRef.current?.registerTextContentListener((text) =>
      text.length ? setHasText(true) : setHasText(false)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorRef.current]);

  useEffect(() => {
    if (typeof OEmbed !== 'undefined' && !isFetching && editorRef.current) {
      Upload({
        type,
        id: postId,
        content: editorRef.current.getEditorState().toJSON(),
        oEmbed: OEmbed,
      });
    }
  }, [OEmbed, Upload, isFetching, postId, type]);

  const onSubmitHandler = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.isEditable() && editorRef.current.setEditable(false);

      const editorState = editorRef.current.getEditorState();

      let autoLinkNode: AutoLinkNode | undefined;
      let imageNode: ImageNode | undefined;
      editorState?._nodeMap.forEach((node) => {
        if ($isAutoLinkNode(node) && !autoLinkNode) {
          autoLinkNode = node;
        }
        if ($isImageNode(node) && !imageNode) {
          imageNode = node;
        }
      });

      if (imageNode || !autoLinkNode) {
        Upload({
          type,
          id: postId,
          content: editorRef.current.getEditorState().toJSON(),
        });
      } else {
        fetch(autoLinkNode.__url);
      }
    }
  }, [Upload, fetch, postId, type]);

  return (
    <div className="space-y-2">
      <MTEditor editorRef={editorRef} />
      <Button
        disabled={!hasText || isUploading || isFetching}
        isLoading={isUploading || isFetching}
        onClick={onSubmitHandler}
        className="w-full"
      >
        Bình luận
      </Button>
    </div>
  );
};

export default CommentInput;
