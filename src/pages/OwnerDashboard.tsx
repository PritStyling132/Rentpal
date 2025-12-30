import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { ownerApi, listingsApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import {
  Package,
  Users,
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Star,
  FileText,
  Download,
  Plus,
  Activity,
  Shield,
  AlertTriangle,
  Calendar,
  MessageCircle,
  Image as ImageIcon,
  ChevronRight,
  Building2,
  BarChart3,
  Wallet,
  FileCheck,
  RefreshCw,
} from 'lucide-react';

interface RentalRequest {
  id: string;
  listingId: string;
  renterId: string;
  status: string;
  rentalStartDate: string | null;
  rentalEndDate: string | null;
  totalDays: number | null;
  totalAmount: number | null;
  message: string | null;
  ownerNotes: string | null;
  createdAt: string;
  listing?: {
    productName: string;
    images: string[];
    rentPrice: number;
  };
  renter?: {
    name: string;
    phone: string;
    avatarUrl: string | null;
  };
  identityVerification?: {
    id: string;
    documentType: string;
    documentUrl: string;
    verificationStatus: string;
  } | null;
}

interface OwnerStats {
  totalListings: number;
  activeListings: number;
  pendingRequests: number;
  approvedRequests: number;
  completedRentals: number;
  totalEarnings: number;
  pendingEarnings: number;
  totalViews: number;
  averageRating: number;
}

interface Listing {
  id: string;
  productName: string;
  description: string;
  images: string[];
  rentPrice: number;
  listingStatus: string;
  availability: boolean;
  views: number;
  rating: number;
  createdAt: string;
}

interface ActivityLog {
  id: string;
  action: string;
  targetType: string;
  details: any;
  createdAt: string;
}

const OwnerDashboard = () => {
  const { user, isOwner, profile, authReady } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<OwnerStats>({
    totalListings: 0,
    activeListings: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    completedRentals: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    totalViews: 0,
    averageRating: 0,
  });
  const [rentalRequests, setRentalRequests] = useState<RentalRequest[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Dialog states
  const [selectedRequest, setSelectedRequest] = useState<RentalRequest | null>(null);
  const [viewDocumentDialog, setViewDocumentDialog] = useState(false);
  const [approveDialog, setApproveDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [ownerNotesInput, setOwnerNotesInput] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    if (authReady && (!user || !isOwner)) {
      navigate('/');
      return;
    }

    if (user && isOwner) {
      fetchDashboardData();
    }
  }, [user, isOwner, authReady, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchRentalRequests(),
        fetchListings(),
        fetchActivityLogs(),
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await ownerApi.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRentalRequests = async () => {
    try {
      const requests = await ownerApi.getRentalRequests();
      setRentalRequests(requests || []);
    } catch (error) {
      console.error('Error fetching rental requests:', error);
    }
  };

  const fetchListings = async () => {
    try {
      const data = await ownerApi.getOwnerListings();
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const data = await ownerApi.getActivityLogs(20);
      setActivityLogs(data || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    }
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest) return;

    setProcessingAction(true);
    try {
      await ownerApi.approveRentalRequest(selectedRequest.id, ownerNotesInput || undefined);

      toast({
        title: 'Request Approved',
        description: 'The rental request has been approved. The renter will be notified.',
      });

      setApproveDialog(false);
      setSelectedRequest(null);
      setOwnerNotesInput('');
      fetchDashboardData();
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve the request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;

    if (!ownerNotesInput) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for rejection.',
        variant: 'destructive',
      });
      return;
    }

    setProcessingAction(true);
    try {
      await ownerApi.rejectRentalRequest(selectedRequest.id, ownerNotesInput);

      toast({
        title: 'Request Rejected',
        description: 'The rental request has been rejected. The renter will be notified.',
        variant: 'destructive',
      });

      setRejectDialog(false);
      setSelectedRequest(null);
      setOwnerNotesInput('');
      fetchDashboardData();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject the request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-amber-500/20 text-amber-500 border-amber-500/30', label: 'Pending' },
      identity_submitted: { color: 'bg-blue-500/20 text-blue-500 border-blue-500/30', label: 'ID Submitted' },
      approved: { color: 'bg-green-500/20 text-green-500 border-green-500/30', label: 'Approved' },
      rejected: { color: 'bg-red-500/20 text-red-500 border-red-500/30', label: 'Rejected' },
      cancelled: { color: 'bg-gray-500/20 text-gray-500 border-gray-500/30', label: 'Cancelled' },
      completed: { color: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30', label: 'Completed' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge className={`${config.color} border`}>
        {config.label}
      </Badge>
    );
  };

  const downloadReport = async () => {
    try {
      let csv = 'OWNER DASHBOARD REPORT\n\n';
      csv += 'SUMMARY STATISTICS\n';
      csv += `Total Listings,${stats.totalListings}\n`;
      csv += `Active Listings,${stats.activeListings}\n`;
      csv += `Pending Requests,${stats.pendingRequests}\n`;
      csv += `Completed Rentals,${stats.completedRentals}\n`;
      csv += `Total Earnings,₹${stats.totalEarnings}\n`;
      csv += `Average Rating,${stats.averageRating.toFixed(1)}\n\n`;

      csv += 'RENTAL REQUESTS\n';
      csv += 'ID,Listing,Renter,Status,Amount,Created At\n';
      rentalRequests.forEach(r => {
        csv += `"${r.id}","${r.listing?.productName}","${r.renter?.name}","${r.status}",${r.totalAmount || 0},"${r.createdAt}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `owner-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Report Downloaded',
        description: 'Your report has been downloaded successfully.',
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to generate report. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!authReady || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Navbar />
        <div className="container mx-auto px-4 pt-28 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!user || !isOwner) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navbar />

      <div className="container mx-auto px-4 pt-28 pb-20">
        {/* Header Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-[#E5383B]/10 via-[#BA181B]/10 to-[#E5383B]/10 rounded-3xl p-8 border border-[#E5383B]/20 backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E5383B]/10 border border-[#E5383B]/20 mb-4">
                  <Building2 className="w-4 h-4 text-[#E5383B] animate-pulse" />
                  <span className="text-sm font-bold text-[#E5383B]">OWNER DASHBOARD</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-3">
                  Welcome back, {profile?.name?.split(' ')[0] || 'Owner'}!
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Manage your listings, review rental requests, verify identities, and track your earnings.
                </p>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => navigate('/submit-listing')} className="gap-2 bg-[#E5383B] hover:bg-[#BA181B]">
                  <Plus className="w-4 h-4" />
                  New Listing
                </Button>
                <Button onClick={downloadReport} variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                <Button onClick={fetchDashboardData} variant="outline" size="icon">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          <Card className="p-4 bg-gradient-to-br from-[#E5383B]/10 to-[#BA181B]/10 border-[#E5383B]/20 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-[#E5383B]/20">
                <Package className="w-5 h-5 text-[#E5383B]" />
              </div>
              <p className="text-2xl font-black text-foreground">{stats.totalListings}</p>
            </div>
            <p className="text-xs text-muted-foreground">Total Listings</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-black text-foreground">{stats.activeListings}</p>
            </div>
            <p className="text-xs text-muted-foreground">Active Listings</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-foreground">{stats.pendingRequests}</p>
            </div>
            <p className="text-xs text-muted-foreground">Pending Requests</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Eye className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-black text-foreground">{stats.totalViews}</p>
            </div>
            <p className="text-xs text-muted-foreground">Total Views</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Wallet className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-2xl font-black text-foreground">₹{stats.totalEarnings}</p>
            </div>
            <p className="text-xs text-muted-foreground">Total Earnings</p>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2">
              <FileCheck className="w-4 h-4" />
              Rental Requests
              {stats.pendingRequests > 0 && (
                <Badge className="ml-1 bg-[#E5383B] text-white">{stats.pendingRequests}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="listings" className="gap-2">
              <Package className="w-4 h-4" />
              My Listings
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="w-4 h-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Requests */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-[#E5383B]" />
                    Recent Requests
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('requests')}>
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="space-y-4">
                  {rentalRequests.slice(0, 5).map((request) => (
                    <div key={request.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <img
                        src={request.listing?.images?.[0] || '/placeholder.svg'}
                        alt={request.listing?.productName}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{request.listing?.productName}</p>
                        <p className="text-xs text-muted-foreground">{request.renter?.name}</p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  ))}
                  {rentalRequests.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No rental requests yet</p>
                  )}
                </div>
              </Card>

              {/* Performance Stats */}
              <Card className="p-6">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-[#E5383B]" />
                  Performance
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium">Completed Rentals</p>
                        <p className="text-xs text-muted-foreground">All time</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold">{stats.completedRentals}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/10">
                        <Star className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-medium">Average Rating</p>
                        <p className="text-xs text-muted-foreground">From renters</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <Wallet className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-medium">Pending Earnings</p>
                        <p className="text-xs text-muted-foreground">To be received</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold">₹{stats.pendingEarnings}</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Rental Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FileCheck className="w-6 h-6 text-[#E5383B]" />
                  Rental Requests
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={fetchRentalRequests}>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Refresh
                  </Button>
                </div>
              </div>

              {rentalRequests.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
                    <FileCheck className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <p className="text-xl font-semibold mb-2">No Rental Requests</p>
                  <p className="text-muted-foreground">When users request to rent your items, they'll appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rentalRequests.map((request) => (
                    <Card key={request.id} className="p-4 border-l-4 border-l-[#E5383B] hover:shadow-md transition-all">
                      <div className="flex flex-col lg:flex-row gap-4">
                        <img
                          src={request.listing?.images?.[0] || '/placeholder.svg'}
                          alt={request.listing?.productName}
                          className="w-full lg:w-32 h-32 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-bold text-lg">{request.listing?.productName}</h4>
                              <p className="text-sm text-muted-foreground">
                                Requested by: <span className="font-medium">{request.renter?.name}</span>
                              </p>
                            </div>
                            {getStatusBadge(request.status)}
                          </div>

                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Duration</p>
                              <p className="font-medium">{request.totalDays || '-'} days</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Total Amount</p>
                              <p className="font-medium text-[#E5383B]">₹{request.totalAmount || request.listing?.rentPrice || 0}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Contact</p>
                              <p className="font-medium">{request.renter?.phone || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">ID Verification</p>
                              <p className="font-medium">
                                {request.identityVerification ? (
                                  <span className="text-blue-500">{request.identityVerification.documentType.toUpperCase()}</span>
                                ) : (
                                  <span className="text-muted-foreground">Not submitted</span>
                                )}
                              </p>
                            </div>
                          </div>

                          {request.message && (
                            <div className="mb-4 p-3 rounded-lg bg-muted/50">
                              <p className="text-xs text-muted-foreground mb-1">Message from renter:</p>
                              <p className="text-sm">{request.message}</p>
                            </div>
                          )}

                          {(request.status === 'pending' || request.status === 'identity_submitted') && (
                            <div className="flex gap-2">
                              {request.identityVerification && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setViewDocumentDialog(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View ID
                                </Button>
                              )}
                              <Button
                                size="sm"
                                className="bg-green-500 hover:bg-green-600"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setApproveDialog(true);
                                }}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setRejectDialog(true);
                                }}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Package className="w-6 h-6 text-[#E5383B]" />
                  My Listings
                </h3>
                <Button onClick={() => navigate('/submit-listing')} className="bg-[#E5383B] hover:bg-[#BA181B]">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Listing
                </Button>
              </div>

              {listings.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
                    <Package className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <p className="text-xl font-semibold mb-2">No Listings Yet</p>
                  <p className="text-muted-foreground mb-4">Start listing your items to earn money!</p>
                  <Button onClick={() => navigate('/submit-listing')} className="bg-[#E5383B] hover:bg-[#BA181B]">
                    <Plus className="w-4 h-4 mr-1" />
                    Create Your First Listing
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {listings.map((listing) => (
                    <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-all">
                      <div className="relative">
                        <img
                          src={listing.images?.[0] || '/placeholder.svg'}
                          alt={listing.productName}
                          className="w-full h-40 object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          {getStatusBadge(listing.listingStatus)}
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold truncate">{listing.productName}</h4>
                        <p className="text-[#E5383B] font-bold">₹{listing.rentPrice}/day</p>
                        <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {listing.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-500" />
                            {listing.rating || 0}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                <Activity className="w-6 h-6 text-[#E5383B]" />
                Recent Activity
              </h3>

              {activityLogs.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
                    <Activity className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <p className="text-xl font-semibold mb-2">No Activity Yet</p>
                  <p className="text-muted-foreground">Your actions will be logged here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="flex gap-4 p-4 rounded-lg bg-muted/50">
                      <div className="w-2 h-2 rounded-full bg-[#E5383B] mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium">
                          {log.action.replace(/_/g, ' ')}
                        </p>
                        {log.details && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {log.details.listing_name && `Listing: ${log.details.listing_name}`}
                            {log.details.renter_name && ` | Renter: ${log.details.renter_name}`}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* View Document Dialog */}
      <Dialog open={viewDocumentDialog} onOpenChange={setViewDocumentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              Identity Document
            </DialogTitle>
            <DialogDescription>
              Verify the identity document submitted by {selectedRequest?.renter?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Document Type</p>
                <p className="font-medium">{selectedRequest?.identity_verification?.documentType?.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                {selectedRequest?.identity_verification && getStatusBadge(selectedRequest.identity_verification.verificationStatus)}
              </div>
            </div>
            {selectedRequest?.identity_verification?.documentUrl && (
              <div className="border rounded-lg overflow-hidden">
                <img
                  src={selectedRequest.identity_verification.documentUrl}
                  alt="Identity Document"
                  className="w-full h-auto"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDocumentDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={approveDialog} onOpenChange={setApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Approve Rental Request
            </DialogTitle>
            <DialogDescription>
              You are about to approve the rental request from {selectedRequest?.renter?.name} for "{selectedRequest?.listing?.product_name}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                placeholder="Add any notes or instructions for the renter..."
                value={ownerNotesInput}
                onChange={(e) => setOwnerNotesInput(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApproveRequest}
              disabled={processingAction}
              className="bg-green-500 hover:bg-green-600"
            >
              {processingAction ? 'Processing...' : 'Approve Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Reject Rental Request
            </DialogTitle>
            <DialogDescription>
              You are about to reject the rental request from {selectedRequest?.renter?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reason for rejection *</label>
              <Textarea
                placeholder="Please provide a reason for rejection..."
                value={ownerNotesInput}
                onChange={(e) => setOwnerNotesInput(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectRequest}
              disabled={processingAction || !ownerNotesInput}
            >
              {processingAction ? 'Processing...' : 'Reject Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OwnerDashboard;
