import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Share, Undo, Check, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CONDITION_OPTIONS, ASSIGNMENT_STATUS } from "@/lib/constants";

export default function AssignmentsPage() {
  const [assignForm, setAssignForm] = useState({
    scaleId: "",
    unitId: "",
    assignedToPersonName: "",
    location: "",
    expectedReturnDate: "",
    assignmentNotes: "",
  });

  const [returnForm, setReturnForm] = useState({
    assignmentId: "",
    returnCondition: "",
    returnNotes: "",
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: availableScales } = useQuery({
    queryKey: ["/api/scales/available"],
  });

  const { data: units } = useQuery({
    queryKey: ["/api/units"],
  });

  const { data: activeAssignments } = useQuery({
    queryKey: ["/api/assignments/active"],
  });

  const { data: allAssignments } = useQuery({
    queryKey: ["/api/assignments"],
  });

  const assignMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/assignments", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/scales"] });
      setAssignForm({
        scaleId: "",
        unitId: "",
        assignedToPersonName: "",
        location: "",
        expectedReturnDate: "",
        assignmentNotes: "",
      });
      toast({
        title: "Success",
        description: "Scale assigned successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign scale",
        variant: "destructive",
      });
    },
  });

  const returnMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PATCH", `/api/assignments/${id}/return`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/scales"] });
      setReturnForm({
        assignmentId: "",
        returnCondition: "",
        returnNotes: "",
      });
      toast({
        title: "Success",
        description: "Scale returned successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to return scale",
        variant: "destructive",
      });
    },
  });

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.scaleId || !assignForm.unitId || !assignForm.assignedToPersonName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    assignMutation.mutate({
      scaleId: parseInt(assignForm.scaleId),
      unitId: parseInt(assignForm.unitId),
      assignedToPersonName: assignForm.assignedToPersonName,
      location: assignForm.location,
      expectedReturnDate: assignForm.expectedReturnDate || undefined,
      assignmentNotes: assignForm.assignmentNotes,
    });
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnForm.assignmentId || !returnForm.returnCondition) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    returnMutation.mutate({
      id: parseInt(returnForm.assignmentId),
      data: {
        returnCondition: returnForm.returnCondition,
        returnNotes: returnForm.returnNotes,
      },
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-charcoal mb-2">Assignment Management</h2>
        <p className="text-gray-600">Assign and return scales with full audit trail</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Assignment Form */}
        <Card className="elevation-1">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-charcoal mb-4 flex items-center">
              <Share className="text-military-blue mr-2" size={20} />
              Assign Scale
            </h3>
            
            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <Label htmlFor="scale">Select Scale *</Label>
                <Select value={assignForm.scaleId} onValueChange={(value) => setAssignForm(prev => ({ ...prev, scaleId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select available scale..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableScales?.map((scale: any) => (
                      <SelectItem key={scale.id} value={scale.id.toString()}>
                        {scale.scaleId} - {scale.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="unit">Assign to Unit *</Label>
                <Select value={assignForm.unitId} onValueChange={(value) => setAssignForm(prev => ({ ...prev, unitId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit..." />
                  </SelectTrigger>
                  <SelectContent>
                    {units?.map((unit: any) => (
                      <SelectItem key={unit.id} value={unit.id.toString()}>
                        {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="person">Assigned to Person *</Label>
                <Input
                  id="person"
                  placeholder="Enter person name"
                  value={assignForm.assignedToPersonName}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, assignedToPersonName: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Deployment location"
                  value={assignForm.location}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="expectedReturn">Expected Return Date</Label>
                <Input
                  id="expectedReturn"
                  type="date"
                  value={assignForm.expectedReturnDate}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, expectedReturnDate: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Assignment notes..."
                  rows={3}
                  value={assignForm.assignmentNotes}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, assignmentNotes: e.target.value }))}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full military-blue"
                disabled={assignMutation.isPending}
              >
                <Check className="mr-2" size={16} />
                {assignMutation.isPending ? "Assigning..." : "Assign Scale"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Return Form */}
        <Card className="elevation-1">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-charcoal mb-4 flex items-center">
              <Undo className="text-forest-green mr-2" size={20} />
              Return Scale
            </h3>
            
            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div>
                <Label htmlFor="assignedScale">Select Assigned Scale *</Label>
                <Select value={returnForm.assignmentId} onValueChange={(value) => setReturnForm(prev => ({ ...prev, assignmentId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assigned scale..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activeAssignments?.map((assignment: any) => (
                      <SelectItem key={assignment.id} value={assignment.id.toString()}>
                        {assignment.scale.scaleId} - {assignment.unit.name} ({assignment.assignedToPersonName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="condition">Condition Assessment *</Label>
                <Select value={returnForm.returnCondition} onValueChange={(value) => setReturnForm(prev => ({ ...prev, returnCondition: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CONDITION_OPTIONS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="returnNotes">Return Notes</Label>
                <Textarea
                  id="returnNotes"
                  placeholder="Condition notes, issues, or observations..."
                  rows={4}
                  value={returnForm.returnNotes}
                  onChange={(e) => setReturnForm(prev => ({ ...prev, returnNotes: e.target.value }))}
                />
              </div>
              
              <div className="bg-amber-warning bg-opacity-10 border border-amber-warning border-opacity-20 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="text-amber-warning" size={16} />
                  <p className="text-sm text-amber-warning font-medium">Calibration Check Required</p>
                </div>
                <p className="text-xs text-gray-600 mt-1">Scale will be flagged for calibration verification upon return</p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full forest-green"
                disabled={returnMutation.isPending}
              >
                <Check className="mr-2" size={16} />
                {returnMutation.isPending ? "Processing..." : "Process Return"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assignments History */}
      <Card className="elevation-1">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-charcoal mb-4">Recent Assignment History</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Scale</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Unit/Person</TableHead>
                  <TableHead>Processed By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allAssignments?.slice(0, 10).map((assignment: any) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="text-sm text-gray-900">
                      {new Date(assignment.assignedAt).toLocaleDateString()} {new Date(assignment.assignedAt).toLocaleTimeString()}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-charcoal">
                      {assignment.scale.scaleId}
                    </TableCell>
                    <TableCell>
                      <Badge variant={assignment.status === 'active' ? 'default' : 'secondary'}>
                        {ASSIGNMENT_STATUS[assignment.status as keyof typeof ASSIGNMENT_STATUS]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      {assignment.unit.name} / {assignment.assignedToPersonName}
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      {assignment.assignedBy.firstName} {assignment.assignedBy.lastName}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
