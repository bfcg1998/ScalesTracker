import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Check, X } from "lucide-react";
import AddUserModal from "@/components/modals/add-user-modal";
import { USER_ROLES } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function UsersPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  const addUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiRequest("POST", "/api/users", userData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsAddModalOpen(false);
      toast({
        title: "Success",
        description: "User added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add user",
        variant: "destructive",
      });
    },
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'technician':
        return 'default';
      case 'auditor':
        return 'secondary';
      case 'viewer':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const permissions = [
    'View Dashboard',
    'Assign/Return Scales',
    'Generate Reports',
    'User Management',
  ];

  const rolePermissions = {
    admin: [true, true, true, true],
    technician: [true, true, true, false],
    auditor: [true, false, true, false],
    viewer: [true, false, false, false],
  };

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
            <h2 className="text-2xl font-bold text-charcoal mb-2">User Management</h2>
            <p className="text-gray-600">Manage user accounts and role-based permissions</p>
          </div>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="military-blue mt-4 md:mt-0"
          >
            <UserPlus className="mr-2" size={16} />
            Add User
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card className="elevation-1 mb-8">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user: any) => (
                <TableRow key={user.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center">
                      <div className="military-blue text-white w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium">
                        {getInitials(user.firstName, user.lastName)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-charcoal">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {USER_ROLES[user.role as keyof typeof USER_ROLES]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-900">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" className="text-military-blue hover:text-blue-700">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Role Permissions Matrix */}
      <Card className="elevation-1">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-charcoal mb-4">Role Permissions Matrix</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Permission</TableHead>
                  <TableHead className="text-center">Admin</TableHead>
                  <TableHead className="text-center">Technician</TableHead>
                  <TableHead className="text-center">Auditor</TableHead>
                  <TableHead className="text-center">Viewer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((permission, index) => (
                  <TableRow key={permission}>
                    <TableCell className="font-medium text-charcoal">{permission}</TableCell>
                    <TableCell className="text-center">
                      {rolePermissions.admin[index] ? (
                        <Check className="text-forest-green mx-auto" size={16} />
                      ) : (
                        <X className="text-military-red mx-auto" size={16} />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {rolePermissions.technician[index] ? (
                        <Check className="text-forest-green mx-auto" size={16} />
                      ) : (
                        <X className="text-military-red mx-auto" size={16} />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {rolePermissions.auditor[index] ? (
                        <Check className="text-forest-green mx-auto" size={16} />
                      ) : (
                        <X className="text-military-red mx-auto" size={16} />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {rolePermissions.viewer[index] ? (
                        <Check className="text-forest-green mx-auto" size={16} />
                      ) : (
                        <X className="text-military-red mx-auto" size={16} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data) => addUserMutation.mutate(data)}
        isLoading={addUserMutation.isPending}
      />
    </div>
  );
}
