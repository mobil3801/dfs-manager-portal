import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface RealtimeStatusIndicatorProps {
  isConnected: boolean;
  lastUpdate?: Date | null;
  className?: string;
  showLabel?: boolean;
}

const RealtimeStatusIndicator: React.FC<RealtimeStatusIndicatorProps> = ({
  isConnected,
  lastUpdate,
  className = '',
  showLabel = true
}) => {
  const formatLastUpdate = (date: Date | null) => {
    if (!date) return 'No updates yet';

    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) {// Less than 1 minute
      return 'Just now';
    } else if (diff < 3600000) {// Less than 1 hour
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    } else if (diff < 86400000) {// Less than 1 day
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const statusIcon = isConnected ?
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>

      <Wifi className="h-3 w-3" />
    </motion.div> :

  <WifiOff className="h-3 w-3" />;


  const statusColor = isConnected ? 'bg-green-500' : 'bg-red-500';
  const statusText = isConnected ? 'Connected' : 'Disconnected';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-2 ${className}`}>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${statusColor} text-white text-xs`}>
              {statusIcon}
              {showLabel && <span>{statusText}</span>}
            </div>
            {lastUpdate &&
            <Badge variant="outline" className="text-xs">
                <RefreshCw className="h-3 w-3 mr-1" />
                {formatLastUpdate(lastUpdate)}
              </Badge>
            }
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <div className="font-medium">Real-time Status</div>
            <div>Status: {statusText}</div>
            {lastUpdate &&
            <div>Last update: {formatLastUpdate(lastUpdate)}</div>
            }
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>);

};

export default RealtimeStatusIndicator;