import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertTriangle,
  Clock,
  User,
  Server,
  GitMerge,
  Check,
  X,
  Eye,
  RefreshCw } from
'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface ConflictData {
  id: string;
  table: string;
  recordId: number;
  local: any;
  server: any;
  timestamp: Date;
  field: string;
  resolved?: boolean;
}

interface ConflictResolutionDialogProps {
  conflicts: ConflictData[];
  isOpen: boolean;
  onClose: () => void;
  onResolve: (conflictId: string, resolution: 'local' | 'server' | 'merge', mergedData?: any) => void;
  onResolveAll: (resolution: 'local' | 'server') => void;
}

const ConflictResolutionDialog: React.FC<ConflictResolutionDialogProps> = ({
  conflicts,
  isOpen,
  onClose,
  onResolve,
  onResolveAll
}) => {
  const [selectedConflict, setSelectedConflict] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [mergeData, setMergeData] = useState<any>({});

  const unresolvedConflicts = conflicts.filter((c) => !c.resolved);
  const resolvedConflicts = conflicts.filter((c) => c.resolved);

  const handleResolve = (conflictId: string, resolution: 'local' | 'server' | 'merge') => {
    const conflict = conflicts.find((c) => c.id === conflictId);
    if (!conflict) return;

    if (resolution === 'merge') {
      const merged = { ...conflict.server, ...mergeData[conflictId] };
      onResolve(conflictId, resolution, merged);
    } else {
      onResolve(conflictId, resolution);
    }

    setMergeData((prev) => {
      const { [conflictId]: removed, ...rest } = prev;
      return rest;
    });
  };

  const renderDataComparison = (conflict: ConflictData) => {
    const localData = conflict.local || {};
    const serverData = conflict.server || {};
    const allKeys = new Set([...Object.keys(localData), ...Object.keys(serverData)]);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="w-4 h-4" />
                Your Changes (Local)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.from(allKeys).map((key) => {
                const localValue = localData[key];
                const serverValue = serverData[key];
                const hasConflict = localValue !== serverValue;

                return (
                  <div key={key} className={`p-2 rounded ${hasConflict ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
                    <div className="font-medium text-xs text-gray-600 mb-1">{key}</div>
                    <div className="text-sm font-mono">
                      {localValue !== undefined ? String(localValue) : <span className="text-gray-400">undefined</span>}
                    </div>
                  </div>);

              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Server className="w-4 h-4" />
                Server Changes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.from(allKeys).map((key) => {
                const localValue = localData[key];
                const serverValue = serverData[key];
                const hasConflict = localValue !== serverValue;

                return (
                  <div key={key} className={`p-2 rounded ${hasConflict ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                    <div className="font-medium text-xs text-gray-600 mb-1">{key}</div>
                    <div className="text-sm font-mono">
                      {serverValue !== undefined ? String(serverValue) : <span className="text-gray-400">undefined</span>}
                    </div>
                  </div>);

              })}
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => handleResolve(conflict.id, 'local')}
            className="flex items-center gap-2">

            <User className="w-4 h-4" />
            Keep Your Changes
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleResolve(conflict.id, 'server')}
            className="flex items-center gap-2">

            <Server className="w-4 h-4" />
            Accept Server Changes
          </Button>
          
          <Button
            variant="default"
            onClick={() => setShowDetails(conflict.id)}
            className="flex items-center gap-2">

            <GitMerge className="w-4 h-4" />
            Custom Merge
          </Button>
        </div>

        {showDetails === conflict.id &&
        <Card className="border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <GitMerge className="w-4 h-4" />
                Custom Merge - Choose Values for Each Field
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from(allKeys).map((key) => {
              const localValue = localData[key];
              const serverValue = serverData[key];
              const hasConflict = localValue !== serverValue;

              if (!hasConflict) {
                return (
                  <div key={key} className="p-2 bg-gray-50 rounded">
                      <div className="font-medium text-xs text-gray-600 mb-1">{key}</div>
                      <div className="text-sm font-mono">{String(localValue)}</div>
                      <div className="text-xs text-gray-500">No conflict - keeping existing value</div>
                    </div>);

              }

              return (
                <div key={key} className="space-y-2">
                    <div className="font-medium text-sm">{key}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                      variant={mergeData[conflict.id]?.[key] === localValue ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMergeData((prev) => ({
                        ...prev,
                        [conflict.id]: { ...prev[conflict.id], [key]: localValue }
                      }))}
                      className="justify-start text-left h-auto p-2">

                        <div>
                          <div className="text-xs text-gray-500 mb-1">Your version</div>
                          <div className="font-mono text-sm">{String(localValue)}</div>
                        </div>
                      </Button>
                      
                      <Button
                      variant={mergeData[conflict.id]?.[key] === serverValue ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMergeData((prev) => ({
                        ...prev,
                        [conflict.id]: { ...prev[conflict.id], [key]: serverValue }
                      }))}
                      className="justify-start text-left h-auto p-2">

                        <div>
                          <div className="text-xs text-gray-500 mb-1">Server version</div>
                          <div className="font-mono text-sm">{String(serverValue)}</div>
                        </div>
                      </Button>
                    </div>
                  </div>);

            })}
              
              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <Button
                variant="outline"
                onClick={() => setShowDetails(null)}>

                  Cancel
                </Button>
                <Button
                onClick={() => {
                  handleResolve(conflict.id, 'merge');
                  setShowDetails(null);
                }}
                disabled={!mergeData[conflict.id]}
                className="flex items-center gap-2">

                  <Check className="w-4 h-4" />
                  Apply Merge
                </Button>
              </div>
            </CardContent>
          </Card>
        }
      </div>);

  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Data Conflicts Detected
            </span>
            {unresolvedConflicts.length > 1 &&
            <div className="flex items-center gap-2">
                <Button
                variant="outline"
                size="sm"
                onClick={() => onResolveAll('local')}
                className="flex items-center gap-1">

                  <User className="w-3 h-3" />
                  Keep All Local
                </Button>
                <Button
                variant="outline"
                size="sm"
                onClick={() => onResolveAll('server')}
                className="flex items-center gap-1">

                  <Server className="w-3 h-3" />
                  Accept All Server
                </Button>
              </div>
            }
          </DialogTitle>
        </DialogHeader>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Data conflicts have been detected due to concurrent modifications. 
            Please review and resolve each conflict to continue.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="unresolved" className="w-full">
          <TabsList>
            <TabsTrigger value="unresolved" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Unresolved ({unresolvedConflicts.length})
            </TabsTrigger>
            <TabsTrigger value="resolved" className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Resolved ({resolvedConflicts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unresolved">
            <ScrollArea className="h-96">
              <AnimatePresence>
                {unresolvedConflicts.length === 0 ?
                <div className="text-center py-8 text-muted-foreground">
                    <Check className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p>All conflicts have been resolved!</p>
                  </div> :

                <div className="space-y-4">
                    {unresolvedConflicts.map((conflict) =>
                  <motion.div
                    key={conflict.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -300 }}
                    transition={{ duration: 0.2 }}>

                        <Card className="border-yellow-200 bg-yellow-50/50">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="destructive">Conflict</Badge>
                                <span className="font-medium text-sm">
                                  {conflict.table} - Record #{conflict.recordId}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {format(conflict.timestamp, 'MMM dd, HH:mm:ss')}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {selectedConflict === conflict.id ?
                        <div className="space-y-4">
                                {renderDataComparison(conflict)}
                                <div className="flex justify-end">
                                  <Button
                              variant="ghost"
                              onClick={() => setSelectedConflict(null)}
                              className="flex items-center gap-2">

                                    <Eye className="w-4 h-4" />
                                    Hide Details
                                  </Button>
                                </div>
                              </div> :

                        <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                  Field: <span className="font-medium">{conflict.field}</span>
                                </div>
                                <Button
                            variant="outline"
                            onClick={() => setSelectedConflict(conflict.id)}
                            className="flex items-center gap-2">

                                  <Eye className="w-4 h-4" />
                                  View Details
                                </Button>
                              </div>
                        }
                          </CardContent>
                        </Card>
                      </motion.div>
                  )}
                  </div>
                }
              </AnimatePresence>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="resolved">
            <ScrollArea className="h-96">
              {resolvedConflicts.length === 0 ?
              <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No resolved conflicts yet</p>
                </div> :

              <div className="space-y-2">
                  {resolvedConflicts.map((conflict) =>
                <Card key={conflict.id} className="border-green-200 bg-green-50/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="font-medium text-sm">
                              {conflict.table} - Record #{conflict.recordId}
                            </span>
                            <Badge variant="success" className="bg-green-500 text-white">
                              Resolved
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(conflict.timestamp, 'MMM dd, HH:mm:ss')}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                )}
                </div>
              }
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={unresolvedConflicts.length > 0}>

            {unresolvedConflicts.length > 0 ? 'Resolve All Conflicts First' : 'Close'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>);

};

export default ConflictResolutionDialog;