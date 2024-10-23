import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase-config';
import { 
  Printer, 
  Clock, 
  Ban, 
  CheckCircle, 
  AlertCircle, 
  DollarSign,
  Copy,
  ImageIcon,
  Layers,
  LayoutGrid,
  LayoutList,
  Search
} from 'lucide-react';
import './tailwind.css';

const AdminPanel = () => {
  const [printJobs, setPrintJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPrintJobs();
  }, []);

  const fetchPrintJobs = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "printJobs"));
      const jobs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPrintJobs(jobs);
    } catch (error) {
      console.error("Error fetching print jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateJobStatus = async (jobId, newStatus) => {
    try {
      const jobRef = doc(db, "printJobs", jobId);
      await updateDoc(jobRef, {
        status: newStatus,
        lastUpdated: new Date().toISOString()
      });
      fetchPrintJobs();
    } catch (error) {
      console.error("Error updating job status:", error);
    }
  };

  const getStatusIcon = (status) => {
    const iconClass = "w-5 h-5";
    switch (status) {
      case 'pending':
        return <Clock className={iconClass} />;
      case 'awaiting_payment':
        return <DollarSign className={iconClass} />;
      case 'paid':
        return <CheckCircle className={iconClass} />;
      case 'printing':
        return <Printer className={iconClass} />;
      case 'completed':
        return <CheckCircle className={iconClass} />;
      case 'cancelled':
        return <Ban className={iconClass} />;
      default:
        return <AlertCircle className={iconClass} />;
    }
  };

  const getStatusStyle = (status) => {
    const baseStyle = "flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case 'pending':
        return `${baseStyle} bg-yellow-100 text-yellow-800`;
      case 'awaiting_payment':
        return `${baseStyle} bg-blue-100 text-blue-800`;
      case 'paid':
        return `${baseStyle} bg-green-100 text-green-800`;
      case 'printing':
        return `${baseStyle} bg-purple-100 text-purple-800`;
      case 'completed':
        return `${baseStyle} bg-green-200 text-green-900`;
      case 'cancelled':
        return `${baseStyle} bg-red-100 text-red-800`;
      default:
        return `${baseStyle} bg-gray-100 text-gray-800`;
    }
  };

  const formatStatusText = (status) => {
    if (!status) return 'Unknown';
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

const filteredJobs = printJobs
  .filter(job => selectedFilter === 'all' || job.status === selectedFilter)
  .filter(job => 
    searchQuery === '' || 
    job.fileName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.id.toLowerCase().includes(searchQuery.toLowerCase())
  )
  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));  // Sort by timestamp (newest first)


  const StatusFilter = () => (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 flex-wrap">
      {['all', 'pending', 'awaiting_payment', 'paid', 'printing', 'completed', 'cancelled'].map((status) => (
        <button
          key={status}
          onClick={() => setSelectedFilter(status)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
            ${selectedFilter === status 
              ? 'bg-indigo-600 text-white shadow-lg' 
              : 'bg-white text-gray-600 hover:bg-gray-50 hover:shadow'}`}
        >
          {formatStatusText(status)}
        </button>
      ))}
    </div>
  );

  const PrintJobCard = ({ job }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {job.fileName || 'Untitled'}
            </h3>
            <p className="text-sm text-gray-500">ID: {job.id.slice(0, 8)}...</p>
          </div>
          <span className={getStatusStyle(job.status)}>
            {getStatusIcon(job.status)}
            {formatStatusText(job.status)}
          </span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Copy className="w-4 h-4" />
            <span className="text-sm">{job.copies} copies</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <ImageIcon className="w-4 h-4" />
            <span className="text-sm">{job.colorMode}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Layers className="w-4 h-4" />
            <span className="text-sm">{job.paperSize}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">{job.paymentAmount ? `₹${job.paymentAmount}` : 'Pending'}</span>
          </div>
        </div>

        {/* Timestamps */}
        <div className="text-sm text-gray-500 space-y-1">
          <div>Submitted: {new Date(job.timestamp).toLocaleString()}</div>
          {job.paymentTimestamp && (
            <div>Paid: {new Date(job.paymentTimestamp).toLocaleString()}</div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          {job.status === 'paid' && (
            <button
              onClick={() => updateJobStatus(job.id, 'printing')}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Start Printing
            </button>
          )}
          {job.status === 'printing' && (
            <button
              onClick={() => updateJobStatus(job.id, 'completed')}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Mark Complete
            </button>
          )}
          {['pending', 'awaiting_payment'].includes(job.status) && (
            <button
              onClick={() => updateJobStatus(job.id, 'cancelled')}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <Ban className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Print Jobs Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage and monitor all print jobs in one place
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-indigo-100 text-indigo-600' 
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-indigo-100 text-indigo-600' 
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <LayoutList className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by file name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <StatusFilter />
            </div>
          </div>
        </div>

        {/* Print Jobs Grid */}
        {filteredJobs.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredJobs.map((job) => (
              <PrintJobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No print jobs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedFilter === 'all' 
                ? "There are no print jobs in the system yet."
                : `No print jobs with status "${formatStatusText(selectedFilter)}" found.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;