import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';
import api from '@/lib/api';

export default function CustomerDetail() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => api.get(`/customers/${id}`),
  });

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  const customer = data?.data;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-primary-100 p-3 rounded-lg">
              <Building2 className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {customer?.companyName}
              </h1>
              <p className="text-gray-500">{customer?.legalName}</p>
            </div>
          </div>
          <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
            {customer?.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Qualification Progress
            </h2>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((stage) => (
                <div key={stage} className="flex items-center space-x-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      stage <= customer?.currentStage
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {stage}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Stage {stage}
                    </p>
                    <p className="text-xs text-gray-500">
                      {stage === 1 && 'Initial Registration'}
                      {stage === 2 && 'Documentation Review'}
                      {stage === 3 && 'Stakeholder Assignment'}
                      {stage === 4 && 'Procurement Assessment'}
                      {stage === 5 && 'Long-term Visibility'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Company Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <Building2 className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  {customer?.companySize || 'N/A'}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">contact@company.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">(555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Location TBD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
