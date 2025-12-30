import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { IdentityVerification } from './IdentityVerification';
import {
  Calendar,
  IndianRupee,
  Loader2,
  Package,
  MessageCircle,
  Shield,
  Clock,
  Check,
} from 'lucide-react';

interface Listing {
  id: string;
  owner_user_id: string;
  product_name: string;
  description: string;
  images: string[];
  rent_price: number;
  pin_code: string;
}

interface RentalRequestDialogProps {
  listing: Listing;
  isOpen: boolean;
  onClose: () => void;
  onRequestCreated?: () => void;
}

export function RentalRequestDialog({
  listing,
  isOpen,
  onClose,
  onRequestCreated,
}: RentalRequestDialogProps) {
  const { user, userType } = useAuth();

  const [step, setStep] = useState<'details' | 'verification' | 'success'>('details');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const totalDays = calculateDays();
  const totalAmount = totalDays * listing.rent_price;

  const handleCreateRequest = async () => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please login to request a rental.',
        variant: 'destructive',
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: 'Dates required',
        description: 'Please select rental start and end dates.',
        variant: 'destructive',
      });
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      toast({
        title: 'Invalid dates',
        description: 'End date must be after start date.',
        variant: 'destructive',
      });
      return;
    }

    if (new Date(startDate) < new Date()) {
      toast({
        title: 'Invalid dates',
        description: 'Start date cannot be in the past.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Create rental request via API
      const response = await api.post('/users/rental-requests', {
        listingId: listing.id,
        ownerId: listing.owner_user_id,
        rentalStartDate: startDate,
        rentalEndDate: endDate,
        totalDays,
        totalAmount,
        message: message || null,
      });

      const requestData = response.data;
      setCreatedRequestId(requestData.id);

      toast({
        title: 'Request created',
        description: 'Now please upload your identity document to complete the request.',
      });

      setStep('verification');
    } catch (error: any) {
      console.error('Error creating request:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create rental request. Please try again.';
      toast({
        title: 'Request failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmitted = () => {
    setStep('success');
    onRequestCreated?.();
  };

  const handleClose = () => {
    setStep('details');
    setStartDate('');
    setEndDate('');
    setMessage('');
    setCreatedRequestId(null);
    onClose();
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        {step === 'details' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#E5383B]" />
                Request to Rent
              </DialogTitle>
              <DialogDescription>
                Fill in the rental details. You'll need to verify your identity before the owner can approve.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Listing Preview */}
              <Card className="p-4 flex gap-4">
                <img
                  src={listing.images?.[0] || '/placeholder.svg'}
                  alt={listing.product_name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-bold">{listing.product_name}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
                  <p className="text-[#E5383B] font-bold mt-1">₹{listing.rent_price}/day</p>
                </div>
              </Card>

              {/* Date Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Start Date *
                  </Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={today}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    End Date *
                  </Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || today}
                  />
                </div>
              </div>

              {/* Cost Summary */}
              {totalDays > 0 && (
                <Card className="p-4 bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{totalDays} day{totalDays > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">Rate</span>
                    <span className="font-medium">₹{listing.rent_price}/day</span>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-[#E5383B]">₹{totalAmount}</span>
                  </div>
                </Card>
              )}

              {/* Message */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  Message to Owner (Optional)
                </Label>
                <Textarea
                  placeholder="Add a message for the owner..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Info */}
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <p className="text-xs text-blue-600 flex items-start gap-2">
                  <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  After submitting, you'll need to upload a government ID for verification. The owner will review and approve your request.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateRequest}
                disabled={!startDate || !endDate || loading}
                className="bg-[#E5383B] hover:bg-[#BA181B]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Continue to Verification
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'verification' && createdRequestId && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                Verify Your Identity
              </DialogTitle>
              <DialogDescription>
                Upload a government-issued ID to complete your rental request.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <IdentityVerification
                rentalRequestId={createdRequestId}
                onVerificationSubmitted={handleVerificationSubmitted}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Skip for Now
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'success' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-500">
                <Check className="w-5 h-5" />
                Request Submitted!
              </DialogTitle>
            </DialogHeader>

            <div className="py-8 text-center">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Your request has been submitted!</h3>
              <p className="text-muted-foreground">
                The owner will review your request and identity document. You'll be notified once they respond.
              </p>

              <Card className="p-4 mt-6 bg-muted/50">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <div className="text-left">
                    <p className="font-medium">What happens next?</p>
                    <p className="text-sm text-muted-foreground">
                      The owner will verify your ID and approve or decline your request. Check your inbox for updates.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
