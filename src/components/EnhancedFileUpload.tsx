import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Camera, FileText, Image, X, RotateCcw, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnhancedFileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label?: string;
  currentFile?: string;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
  allowCamera?: boolean; // Option to disable camera for non-image uploads
}

const EnhancedFileUpload: React.FC<EnhancedFileUploadProps> = ({
  onFileSelect,
  accept = "image/*",
  label = "Upload File",
  currentFile,
  maxSize = 10,
  className = "",
  disabled = false,
  allowCamera = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { toast } = useToast();

  // Check if the accept type includes images
  const isImageUpload = accept.includes('image');
  const shouldShowCamera = allowCamera && isImageUpload;

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `File size must be less than ${maxSize}MB`,
        variant: "destructive"
      });
      return false;
    }

    // Check file type if accept is specified
    if (accept && accept !== "*/*") {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        } else if (type.includes('*')) {
          const baseType = type.split('/')[0];
          return file.type.startsWith(baseType);
        } else {
          return file.type === type;
        }
      });

      if (!isAccepted) {
        toast({
          title: "Invalid file type",
          description: `Please select a file of type: ${accept}`,
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
      setIsOpen(false);
      toast({
        title: "File selected",
        description: `${file.name} has been selected successfully`,
      });
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startCamera = async () => {
    setIsCameraLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'environment' // Use back camera on mobile if available
        }
      });
      
      setCameraStream(stream);
      setShowCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to take photos",
        variant: "destructive"
      });
    } finally {
      setIsCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
    setCapturedImage(null);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageDataUrl);
      }
    }
  };

  const confirmCapture = () => {
    if (capturedImage && canvasRef.current) {
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `captured-${Date.now()}.jpg`, {
            type: 'image/jpeg'
          });
          
          if (validateFile(file)) {
            onFileSelect(file);
            stopCamera();
            setIsOpen(false);
            toast({
              title: "Photo captured",
              description: "Photo has been captured successfully",
            });
          }
        }
      }, 'image/jpeg', 0.8);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const closeDialog = () => {
    stopCamera();
    setIsOpen(false);
  };

  const getFileIcon = () => {
    if (isImageUpload) {
      return <Image className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className={className}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className="w-full flex items-center gap-2"
          >
            {getFileIcon()}
            {label}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getFileIcon()}
              {label}
            </DialogTitle>
          </DialogHeader>

          {!showCamera ? (
            <div className="space-y-4">
              {/* Current file display */}
              {currentFile && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current file:</span>
                      <Badge variant="secondary">{currentFile}</Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Upload options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* File upload option */}
                <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardContent className="p-6">
                    <Button
                      variant="ghost"
                      className="w-full h-auto p-0 flex flex-col items-center gap-3"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="p-4 bg-blue-100 rounded-full">
                        <Upload className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-semibold">Upload From File</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Choose a file from your device
                        </p>
                      </div>
                    </Button>
                  </CardContent>
                </Card>

                {/* Camera option */}
                {shouldShowCamera && (
                  <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <CardContent className="p-6">
                      <Button
                        variant="ghost"
                        className="w-full h-auto p-0 flex flex-col items-center gap-3"
                        onClick={startCamera}
                        disabled={isCameraLoading}
                      >
                        <div className="p-4 bg-green-100 rounded-full">
                          <Camera className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="text-center">
                          <h3 className="font-semibold">Take A Picture</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {isCameraLoading ? 'Loading camera...' : 'Use your camera to capture'}
                          </p>
                        </div>
                      </Button>
                    </CardContent>
                </Card>
                )}
              </div>

              {/* File type info */}
              <div className="text-center text-sm text-gray-500">
                <p>Accepted file types: {accept}</p>
                <p>Maximum file size: {maxSize}MB</p>
              </div>
            </div>
          ) : (
            /* Camera interface */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Camera</h3>
                <Button variant="ghost" size="sm" onClick={closeDialog}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="relative bg-black rounded-lg overflow-hidden">
                {!capturedImage ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 md:h-96 object-cover"
                  />
                ) : (
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-64 md:h-96 object-cover"
                  />
                )}
                
                {/* Hidden canvas for capture */}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex justify-center gap-4">
                {!capturedImage ? (
                  <>
                    <Button onClick={capturePhoto} className="flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Capture
                    </Button>
                    <Button variant="outline" onClick={stopCamera}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={confirmCapture} className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Use This Photo
                    </Button>
                    <Button variant="outline" onClick={retakePhoto} className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Retake
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default EnhancedFileUpload;