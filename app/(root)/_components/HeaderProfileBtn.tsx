"use client";

import LoginButton from '@/app/components/LoginButton';
import { UserButton } from '@clerk/nextjs';
import { Show } from '@clerk/react';
import { User } from 'lucide-react';

const HeaderProfileBtn = () => {
  return (
    <div className="flex items-center">
      <UserButton>
        <UserButton.MenuItems>
          <UserButton.Link
            label="Profile"
            labelIcon={<User className="size-4" />}
            href="/profile"
          />
        </UserButton.MenuItems>
      </UserButton>

      <Show when={'signed-out'}>
        <LoginButton />
      </Show>
    </div>
  );
}

export default HeaderProfileBtn