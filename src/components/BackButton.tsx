import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

const BackButton: React.FC<BackButtonProps> = ({
  className = '',
  variant = 'ghost',
  size = 'sm'
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to dashboard if no history
      navigate('/dashboard');
    }
  };

  // Don't show back button on login, register, or dashboard pages
  const hideOnPaths = ['/login', '/onauthsuccess', '/resetpassword', '/dashboard', '/'];
  if (hideOnPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <Button
      onClick={handleBack}
      variant={variant}
      size={size}
      className={`flex items-center gap-2 ${className}`}>

      <ArrowLeft className="w-4 h-4" />
      <span className="hidden sm:inline">Back</span>
    </Button>);

};

export default BackButton;