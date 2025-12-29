import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { LoginNavbar } from '@/components/LoginNavbar';
import { usePackages, Package } from '@/hooks/usePackages';
import { Loader2, Plus, Pencil, Trash2, Package as PackageIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const PackageManagement = () => {
  const navigate = useNavigate();
  const { packages, isLoading, createPackage, updatePackage, deletePackage } = usePackages();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    features: [''],
    active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const packageData = {
      name: formData.name,
      price: Number(formData.price),
      description: formData.description,
      features: formData.features.filter(f => f.trim() !== ''),
      active: formData.active,
    };

    if (editingId) {
      await updatePackage.mutateAsync({ id: editingId, ...packageData });
      setEditingId(null);
    } else {
      await createPackage.mutateAsync(packageData);
    }

    setFormData({ name: '', price: '', description: '', features: [''], active: true });
  };

  const handleEdit = (pkg: Package) => {
    setEditingId(pkg.id);
    setFormData({
      name: pkg.name,
      price: String(pkg.price),
      description: pkg.description,
      features: pkg.features.length > 0 ? pkg.features : [''],
      active: pkg.active,
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      await deletePackage.mutateAsync(id);
    }
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  return (
    <div className="min-h-screen bg-background">
      <LoginNavbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <PackageIcon className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Package Management</h1>
            </div>
            <Button variant="outline" onClick={() => navigate('/admin')}>
              Back to Dashboard
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Form */}
            <Card className="p-6 h-fit">
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {editingId ? 'Edit Package' : 'Create Package'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Package Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Basic, Premium, Enterprise"
                    required
                  />
                </div>

                <div>
                  <Label>Price (₹)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Enter price"
                    required
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what's included in this package"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label>Features</Label>
                  <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          placeholder="Enter feature"
                        />
                        {formData.features.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeFeature(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addFeature} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Feature
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={createPackage.isPending || updatePackage.isPending}>
                    {(createPackage.isPending || updatePackage.isPending) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingId ? 'Update' : 'Create'} Package
                  </Button>
                  {editingId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingId(null);
                        setFormData({ name: '', price: '', description: '', features: [''], active: true });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Card>

            {/* List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Existing Packages</h2>
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : packages.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No packages yet. Create your first one!</p>
                </Card>
              ) : (
                packages.map((pkg) => (
                  <Card key={pkg.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                          {pkg.name}
                          {!pkg.active && (
                            <span className="text-xs bg-secondary text-muted-foreground px-2 py-1 rounded">
                              Inactive
                            </span>
                          )}
                        </h3>
                        <p className="text-2xl font-bold text-primary">₹{pkg.price}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="icon" variant="outline" onClick={() => handleEdit(pkg)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleDelete(pkg.id)}
                          disabled={deletePackage.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{pkg.description}</p>
                    {pkg.features.length > 0 && (
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {pkg.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="text-primary">✓</span> {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageManagement;
