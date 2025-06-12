import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Filter } from "lucide-react";
import AddScaleModal from "@/components/modals/add-scale-modal";
import { SCALE_STATUS, CONDITION_OPTIONS } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function InventoryPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [unitFilter, setUnitFilter] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: scales, isLoading } = useQuery({
    queryKey: ["/api/scales"],
  });

  const { data: units } = useQuery({
    queryKey: ["/api/units"],
  });

  const addScaleMutation = useMutation({
    mutationFn: async (scaleData: any) => {
      const response = await apiRequest("POST", "/api/scales", scaleData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scales"] });
      setIsAddModalOpen(false);
      toast({
        title: "Success",
        description: "Scale added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add scale",
        variant: "destructive",
      });
    },
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'assigned':
        return 'secondary';
      case 'maintenance':
        return 'destructive';
      case 'retired':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getCalibrationStatus = (nextCalibrationDate: string | null) => {
    if (!nextCalibrationDate) return { status: 'unknown', text: 'Not set', variant: 'outline' as const };
    
    const now = new Date();
    const calibrationDate = new Date(nextCalibrationDate);
    const daysUntil = Math.ceil((calibrationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) {
      return { 
        status: 'expired', 
        text: `Expired ${Math.abs(daysUntil)} days ago`, 
        variant: 'destructive' as const 
      };
    } else if (daysUntil <= 30) {
      return { 
        status: 'expiring', 
        text: `${daysUntil} days remaining`, 
        variant: 'destructive' as const 
      };
    } else {
      return { 
        status: 'valid', 
        text: `Valid until ${calibrationDate.toLocaleDateString()}`, 
        variant: 'default' as const 
      };
    }
  };

  const filteredScales = scales?.filter((scale: any) => {
    const matchesSearch = scale.scaleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scale.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scale.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || scale.status === statusFilter;
    
    const matchesUnit = unitFilter === 'all' || 
                       (scale.currentAssignment && scale.currentAssignment.unit.id.toString() === unitFilter);
    
    return matchesSearch && matchesStatus && matchesUnit;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-military-blue"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-charcoal mb-2">Scale Inventory</h2>
            <p className="text-gray-600">Manage and track all precision scales</p>
          </div>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="military-blue mt-4 md:mt-0"
          >
            <Plus className="mr-2" size={16} />
            Add Scale
          </Button>
        </div>

        {/* Search and Filter Bar */}
        <Card className="elevation-1 mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search scales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(SCALE_STATUS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={unitFilter} onValueChange={setUnitFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Units" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Units</SelectItem>
                  {units?.map((unit: any) => (
                    <SelectItem key={unit.id} value={unit.id.toString()}>{unit.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="mr-2" size={16} />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card className="elevation-1">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scale ID</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Calibration</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredScales.map((scale: any) => {
                const calibrationStatus = getCalibrationStatus(scale.nextCalibrationDate);
                
                return (
                  <TableRow key={scale.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium text-charcoal">{scale.scaleId}</div>
                        <div className="text-sm text-gray-500">SN: {scale.serialNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">{scale.model}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(scale.status)}>
                        {SCALE_STATUS[scale.status as keyof typeof SCALE_STATUS]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm text-gray-900">{calibrationStatus.text}</div>
                        {scale.nextCalibrationDate && (
                          <div className={`text-sm ${
                            calibrationStatus.status === 'expired' || calibrationStatus.status === 'expiring' 
                              ? 'text-military-red' 
                              : 'text-gray-500'
                          }`}>
                            {calibrationStatus.status === 'expired' || calibrationStatus.status === 'expiring'
                              ? calibrationStatus.text
                              : `Valid until ${new Date(scale.nextCalibrationDate).toLocaleDateString()}`
                            }
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {scale.currentAssignment ? scale.currentAssignment.unit.name : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="text-military-blue hover:text-blue-700">
                          {scale.status === 'assigned' ? 'Return' : 'Assign'}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AddScaleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data) => addScaleMutation.mutate(data)}
        isLoading={addScaleMutation.isPending}
      />
    </div>
  );
}
