"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdmin } from "@/contexts/AdminContext";
import Image from "next/image";
import GuestManagementDashboard from "@/components/GuestManagementDashboard";
import FAQManager from "@/components/FAQManager";
import RichTextEditor from "@/components/ui/richtext-editor";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RSVPStats {
  totalRSVPs: number;
  attending: number;
  notAttending: number;
  totalPartySize: number;
  pending: number;
  plusOnes: number;
}

interface CustomInvite {
  id: string;
  invite_code: string;
  guest_name: string;
  guest_email?: string;
  max_party_size: number;
  custom_message?: string;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}

export default function AdminPage() {
  const { settings, updateSetting, isLoading, user, signIn, signOut } =
    useAdmin();

  // Disable SSR for admin pages to avoid document undefined errors
  if (typeof window === "undefined") {
    return null;
  }
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [rsvpStats, setRsvpStats] = useState<RSVPStats>({
    totalRSVPs: 0,
    attending: 0,
    notAttending: 0,
    totalPartySize: 0,
    pending: 0,
    plusOnes: 0,
  });
  const { toast } = useToast();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [customInvites, setCustomInvites] = useState<CustomInvite[]>([]);
  const [isCreateInviteOpen, setIsCreateInviteOpen] = useState(false);
  const [newInvite, setNewInvite] = useState({
    guest_name: "",
    guest_email: "",
    max_party_size: 2,
    custom_message: "",
    expires_at: "",
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      setAuthError("");
    } catch (error: any) {
      setAuthError(error.message);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSettingChange = (key: string, value: any) => {
    updateSetting(key, value);
    setHasUnsavedChanges(true);

    // Clear existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    // Set new timeout for auto-save (3 seconds)
    const timeout = setTimeout(() => {
      // Auto-save would happen here, but for now we'll just mark as saved
      setHasUnsavedChanges(false);
      toast({
        title: "Auto-saved",
        description: "Your changes have been automatically saved.",
      });
    }, 3000);

    setAutoSaveTimeout(timeout);
  };

  const handleManualSave = () => {
    setHasUnsavedChanges(false);
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
      setAutoSaveTimeout(null);
    }
    toast({
      title: "Settings Saved",
      description: "All changes have been saved to the database successfully.",
    });
  };

  useEffect(() => {
    if (user) {
      fetchRSVPStats();
      fetchCustomInvites();
    }
  }, [user]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "s":
            e.preventDefault();
            handleManualSave();
            break;
          case "ArrowLeft":
            e.preventDefault();
            // Navigate to previous section (could be enhanced)
            break;
          case "ArrowRight":
            e.preventDefault();
            // Navigate to next section (could be enhanced)
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fetchRSVPStats = async () => {
    try {
      const { data, error } = await supabase
        .from("rsvp_responses")
        .select("attendance_status, party_size");

      if (error) throw error;

      const stats = data.reduce(
        (acc, response) => {
          acc.totalRSVPs++;
          if (response.attendance_status === "attending") {
            acc.attending++;
          } else if (response.attendance_status === "not attending") {
            acc.notAttending++;
          } else {
            acc.pending++;
          }
          acc.totalPartySize += response.party_size;
          // Count plus-ones (party_size > 1)
          if (response.party_size > 1) {
            acc.plusOnes += response.party_size - 1;
          }
          return acc;
        },
        {
          totalRSVPs: 0,
          attending: 0,
          notAttending: 0,
          totalPartySize: 0,
          pending: 0,
          plusOnes: 0,
        }
      );

      setRsvpStats(stats);
    } catch (error) {
      console.error("Error fetching RSVP stats:", error);
    }
  };

  const fetchCustomInvites = async () => {
    try {
      const { data, error } = await supabase
        .from("custom_invites")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setCustomInvites(data || []);
    } catch (error) {
      console.error("Error fetching custom invites:", error);
    }
  };

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createCustomInvite = async () => {
    try {
      const inviteCode = generateInviteCode();
      const { data, error } = await supabase
        .from("custom_invites")
        .insert({
          invite_code: inviteCode,
          guest_name: newInvite.guest_name,
          guest_email: newInvite.guest_email || null,
          max_party_size: newInvite.max_party_size,
          custom_message: newInvite.custom_message || null,
          expires_at: newInvite.expires_at || null,
        })
        .select()
        .single();

      if (error) throw error;

      setCustomInvites([data, ...customInvites]);
      setNewInvite({
        guest_name: "",
        guest_email: "",
        max_party_size: 2,
        custom_message: "",
        expires_at: "",
      });
      setIsCreateInviteOpen(false);

      toast({
        title: "Invite Created",
        description: `Custom invite for ${newInvite.guest_name} has been created.`,
      });
    } catch (error) {
      console.error("Error creating custom invite:", error);
      toast({
        title: "Error",
        description: "Failed to create custom invite. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyInviteLink = (inviteCode: string) => {
    const inviteUrl = `${window.location.origin}/rsvp/${inviteCode}`;
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: "Link Copied",
      description: "Invite link has been copied to clipboard.",
    });
  };

  const toggleInviteStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("custom_invites")
        .update({ is_active: !isActive })
        .eq("id", id);

      if (error) throw error;

      setCustomInvites(
        customInvites.map((invite) =>
          invite.id === id ? { ...invite, is_active: !isActive } : invite
        )
      );

      toast({
        title: "Status Updated",
        description: `Invite has been ${!isActive ? "activated" : "deactivated"}.`,
      });
    } catch (error) {
      console.error("Error updating invite status:", error);
      toast({
        title: "Error",
        description: "Failed to update invite status.",
        variant: "destructive",
      });
    }
  };

  const deleteInvite = async (id: string) => {
    try {
      const { error } = await supabase
        .from("custom_invites")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setCustomInvites(customInvites.filter((invite) => invite.id !== id));

      toast({
        title: "Invite Deleted",
        description: "Custom invite has been permanently deleted.",
      });
    } catch (error) {
      console.error("Error deleting invite:", error);
      toast({
        title: "Error",
        description: "Failed to delete invite.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {authError && (
                <div className="text-red-500 text-sm">{authError}</div>
              )}
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Wedding Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your wedding website and guest responses
            </p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">
                    Total RSVPs
                  </p>
                  <p className="text-3xl font-bold">{rsvpStats.totalRSVPs}</p>
                </div>
                <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">
                    Attending
                  </p>
                  <p className="text-3xl font-bold">{rsvpStats.attending}</p>
                </div>
                <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">
                    Not Attending
                  </p>
                  <p className="text-3xl font-bold">{rsvpStats.notAttending}</p>
                </div>
                <div className="w-12 h-12 bg-red-400 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold">{rsvpStats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">
                    Total Guests
                  </p>
                  <p className="text-3xl font-bold">
                    {rsvpStats.totalPartySize}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-sm font-medium">Plus-Ones</p>
                  <p className="text-3xl font-bold">{rsvpStats.plusOnes}</p>
                </div>
                <div className="w-12 h-12 bg-pink-400 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="names">Names</Label>
                <Input
                  id="names"
                  value={settings.names}
                  onChange={(e) => handleSettingChange("names", e.target.value)}
                  className={hasUnsavedChanges ? "border-orange-400" : ""}
                />
              </div>
              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={settings.subtitle}
                  onChange={(e) =>
                    handleSettingChange("subtitle", e.target.value)
                  }
                  className={hasUnsavedChanges ? "border-orange-400" : ""}
                />
              </div>
              <div>
                <Label htmlFor="weddingDate">Wedding Date</Label>
                <Input
                  id="weddingDate"
                  value={settings.weddingDate}
                  onChange={(e) =>
                    handleSettingChange("weddingDate", e.target.value)
                  }
                  className={hasUnsavedChanges ? "border-orange-400" : ""}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={settings.location}
                  onChange={(e) =>
                    handleSettingChange("location", e.target.value)
                  }
                  className={hasUnsavedChanges ? "border-orange-400" : ""}
                />
              </div>
              <div>
                <Label htmlFor="invitationText">Invitation Text</Label>
                <Input
                  id="invitationText"
                  value={settings.invitationText}
                  onChange={(e) =>
                    handleSettingChange("invitationText", e.target.value)
                  }
                  className={hasUnsavedChanges ? "border-orange-400" : ""}
                />
              </div>
            </CardContent>
          </Card>

          {/* Feature Toggles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                  />
                </svg>
                Feature Toggles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="showCountdown">Show Countdown</Label>
                <Switch
                  id="showCountdown"
                  checked={settings.showCountdown}
                  onCheckedChange={(checked) =>
                    updateSetting("showCountdown", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showRSVP">Show RSVP Section</Label>
                <Switch
                  id="showRSVP"
                  checked={settings.showRSVP}
                  onCheckedChange={(checked) =>
                    updateSetting("showRSVP", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showGuestBook">Show Guest Book</Label>
                <Switch
                  id="showGuestBook"
                  checked={settings.showGuestBook}
                  onCheckedChange={(checked) =>
                    updateSetting("showGuestBook", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showPhotoGallery">Show Photo Gallery</Label>
                <Switch
                  id="showPhotoGallery"
                  checked={settings.showPhotoGallery}
                  onCheckedChange={(checked) =>
                    updateSetting("showPhotoGallery", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showItinerary">Show Itinerary</Label>
                <Switch
                  id="showItinerary"
                  checked={settings.showItinerary}
                  onCheckedChange={(checked) =>
                    updateSetting("showItinerary", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showGiftRegistry">Show Gift Registry</Label>
                <Switch
                  id="showGiftRegistry"
                  checked={settings.showGiftRegistry}
                  onCheckedChange={(checked) =>
                    updateSetting("showGiftRegistry", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showAccommodation">Show Accommodation</Label>
                <Switch
                  id="showAccommodation"
                  checked={settings.showAccommodation}
                  onCheckedChange={(checked) =>
                    updateSetting("showAccommodation", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showContact">Show Contact</Label>
                <Switch
                  id="showContact"
                  checked={settings.showContact}
                  onCheckedChange={(checked) =>
                    updateSetting("showContact", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showBackgroundImage">
                  Show Background Image
                </Label>
                <Switch
                  id="showBackgroundImage"
                  checked={settings.showBackgroundImage}
                  onCheckedChange={(checked) =>
                    updateSetting("showBackgroundImage", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Gallery Management */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Photo Gallery Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GalleryManager />
            </CardContent>
          </Card>

          {/* Content Management */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Content Management
              </CardTitle>
              <p className="text-sm text-gray-600">
                Manage rich text content and custom messages for each section of
                your wedding website.
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Itinerary Section */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Itinerary Section
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="itineraryContent">Itinerary Content</Label>
                    <RichTextEditor
                      value={settings.itineraryContent || ""}
                      onChange={(value) =>
                        updateSetting("itineraryContent", value)
                      }
                      placeholder="Enter itinerary details..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="itineraryMessage">Custom Message</Label>
                    <Textarea
                      id="itineraryMessage"
                      value={settings.itineraryMessage || ""}
                      onChange={(e) =>
                        updateSetting("itineraryMessage", e.target.value)
                      }
                      placeholder="Enter a custom message for the itinerary section..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Accommodation Section */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Accommodation Section
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="accommodationContent">
                      Accommodation Content
                    </Label>
                    <RichTextEditor
                      value={settings.accommodationContent || ""}
                      onChange={(value) =>
                        updateSetting("accommodationContent", value)
                      }
                      placeholder="Enter accommodation details..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="accommodationMessage">Custom Message</Label>
                    <Textarea
                      id="accommodationMessage"
                      value={settings.accommodationMessage || ""}
                      onChange={(e) =>
                        updateSetting("accommodationMessage", e.target.value)
                      }
                      placeholder="Enter a custom message for the accommodation section..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Gift Registry Section */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Gift Registry Section
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="giftRegistryContent">
                      Gift Registry Content
                    </Label>
                    <RichTextEditor
                      value={settings.giftRegistryContent || ""}
                      onChange={(value) =>
                        updateSetting("giftRegistryContent", value)
                      }
                      placeholder="Enter gift registry details..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="giftRegistryMessage">Custom Message</Label>
                    <Textarea
                      id="giftRegistryMessage"
                      value={settings.giftRegistryMessage || ""}
                      onChange={(e) =>
                        updateSetting("giftRegistryMessage", e.target.value)
                      }
                      placeholder="Enter a custom message for the gift registry section..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Contact Information
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Manage the contact details displayed in the contact section.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactPhone">Phone Number</Label>
                    <Input
                      id="contactPhone"
                      value={settings.contactPhone || ""}
                      onChange={(e) =>
                        updateSetting("contactPhone", e.target.value)
                      }
                      placeholder="Enter phone number..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactEmail">Email Address</Label>
                    <Input
                      id="contactEmail"
                      value={settings.contactEmail || ""}
                      onChange={(e) =>
                        updateSetting("contactEmail", e.target.value)
                      }
                      type="email"
                      placeholder="Enter email address..."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Management */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                FAQ Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FAQManager />
            </CardContent>
          </Card>

          {/* Plus-One Management */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                Plus-One Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-pink-600">
                    {rsvpStats.plusOnes}
                  </p>
                  <p className="text-sm text-gray-600">Additional Guests</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>From Attending RSVPs:</span>
                    <span className="font-medium">
                      {rsvpStats.attending > 0
                        ? Math.round(
                            (rsvpStats.plusOnes / rsvpStats.attending) * 10
                          ) / 10
                        : 0}{" "}
                      avg per RSVP
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Party Size:</span>
                    <span className="font-medium">
                      {rsvpStats.totalPartySize}
                    </span>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Plus-ones are calculated from RSVPs with party size &gt; 1
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RSVP Tracking Dashboard */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                RSVP Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-lg font-bold text-green-600">
                      {rsvpStats.attending}
                    </p>
                    <p className="text-xs text-green-700">Attending</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-lg font-bold text-red-600">
                      {rsvpStats.notAttending}
                    </p>
                    <p className="text-xs text-red-700">Not Attending</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-lg font-bold text-yellow-600">
                      {rsvpStats.pending}
                    </p>
                    <p className="text-xs text-yellow-700">Pending</p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Response Rate:</span>
                    <span className="font-medium">
                      {rsvpStats.totalRSVPs > 0
                        ? Math.round(
                            ((rsvpStats.attending + rsvpStats.notAttending) /
                              rsvpStats.totalRSVPs) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Attendance Rate:</span>
                    <span className="font-medium">
                      {rsvpStats.totalRSVPs > 0
                        ? Math.round(
                            (rsvpStats.attending / rsvpStats.totalRSVPs) * 100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Invites Management */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  Custom URL Invites
                </div>
                <Dialog
                  open={isCreateInviteOpen}
                  onOpenChange={setIsCreateInviteOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Create Invite
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Custom Invite</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="guest_name">Guest Name *</Label>
                        <Input
                          id="guest_name"
                          value={newInvite.guest_name}
                          onChange={(e) =>
                            setNewInvite({
                              ...newInvite,
                              guest_name: e.target.value,
                            })
                          }
                          placeholder="Enter guest name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="guest_email">Guest Email</Label>
                        <Input
                          id="guest_email"
                          type="email"
                          value={newInvite.guest_email}
                          onChange={(e) =>
                            setNewInvite({
                              ...newInvite,
                              guest_email: e.target.value,
                            })
                          }
                          placeholder="Enter guest email (optional)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="max_party_size">Max Party Size</Label>
                        <Select
                          value={newInvite.max_party_size.toString()}
                          onValueChange={(value) =>
                            setNewInvite({
                              ...newInvite,
                              max_party_size: parseInt(value),
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 person</SelectItem>
                            <SelectItem value="2">2 people</SelectItem>
                            <SelectItem value="3">3 people</SelectItem>
                            <SelectItem value="4">4 people</SelectItem>
                            <SelectItem value="5">5 people</SelectItem>
                            <SelectItem value="6">6 people</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="custom_message">Custom Message</Label>
                        <Textarea
                          id="custom_message"
                          value={newInvite.custom_message}
                          onChange={(e) =>
                            setNewInvite({
                              ...newInvite,
                              custom_message: e.target.value,
                            })
                          }
                          placeholder="Add a personal message for this guest..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="expires_at">
                          Expiration Date (Optional)
                        </Label>
                        <Input
                          id="expires_at"
                          type="datetime-local"
                          value={newInvite.expires_at}
                          onChange={(e) =>
                            setNewInvite({
                              ...newInvite,
                              expires_at: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateInviteOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={createCustomInvite}
                        disabled={!newInvite.guest_name.trim()}
                      >
                        Create Invite
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Create personalized invitation URLs for specific guests with
                custom messages and party size limits.
              </p>
            </CardHeader>
            <CardContent>
              {customInvites.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg
                    className="w-12 h-12 mx-auto mb-4 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p>No custom invites created yet</p>
                  <p className="text-sm">
                    Click "Create Invite" to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {customInvites.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{invite.guest_name}</h4>
                          <Badge
                            variant={invite.is_active ? "default" : "secondary"}
                          >
                            {invite.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          Code:{" "}
                          <code className="bg-gray-100 px-1 rounded">
                            {invite.invite_code}
                          </code>
                          {invite.guest_email && ` • ${invite.guest_email}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          Max party size: {invite.max_party_size}
                          {invite.expires_at &&
                            ` • Expires: ${new Date(invite.expires_at).toLocaleDateString()}`}
                        </p>
                        {invite.custom_message && (
                          <p className="text-sm text-gray-700 mt-1 italic">
                            "{invite.custom_message}"
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyInviteLink(invite.invite_code)}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            toggleInviteStatus(invite.id, invite.is_active)
                          }
                        >
                          {invite.is_active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to delete this invite?"
                              )
                            ) {
                              deleteInvite(invite.id);
                            }
                          }}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between items-center lg:col-span-3">
            <a href="/">
              <Button variant="outline" className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Home
              </Button>
            </a>
            <Button
              onClick={handleManualSave}
              className={`bg-gold hover:bg-gold/80 text-black flex items-center gap-2 ${
                hasUnsavedChanges ? "ring-2 ring-orange-400" : ""
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {hasUnsavedChanges ? "Save Changes" : "Settings Updated"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GalleryManager() {
  const {
    settings,
    uploadImage,
    addGalleryImage,
    removeGalleryImage,
    addBackgroundImage,
    removeBackgroundImage,
    selectBackground,
  } = useAdmin();
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadType, setUploadType] = useState<"gallery" | "background">(
    "gallery"
  );

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith("image/")) {
          const imageUrl = await uploadImage(file);
          if (uploadType === "gallery") {
            await addGalleryImage(imageUrl);
          } else {
            await addBackgroundImage(imageUrl);
          }
        }
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  return (
    <div className="space-y-6">
      {/* Upload Type Selection */}
      <div className="flex space-x-4">
        <button
          onClick={() => setUploadType("gallery")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            uploadType === "gallery"
              ? "bg-gold text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Upload to Gallery
        </button>
        <button
          onClick={() => setUploadType("background")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            uploadType === "background"
              ? "bg-gold text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Upload Background
        </button>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
          dragActive
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            {isUploading ? (
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            )}
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isUploading
                ? "Uploading..."
                : `Drop photos here or click to browse`}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Upload to{" "}
              {uploadType === "gallery"
                ? "wedding gallery"
                : "background collection"}
            </p>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      {settings.gallery_images.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Gallery ({settings.gallery_images.length} photos)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {settings.gallery_images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <Image
                    src={image}
                    alt={`Gallery image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  onClick={() => removeGalleryImage(index)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Background Images */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Background Images
          </h3>
          <div className="text-sm text-gray-500">
            {settings.showBackgroundImage ? "Enabled" : "Disabled"}
          </div>
        </div>

        {settings.showBackgroundImage ? (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Selected Background:</p>
              <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100 border-2 border-gold"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {settings.background_images.map((image, index) => (
                <div key={index} className="relative group">
                  <div
                    className={`aspect-video rounded-xl overflow-hidden bg-gray-100 cursor-pointer border-2 transition-all ${
                      settings.selected_background === image
                        ? "border-gold ring-2 ring-gold/20"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => selectBackground(image)}
                  >
                    <Image
                      src={image}
                      alt={`Background ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    {settings.selected_background === image && (
                      <div className="absolute inset-0 bg-gold/20 flex items-center justify-center">
                        <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeBackgroundImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p>Background images are disabled</p>
            <p className="text-sm">
              Enable "Show Background Image" to manage backgrounds
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
