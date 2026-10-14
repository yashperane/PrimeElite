import React from 'react';
import * as Icons from 'lucide-react';

/**
 * Renders a Lucide icon by string name with consistent sizing and zero emoji
 */
export const LucideIcon = ({
  name = 'BookOpen',
  size = 20,
  className = '',
  strokeWidth = 1.75,
  ...props
}) => {
  const IconComponent = Icons[name] || Icons.BookOpen;
  return (
    <IconComponent
      size={size}
      strokeWidth={strokeWidth}
      className={`inline-block ${className}`}
      {...props}
    />
  );
};
