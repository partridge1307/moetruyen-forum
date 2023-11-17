import UserAvatar from '@/components/User/UserAvatar';
import Username from '@/components/User/Username';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/Accordion';
import type { Subscription, User } from '@prisma/client';
import { FC } from 'react';

interface MembersProps {
  subscription: (Pick<Subscription, 'isManager'> & {
    user: Pick<User, 'name' | 'color' | 'image'>;
  })[];
}

const Members: FC<MembersProps> = ({ subscription }) => {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="members">
        <AccordionTrigger>Thành viên</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3">
            {subscription.map(({ user, isManager }, idx) => (
              <a
                key={idx}
                href={`${process.env.NEXT_PUBLIC_MAIN_URL}/user/${user.name
                  ?.split(' ')
                  .join('-')}`}
                className="flex items-center gap-2 rounded-full hover:bg-primary-foreground"
              >
                <UserAvatar user={user} />
                <Username user={user} className="text-start" />
                {isManager && (
                  <div className="shrink-0 text-xs p-1 rounded-lg bg-primary text-primary-foreground">
                    MOD
                  </div>
                )}
              </a>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default Members;
