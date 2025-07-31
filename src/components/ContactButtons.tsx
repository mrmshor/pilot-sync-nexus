import React from 'react';
import { ContactService } from '../services';
import { Button } from './ui/button';
import { MessageCircle, Phone, Mail } from 'lucide-react';

interface ContactButtonsProps {
  phone?: string;
  whatsapp?: string;
  email?: string;
  className?: string;
}

export const ContactButtons: React.FC<ContactButtonsProps> = ({
  phone,
  whatsapp,
  email,
  className = ""
}) => {
  const handlePhoneCall = (phoneNumber: string) => {
    ContactService.makePhoneCall(phoneNumber);
  };

  const handleWhatsApp = (phoneNumber: string) => {
    ContactService.openWhatsApp(phoneNumber);
  };

  const handleEmail = (emailAddress: string) => {
    ContactService.sendEmail(emailAddress);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      {phone && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePhoneCall(phone)}
          className="flex items-center gap-1 h-8 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 transition-all duration-200"
          title={`טלפון: ${ContactService.formatPhoneForDisplay(phone)}`}
        >
          <Phone className="w-3 h-3" />
          <span className="hidden sm:inline">טלפון</span>
        </Button>
      )}

      {whatsapp && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleWhatsApp(whatsapp)}
          className="flex items-center gap-1 h-8 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 transition-all duration-200"
          title={`וואטסאפ: ${ContactService.formatPhoneForDisplay(whatsapp)}`}
        >
          <MessageCircle className="w-3 h-3" />
          <span className="hidden sm:inline">וואטסאפ</span>
        </Button>
      )}

      {email && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleEmail(email)}
          className="flex items-center gap-1 h-8 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 transition-all duration-200"
          title={`אימייל: ${email}`}
        >
          <Mail className="w-3 h-3" />
          <span className="hidden sm:inline">אימייל</span>
        </Button>
      )}
    </div>
  );
};

// דוגמה לשימוש:
// <ContactButtons 
//   phone="050-1234567" 
//   whatsapp="0541234567" 
//   email="example@gmail.com" 
// />

export default ContactButtons;