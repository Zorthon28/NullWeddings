"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface RSVPResponse {
  id: string;
  name: string;
  email: string;
  attendance_status: string;
  party_size: number;
  dietary_restrictions: string | null;
  created_at: string;
}

export default function GuestManagementDashboard() {
  const [responses, setResponses] = useState<RSVPResponse[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<RSVPResponse[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingResponse, setEditingResponse] = useState<RSVPResponse | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchResponses();
  }, []);

  useEffect(() => {
    const filtered = responses.filter(
      (response) =>
        response.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.attendance_status
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (response.dietary_restrictions &&
          response.dietary_restrictions
            .toLowerCase()
            .includes(searchTerm.toLowerCase()))
    );
    setFilteredResponses(filtered);
  }, [responses, searchTerm]);

  const fetchResponses = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("rsvp_responses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setResponses(data || []);
    } catch (err) {
      console.error("Error fetching RSVP responses:", err);
      setError("Failed to load RSVP responses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Attendance Status",
      "Party Size",
      "Dietary Restrictions",
      "Created At",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredResponses.map((response) =>
        [
          `"${response.name}"`,
          `"${response.email}"`,
          `"${response.attendance_status}"`,
          response.party_size,
          `"${response.dietary_restrictions || ""}"`,
          `"${new Date(response.created_at).toLocaleDateString()}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "rsvp_responses.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEdit = (response: RSVPResponse) => {
    setEditingResponse({ ...response });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingResponse) return;

    const originalResponses = [...responses];
    try {
      // Optimistic update
      const updatedResponses = responses.map((r) =>
        r.id === editingResponse.id ? editingResponse : r
      );
      setResponses(updatedResponses);

      const { error } = await supabase
        .from("rsvp_responses")
        .update({
          name: editingResponse.name,
          email: editingResponse.email,
          attendance_status: editingResponse.attendance_status,
          party_size: editingResponse.party_size,
          dietary_restrictions: editingResponse.dietary_restrictions,
        })
        .eq("id", editingResponse.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "RSVP response updated successfully.",
      });
      setIsEditDialogOpen(false);
      setEditingResponse(null);
    } catch (err) {
      console.error("Error updating RSVP response:", err);
      // Revert optimistic update
      setResponses(originalResponses);
      toast({
        title: "Error",
        description: "Failed to update RSVP response. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    const originalResponses = [...responses];
    try {
      // Optimistic update
      const updatedResponses = responses.filter((r) => r.id !== deletingId);
      setResponses(updatedResponses);

      const { error } = await supabase
        .from("rsvp_responses")
        .delete()
        .eq("id", deletingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "RSVP response deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (err) {
      console.error("Error deleting RSVP response:", err);
      // Revert optimistic update
      setResponses(originalResponses);
      toast({
        title: "Error",
        description: "Failed to delete RSVP response. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading RSVP responses...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchResponses} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Guest Management Dashboard</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-sm">
              <Input
                placeholder="Search responses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              onClick={exportToCSV}
              className="bg-gold hover:bg-gold/80 text-black"
            >
              Export to CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredResponses.length} of {responses.length} responses
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Attendance Status</TableHead>
                <TableHead>Party Size</TableHead>
                <TableHead>Dietary Restrictions</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResponses.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-gray-500"
                  >
                    {searchTerm
                      ? "No responses match your search."
                      : "No RSVP responses found."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredResponses.map((response) => (
                  <TableRow key={response.id}>
                    <TableCell className="font-medium">
                      {response.name}
                    </TableCell>
                    <TableCell>{response.email}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          response.attendance_status === "attending"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {response.attendance_status}
                      </span>
                    </TableCell>
                    <TableCell>{response.party_size}</TableCell>
                    <TableCell>
                      {response.dietary_restrictions || "-"}
                    </TableCell>
                    <TableCell>{formatDate(response.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(response)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(response.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit RSVP Response</DialogTitle>
          </DialogHeader>
          {editingResponse && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={editingResponse.name}
                  onChange={(e) =>
                    setEditingResponse({
                      ...editingResponse,
                      name: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={editingResponse.email}
                  onChange={(e) =>
                    setEditingResponse({
                      ...editingResponse,
                      email: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={editingResponse.attendance_status}
                  onValueChange={(value) =>
                    setEditingResponse({
                      ...editingResponse,
                      attendance_status: value,
                    })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attending">Attending</SelectItem>
                    <SelectItem value="not attending">Not Attending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="party_size" className="text-right">
                  Party Size
                </Label>
                <Input
                  id="party_size"
                  type="number"
                  min="1"
                  value={editingResponse.party_size}
                  onChange={(e) =>
                    setEditingResponse({
                      ...editingResponse,
                      party_size: parseInt(e.target.value) || 1,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dietary" className="text-right">
                  Dietary
                </Label>
                <Textarea
                  id="dietary"
                  value={editingResponse.dietary_restrictions || ""}
                  onChange={(e) =>
                    setEditingResponse({
                      ...editingResponse,
                      dietary_restrictions: e.target.value,
                    })
                  }
                  className="col-span-3"
                  placeholder="Enter dietary restrictions..."
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              RSVP response.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
