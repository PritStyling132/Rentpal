import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadApi } from '@/lib/api';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import {
  Shield,
  Upload,
  FileText,
  CreditCard,
  Car,
  Globe,
  Vote,
  Loader2,
  Check,
  X,
  AlertTriangle,
  Image as ImageIcon,
} from 'lucide-react';

interface IdentityVerificationProps {
  rentalRequestId: string;
  onVerificationSubmitted?: () => void;
  existingVerification?: {
    id: string;
    document_type: string;
    document_url: string;
    verification_status: string;
    rejection_reason?: string;
  } | null;
}

const documentTypes = [
  { value: 'aadhar', label: 'Aadhar Card', icon: CreditCard },
  { value: 'pan', label: 'PAN Card', icon: FileText },
  { value: 'driving_license', label: 'Driving License', icon: Car },
  { value: 'passport', label: 'Passport', icon: Globe },
  { value: 'voter_id', label: 'Voter ID', icon: Vote },
];

export function IdentityVerification({
  rentalRequestId,
  onVerificationSubmitted,
  existingVerification,
}: IdentityVerificationProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [documentType, setDocumentType] = useState<string>('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPG, PNG, or PDF file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async () => {
    if (!documentType) {
      toast({
        title: 'Document type required',
        description: 'Please select a document type.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedFile) {
      toast({
        title: 'Document required',
        description: 'Please upload your identity document.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      // Upload file to Cloudinary via API
      const uploadResult = await uploadApi.uploadImage(selectedFile, 'identity');
      const documentUrl = uploadResult.url;

      // Create identity verification record via API
      await api.post('/users/identity-verification', {
        rentalRequestId,
        documentType,
        documentUrl,
        documentNumber: documentNumber || null,
      });

      toast({
        title: 'Document submitted',
        description: 'Your identity document has been submitted for verification.',
      });

      setIsOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setDocumentType('');
      setDocumentNumber('');

      onVerificationSubmitted?.();
    } catch (error: any) {
      console.error('Error submitting verification:', error);
      toast({
        title: 'Submission failed',
        description: error.response?.data?.error || error.message || 'Failed to submit your document. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusDisplay = () => {
    if (!existingVerification) return null;

    switch (existingVerification.verification_status) {
      case 'pending':
        return (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
            <div>
              <p className="font-medium text-amber-500">Verification Pending</p>
              <p className="text-xs text-muted-foreground">The owner is reviewing your document</p>
            </div>
          </div>
        );
      case 'approved':
        return (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
            <Check className="w-5 h-5 text-green-500" />
            <div>
              <p className="font-medium text-green-500">Verified</p>
              <p className="text-xs text-muted-foreground">Your identity has been verified</p>
            </div>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <X className="w-5 h-5 text-red-500" />
            <div>
              <p className="font-medium text-red-500">Rejected</p>
              <p className="text-xs text-muted-foreground">
                {existingVerification.rejection_reason || 'Your document was not accepted'}
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {existingVerification ? (
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-5 h-5 text-blue-500" />
            <h4 className="font-semibold">Identity Verification</h4>
          </div>
          {getStatusDisplay()}
          {existingVerification.verification_status === 'rejected' && (
            <Button
              onClick={() => setIsOpen(true)}
              className="w-full mt-3 bg-blue-500 hover:bg-blue-600"
            >
              <Upload className="w-4 h-4 mr-2" />
              Resubmit Document
            </Button>
          )}
        </Card>
      ) : (
        <Card className="p-4 border-amber-500/30 bg-amber-500/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-amber-500">Identity Verification Required</h4>
              <p className="text-sm text-muted-foreground mt-1">
                To complete your rental request, please upload a valid government-issued ID.
              </p>
              <Button
                onClick={() => setIsOpen(true)}
                className="mt-3 bg-amber-500 hover:bg-amber-600"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Identity Document
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              Identity Verification
            </DialogTitle>
            <DialogDescription>
              Upload a clear photo of your government-issued ID. This helps owners verify your identity.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Document Type Selection */}
            <div className="space-y-2">
              <Label>Document Type *</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((doc) => (
                    <SelectItem key={doc.value} value={doc.value}>
                      <div className="flex items-center gap-2">
                        <doc.icon className="w-4 h-4" />
                        {doc.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Document Number (Optional) */}
            <div className="space-y-2">
              <Label>Document Number (Optional)</Label>
              <Input
                placeholder="Enter document number"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This helps in quick verification
              </p>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Upload Document *</Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                {previewUrl ? (
                  <div className="space-y-2">
                    <img
                      src={previewUrl}
                      alt="Document preview"
                      className="max-h-48 mx-auto rounded-lg"
                    />
                    <p className="text-sm text-muted-foreground">{selectedFile?.name}</p>
                    <Button variant="outline" size="sm" onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}>
                      Change File
                    </Button>
                  </div>
                ) : selectedFile ? (
                  <div className="space-y-2">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground" />
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground" />
                    <p className="text-sm font-medium">Click to upload</p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or PDF (max 5MB)
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Privacy Notice */}
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">
                <Shield className="w-3 h-3 inline mr-1" />
                Your document is securely stored and only shared with the item owner for verification purposes.
                It will be deleted after the rental is completed.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!documentType || !selectedFile || uploading}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Document
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
