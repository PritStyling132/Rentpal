import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface TermsDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const TermsDialog = ({ children, open, onOpenChange }: TermsDialogProps) => {
  const [terms, setTerms] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await api.get('/admin/terms');
        const data = response.data;
        setTerms(data?.content || 'No terms and conditions available.');
      } catch (error) {
        console.error('Error fetching terms:', error);
        setTerms('Unable to load terms and conditions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Terms and Conditions</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {terms.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-foreground whitespace-pre-wrap">
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
