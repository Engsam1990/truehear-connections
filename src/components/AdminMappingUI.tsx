import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Link, Unlink, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserMapping {
  id: string;
  supabase_user_id: string;
  member_id: string;
  created_at: string;
  migration_status: string;
  migration_notes: string;
  auth_user_email?: string;
  member_name?: string;
  member_email?: string;
}

interface UnmappedMember {
  id: string;
  name: string;
  email: string;
  status: string;
  entry_date: string;
}

export const AdminMappingUI = () => {
  const [mappings, setMappings] = useState<UserMapping[]>([]);
  const [unmappedMembers, setUnmappedMembers] = useState<UnmappedMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchMappings();
    fetchUnmappedMembers();
  }, []);

  const fetchMappings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_mappings')
        .select(`
          *,
          members!inner(name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to include member info
      const transformedData = data?.map(mapping => ({
        ...mapping,
        member_name: mapping.members?.name,
        member_email: mapping.members?.email
      })) || [];

      setMappings(transformedData);
    } catch (error) {
      console.error('Error fetching mappings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user mappings",
        variant: "destructive"
      });
    }
  };

  const fetchUnmappedMembers = async () => {
    try {
      // Get members that don't have mappings
      const { data, error } = await supabase
        .from('members')
        .select('id, name, email, status, entry_date')
        .eq('status', 'active')
        .not('id', 'in', `(${mappings.map(m => `'${m.member_id}'`).join(',') || "''"})`)
        .order('entry_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setUnmappedMembers(data || []);
    } catch (error) {
      console.error('Error fetching unmapped members:', error);
    } finally {
      setLoading(false);
    }
  };

  const createMapping = async (memberId: string, supabaseUserId: string) => {
    try {
      const { error } = await supabase
        .from('user_mappings')
        .insert({
          member_id: memberId,
          supabase_user_id: supabaseUserId,
          migration_status: 'completed',
          migration_notes: 'Manually created by admin'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User mapping created successfully",
      });

      fetchMappings();
      fetchUnmappedMembers();
    } catch (error) {
      console.error('Error creating mapping:', error);
      toast({
        title: "Error",
        description: "Failed to create mapping",
        variant: "destructive"
      });
    }
  };

  const removeMapping = async (mappingId: string) => {
    try {
      const { error } = await supabase
        .from('user_mappings')
        .delete()
        .eq('id', mappingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User mapping removed successfully",
      });

      fetchMappings();
      fetchUnmappedMembers();
    } catch (error) {
      console.error('Error removing mapping:', error);
      toast({
        title: "Error",
        description: "Failed to remove mapping",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredMappings = mappings.filter(mapping =>
    mapping.member_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapping.member_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading mappings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Account Mappings</h1>
        <Badge variant="secondary" className="text-sm">
          {mappings.length} mapped users
        </Badge>
      </div>

      <Tabs defaultValue="mappings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mappings">Active Mappings</TabsTrigger>
          <TabsTrigger value="unmapped">Unmapped Members</TabsTrigger>
          <TabsTrigger value="create">Create Mapping</TabsTrigger>
        </TabsList>

        <TabsContent value="mappings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5" />
                User Mappings
              </CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search mappings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Member Name</TableHead>
                    <TableHead>Member Email</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMappings.map((mapping) => (
                    <TableRow key={mapping.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(mapping.migration_status)}
                          <span className="capitalize">{mapping.migration_status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{mapping.member_name}</TableCell>
                      <TableCell>{mapping.member_email}</TableCell>
                      <TableCell>{new Date(mapping.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeMapping(mapping.id)}
                        >
                          <Unlink className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unmapped" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Unmapped Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Member Since</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unmappedMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(member.entry_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // This would open a modal to select Supabase user
                            toast({
                              title: "Feature Coming Soon",
                              description: "Manual mapping interface will be available soon"
                            });
                          }}
                        >
                          <Link className="w-4 h-4 mr-1" />
                          Map User
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Mapping</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="member-id">Member ID</Label>
                  <Input id="member-id" placeholder="Enter member UUID" />
                </div>
                <div>
                  <Label htmlFor="supabase-user-id">Supabase User ID</Label>
                  <Input id="supabase-user-id" placeholder="Enter Supabase user UUID" />
                </div>
              </div>
              <Button className="w-full">
                <Link className="w-4 h-4 mr-2" />
                Create Mapping
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};