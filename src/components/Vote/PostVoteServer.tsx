import type { Post, PostVote } from '@prisma/client';
import type { Session } from 'next-auth';
import { notFound } from 'next/navigation';
import { FC } from 'react';
import PostVoteClient from './PostVoteClient';

interface PostVoteServerProps {
  getData: () => Promise<(Pick<Post, 'id'> & { votes: PostVote[] }) | null>;
  session: Session | null;
}

const PostVoteServer: FC<PostVoteServerProps> = async ({
  getData,
  session,
}) => {
  const post = await getData();
  if (!post) return notFound();

  const voteAmt = post.votes.reduce((acc, vote) => {
    if (vote.type === 'UP_VOTE') return acc + 1;
    if (vote.type === 'DOWN_VOTE') return acc - 1;
    return acc;
  }, 0);

  const currentVote = post.votes.find(
    (vote) => vote.userId === session?.user.id
  )?.type;

  return (
    <PostVoteClient
      postId={post.id}
      voteAmt={voteAmt}
      currentVote={currentVote}
    />
  );
};

export default PostVoteServer;
