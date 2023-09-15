'use client';

import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Button } from '../ui/Button';

const SignOutButton = () => {
  return (
    <Button
      variant={'destructive'}
      className="w-full"
      onClick={() => signOut()}
    >
      <LogOut className="w-5 h-5" />
      <span>Đăng xuất</span>
    </Button>
  );
};

export default SignOutButton;
