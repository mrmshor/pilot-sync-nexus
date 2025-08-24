import React from 'react';
import { Shield, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface SecurityIndicatorProps {
  hasSensitiveAccess: boolean;
  userRole?: 'owner' | 'admin' | 'member';
  className?: string;
}

export const SecurityIndicator: React.FC<SecurityIndicatorProps> = ({
  hasSensitiveAccess,
  userRole = 'member',
  className = ''
}) => {
  if (hasSensitiveAccess) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className={`bg-green-100 text-green-800 border-green-300 ${className}`}>
            <ShieldCheck className="w-3 h-3 ml-1" />
            גישה מלאה
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>יש לך גישה לכל נתוני הלקוח והמידע הפיננסי</p>
          <p>תפקיד: {userRole === 'owner' ? 'בעלים' : 'מנהל'}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="secondary" className={`bg-amber-100 text-amber-800 border-amber-300 ${className}`}>
          <Shield className="w-3 h-3 ml-1" />
          גישה מוגבלת
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>אין לך גישה לפרטי קשר של הלקוח ומידע פיננסי</p>
        <p>תפקיד: חבר צוות</p>
      </TooltipContent>
    </Tooltip>
  );
};