import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Scale, MapPin, AlertTriangle, XCircle, Check, Undo, Wrench, Info } from "lucide-react";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: recentAssignments } = useQuery({
    queryKey: ["/api/assignments/active"],
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-military-blue"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-charcoal mb-2">Operations Dashboard</h2>
        <p className="text-gray-600">Real-time overview of scale asset status and metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="elevation-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Units</p>
                <p className="text-3xl font-bold text-charcoal">{stats?.totalUnits || 0}</p>
              </div>
              <div className="bg-military-blue bg-opacity-10 p-3 rounded-lg">
                <Scale className="text-military-blue" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="elevation-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Field</p>
                <p className="text-3xl font-bold text-forest-green">{stats?.inField || 0}</p>
              </div>
              <div className="bg-forest-green bg-opacity-10 p-3 rounded-lg">
                <MapPin className="text-forest-green" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="elevation-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-3xl font-bold text-amber-warning">{stats?.expiring || 0}</p>
              </div>
              <div className="bg-amber-warning bg-opacity-10 p-3 rounded-lg">
                <AlertTriangle className="text-amber-warning" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="elevation-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-3xl font-bold text-military-red">{stats?.expired || 0}</p>
              </div>
              <div className="bg-military-red bg-opacity-10 p-3 rounded-lg">
                <XCircle className="text-military-red" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="elevation-1">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-charcoal mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentAssignments?.slice(0, 3).map((assignment) => (
                <div key={assignment.id} className="flex items-center space-x-4 p-3 border border-gray-100 rounded-lg">
                  <div className="forest-green text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
                    <Check size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-charcoal">
                      Scale {assignment.scale.scaleId} assigned to {assignment.unit.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      by {assignment.assignedBy.firstName} {assignment.assignedBy.lastName} • 
                      {new Date(assignment.assignedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="elevation-1">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-charcoal mb-4">Critical Alerts</h3>
            <div className="space-y-4">
              {stats?.expired && stats.expired > 0 && (
                <div className="bg-military-red bg-opacity-5 border border-military-red border-opacity-20 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <XCircle className="text-military-red" size={20} />
                    <div>
                      <p className="text-sm font-medium text-military-red">
                        {stats.expired} Scale{stats.expired > 1 ? 's' : ''} Expired
                      </p>
                      <p className="text-xs text-gray-600">Require immediate calibration</p>
                    </div>
                  </div>
                </div>
              )}
              
              {stats?.expiring && stats.expiring > 0 && (
                <div className="bg-amber-warning bg-opacity-5 border border-amber-warning border-opacity-20 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="text-amber-warning" size={20} />
                    <div>
                      <p className="text-sm font-medium text-amber-warning">
                        {stats.expiring} Scale{stats.expiring > 1 ? 's' : ''} Expiring Soon
                      </p>
                      <p className="text-xs text-gray-600">Calibration due within 30 days</p>
                    </div>
                  </div>
                </div>
              )}
              
              {(!stats?.expired || stats.expired === 0) && (!stats?.expiring || stats.expiring === 0) && (
                <div className="bg-forest-green bg-opacity-5 border border-forest-green border-opacity-20 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Check className="text-forest-green" size={20} />
                    <div>
                      <p className="text-sm font-medium text-forest-green">All Systems Operational</p>
                      <p className="text-xs text-gray-600">No critical alerts at this time</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
