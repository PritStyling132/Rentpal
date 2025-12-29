import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { useCoupons, createCoupon, updateCoupon, deleteCoupon } from '@/hooks/useCoupons';
import { Loader2, Plus, Trash2, Edit } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const CouponManagement = () => {
  const { coupons, loading, refetch } = useCoupons();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    is_percentage: true,
    discount_percentage: 0,
    discount_amount: 0,
    usage_limit: '',
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: '',
  });

  const handleCreate = async () => {
    if (!formData.code) {
      toast({
        title: 'Code required',
        description: 'Please enter a coupon code',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    const success = await createCoupon({
      code: formData.code,
      is_percentage: formData.is_percentage,
      discount_percentage: formData.is_percentage ? formData.discount_percentage : 0,
      discount_amount: !formData.is_percentage ? formData.discount_amount : 0,
      usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : undefined,
      valid_from: formData.valid_from,
      valid_until: formData.valid_until || undefined,
    });

    if (success) {
      toast({
        title: 'Coupon created',
        description: 'Coupon has been created successfully',
      });
      setFormData({
        code: '',
        is_percentage: true,
        discount_percentage: 0,
        discount_amount: 0,
        usage_limit: '',
        valid_from: new Date().toISOString().split('T')[0],
        valid_until: '',
      });
      refetch();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to create coupon',
        variant: 'destructive',
      });
    }
    setIsCreating(false);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const success = await updateCoupon(id, { active: !currentStatus });
    if (success) {
      toast({
        title: 'Status updated',
        description: `Coupon ${!currentStatus ? 'activated' : 'deactivated'}`,
      });
      refetch();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    
    const success = await deleteCoupon(id);
    if (success) {
      toast({
        title: 'Coupon deleted',
        description: 'Coupon has been removed',
      });
      refetch();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-8">
            Coupon Management
          </h1>

          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Create New Coupon</h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Coupon Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="SAVE10"
                    className="font-mono"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <RadioGroup
                    value={formData.is_percentage ? 'percentage' : 'amount'}
                    onValueChange={(value) => setFormData({ ...formData, is_percentage: value === 'percentage' })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="percentage" id="percentage" />
                      <Label htmlFor="percentage">Percentage</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="amount" id="amount" />
                      <Label htmlFor="amount">Fixed Amount</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {formData.is_percentage ? (
                  <div className="space-y-2">
                    <Label htmlFor="discount_percentage">Discount Percentage (%)</Label>
                    <Input
                      id="discount_percentage"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount_percentage}
                      onChange={(e) => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="discount_amount">Discount Amount (₹)</Label>
                    <Input
                      id="discount_amount"
                      type="number"
                      min="0"
                      value={formData.discount_amount}
                      onChange={(e) => setFormData({ ...formData, discount_amount: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="usage_limit">Usage Limit (Optional)</Label>
                  <Input
                    id="usage_limit"
                    type="number"
                    min="1"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valid_from">Valid From</Label>
                  <Input
                    id="valid_from"
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valid_until">Valid Until (Optional)</Label>
                  <Input
                    id="valid_until"
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  />
                </div>
              </div>

              <Button
                onClick={handleCreate}
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Coupon
                  </>
                )}
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Active Coupons</h2>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              </div>
            ) : coupons.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No coupons created yet</p>
            ) : (
              <div className="space-y-4">
                {coupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="border border-border rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <code className="text-lg font-bold font-mono bg-accent/10 px-3 py-1 rounded">
                          {coupon.code}
                        </code>
                        <span className="text-accent font-semibold">
                          {coupon.is_percentage 
                            ? `${coupon.discount_percentage}% OFF`
                            : `₹${coupon.discount_amount} OFF`
                          }
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Used: {coupon.used_count} {coupon.usage_limit ? `/ ${coupon.usage_limit}` : ''}</p>
                        <p>Valid: {new Date(coupon.valid_from).toLocaleDateString()} - {coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString() : 'No expiry'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`active-${coupon.id}`} className="text-sm">Active</Label>
                        <Switch
                          id={`active-${coupon.id}`}
                          checked={coupon.active}
                          onCheckedChange={() => handleToggleActive(coupon.id, coupon.active)}
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(coupon.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CouponManagement;
