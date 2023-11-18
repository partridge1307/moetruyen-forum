'use client';

import MoetruyenEditor from '@/components/Editor/MoetruyenEditor';
import { $isImageNode, type ImageNode } from '@/components/Editor/nodes/Image';
import { Button } from '@/components/ui/Button';
import { useFetchOEmbed } from '@/hooks/use-fetch-oEmbed';
import { useUploadComment } from '@/hooks/use-upload-comment';
import { $isAutoLinkNode, type AutoLinkNode } from '@lexical/link';
import { type LexicalEditor } from 'lexical';
import type { Session } from 'next-auth';
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';

export type CommentInputProps<TData> = {
  type: 'COMMENT' | 'SUB_COMMENT';
  session: Session;
  id: number;
  setComments: Dispatch<SetStateAction<TData[]>>;
  APIQuery: string;
};

function CommentInput<TData>({
  type,
  session,
  id,
  setComments,
  APIQuery,
}: CommentInputProps<TData>) {
  const editorRef = useRef<LexicalEditor>(null);
  const [hasText, setHasText] = useState(false);

  const {
    data: OEmbed,
    mutate: fetch,
    isLoading: isFetching,
  } = useFetchOEmbed();

  const { mutate: Upload, isLoading: isUploading } = useUploadComment({
    type,
    id,
    session,
    setComments,
    editorRef,
    APIQuery,
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
        id,
        content: editorRef.current.getEditorState().toJSON(),
        oEmbed: OEmbed,
      });
    }
  }, [OEmbed, Upload, id, isFetching, type]);

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
          id,
          content: editorRef.current.getEditorState().toJSON(),
        });
      } else {
        fetch(autoLinkNode.__url);
      }
    }
  }, [Upload, fetch, id, type]);

  return (
    <div className="mt-4 space-y-2">
      <MoetruyenEditor
        editorRef={editorRef}
        className="min-h-[8rem] overflow-y-auto scrollbar dark:scrollbar--dark"
      />
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
}

export default memo(CommentInput) as typeof CommentInput;
