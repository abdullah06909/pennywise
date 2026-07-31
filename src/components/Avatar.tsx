import React, { useEffect, useState } from 'react';

interface AvatarProps {
  photoURL?: string | null;
  name?: string | null;
  email?: string | null;
  className?: string;
  initialClassName?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ photoURL, name, email, className, initialClassName = 'text-sm' }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [photoURL]);

  return (
    <div className={className}>
      {photoURL && !failed ? (
        <img
          src={photoURL}
          alt={name ?? 'User'}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className={`font-black text-accent-purple uppercase ${initialClassName}`}>
          {(name || email || '?').charAt(0)}
        </span>
      )}
    </div>
  );
};
