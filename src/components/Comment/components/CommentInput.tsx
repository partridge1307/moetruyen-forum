'use client';

import { $isImageNode, type ImageNode } from '@/components/Editor/nodes/Image';
import { $isMentionNode } from '@/components/Editor/nodes/Mention';
import { Button } from '@/components/ui/Button';
import { useFetchOEmbed } from '@/hooks/use-fetch-oEmbed';
import { useUploadComment } from '@/hooks/use-upload-comment';
import { cn } from '@/lib/utils';
import type { CreateCommentEnum } from '@/lib/validators/comment';
import { AutoLinkNode } from '@lexical/link';
import { type EditorState, type LexicalEditor } from 'lexical';
import dynamic from 'next/dynamic';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

const MoetruyenEditor = dynamic(
  () => import('@/components/Editor/MoetruyenEditor'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-44 rounded-md animate-pulse dark:bg-zinc-900" />
    ),
  }
);

interface CommentInputProps {
  isLoggedIn: boolean;
  id: number;
  type: CreateCommentEnum;
  callbackURL: string;
  refetch?: () => void;
}

const CommentInput: FC<CommentInputProps> = ({
  isLoggedIn,
  id,
  type,
  callbackURL,
  refetch,
}) => {
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  const [hasText, setHasText] = useState(false);
  const [mentionUsers, setMentionUsers] =
    useState<Set<{ id: string; name: string }>>();
  const editorRef = useRef<LexicalEditor>(null);

  const { mutate: Upload, isLoading: isUpload } = useUploadComment(
    editorRef.current,
    refetch
  );
  const {
    data: oEmbedData,
    mutate: Embed,
    isLoading: isFetchingOEmbed,
  } = useFetchOEmbed();

  useEffect(() => {
    editorRef.current?.registerTextContentListener((text) => {
      text.length ? setHasText(true) : setHasText(false);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorRef.current]);

  useEffect(() => {
    if (
      typeof oEmbedData !== 'undefined' &&
      !isFetchingOEmbed &&
      editorRef.current
    ) {
      Upload({
        payload: {
          type,
          id,
          content: editorRef.current.getEditorState().toJSON(),
          oEmbed: oEmbedData,
        },
        callbackURL,
        mentionUsers: mentionUsers,
      });
    }
  }, [
    Upload,
    callbackURL,
    id,
    isFetchingOEmbed,
    mentionUsers,
    oEmbedData,
    type,
  ]);

  const onClick = useCallback(() => {
    if (editorRef.current) {
      if (editorRef.current.isEditable()) editorRef.current.setEditable(false);

      const mentionUsers = new Set<{ id: string; name: string }>();
      let autoLinkNode: AutoLinkNode | undefined,
        imageNode: ImageNode | undefined;

      editorState?._nodeMap.forEach((node) => {
        if (node instanceof AutoLinkNode) {
          autoLinkNode = node;
        } else if ($isImageNode(node)) {
          imageNode = node;
        } else if ($isMentionNode(node)) {
          mentionUsers.add(node._user);
        }
      });

      setMentionUsers(mentionUsers);

      if (imageNode || !autoLinkNode) {
        Upload({
          payload: {
            type,
            id,
            content: editorRef.current.getEditorState().toJSON(),
          },
          callbackURL,
          mentionUsers,
        });
      } else {
        Embed(autoLinkNode.__url);
      }
    }
  }, [editorState?._nodeMap, type, id, callbackURL, Embed, Upload]);

  return isLoggedIn ? (
    <div className="container px-0 md:px-16 lg:px-20 space-y-4">
      <MoetruyenEditor editorRef={editorRef} onChange={setEditorState} />
      <Button
        disabled={!hasText}
        isLoading={isUpload}
        className={cn('w-full transition-opacity', {
          'opacity-50': !hasText,
        })}
        onClick={() => onClick()}
      >
        Đăng
      </Button>
    </div>
  ) : (
    <div>
      Vui lòng <span className="font-semibold">đăng nhập</span> hoặc{' '}
      <span className="font-semibold">đăng ký</span> để comment
    </div>
  );
};

export default CommentInput;
