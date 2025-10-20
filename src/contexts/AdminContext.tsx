"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

interface AdminSettings {
  id?: string;
  names: string;
  subtitle: string;
  weddingDate: string;
  invitationText: string;
  location: string;
  showCountdown: boolean;
  showRSVP: boolean;
  showGuestBook: boolean;
  showPhotoGallery: boolean;
  showItinerary: boolean;
  showGiftRegistry: boolean;
  showAccommodation: boolean;
  showContact: boolean;
  showBackgroundImage: boolean;
  gallery_images: string[];
  background_images: string[];
  selected_background: string;
  itineraryContent?: string;
  accommodationContent?: string;
  giftRegistryContent?: string;
  itineraryMessage?: string;
  accommodationMessage?: string;
  giftRegistryMessage?: string;
  contactPhone?: string;
  contactEmail?: string;
  created_at?: string;
  updated_at?: string;
}

const defaultSettings: Omit<AdminSettings, "id" | "created_at" | "updated_at"> =
  {
    names: "Kenia y Gustavo",
    subtitle: "NOS CASAMOS",
    weddingDate: "21 de noviembre, 2025",
    invitationText: "Te invitamos a celebrar con nosotros",
    location: "TBD",
    showCountdown: true,
    showRSVP: true,
    showGuestBook: true,
    showPhotoGallery: true,
    showItinerary: true,
    showGiftRegistry: true,
    showAccommodation: true,
    showContact: true,
    showBackgroundImage: true,
    gallery_images: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800&h=600&fit=crop",
    ],
    background_images: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&h=1080&fit=crop",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1920&h=1080&fit=crop",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=1920&h=1080&fit=crop",
    ],
    selected_background:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&h=1080&fit=crop",
    itineraryContent: "",
    accommodationContent: "",
    giftRegistryContent: "",
    itineraryMessage: "",
    accommodationMessage: "",
    giftRegistryMessage: "",
    contactPhone: "(555) 123-4567",
    contactEmail: "info@wedding.com",
  };

const AdminContext = createContext<{
  settings: Omit<AdminSettings, "id" | "created_at" | "updated_at">;
  updateSetting: (key: string, value: any) => void;
  isLoading: boolean;
  user: any;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  uploadImage: (file: File) => Promise<string>;
  addGalleryImage: (imageUrl: string) => Promise<void>;
  removeGalleryImage: (index: number) => Promise<void>;
  addBackgroundImage: (imageUrl: string) => Promise<void>;
  removeBackgroundImage: (index: number) => Promise<void>;
  selectBackground: (imageUrl: string) => Promise<void>;
  faqs: FAQ[];
  loadFAQs: () => Promise<void>;
  createFAQ: (
    faq: Omit<FAQ, "id" | "created_at" | "updated_at">
  ) => Promise<void>;
  updateFAQ: (id: string, faq: Partial<FAQ>) => Promise<void>;
  deleteFAQ: (id: string) => Promise<void>;
  reorderFAQs: (faqs: FAQ[]) => Promise<void>;
} | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] =
    useState<Omit<AdminSettings, "id" | "created_at" | "updated_at">>(
      defaultSettings
    );
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  useEffect(() => {
    // Load settings immediately (public data)
    loadSettings();

    // Check for existing session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        loadFAQs();
      }
      setIsLoading(false);
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadFAQs();
      }
      // Settings are already loaded, no need to reload on auth change
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("*")
        .eq("id", "main")
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found"
        console.error("Error loading settings:", error);
        return;
      }

      if (data) {
        const { id, created_at, updated_at, ...rawData } = data;
        // Map snake_case to camelCase
        const settingsData = {
          names: rawData.names,
          subtitle: rawData.subtitle,
          weddingDate: rawData.wedding_date,
          invitationText: rawData.invitation_text,
          location: rawData.location,
          showCountdown: rawData.show_countdown,
          showRSVP: rawData.show_rsvp,
          showGuestBook: rawData.show_guest_book,
          showPhotoGallery: rawData.show_photo_gallery,
          showItinerary: rawData.show_itinerary ?? true,
          showGiftRegistry: rawData.show_gift_registry ?? true,
          showAccommodation: rawData.show_accommodation ?? true,
          showContact: rawData.show_contact ?? true,
          gallery_images: Array.isArray(rawData.gallery_images)
            ? rawData.gallery_images
            : defaultSettings.gallery_images,
          background_images: Array.isArray(rawData.background_images)
            ? rawData.background_images
            : defaultSettings.background_images,
          selected_background: rawData.selected_background
            ? rawData.selected_background
            : defaultSettings.selected_background,
          showBackgroundImage: rawData.show_background_image ?? true,
          itineraryContent: rawData.itinerary_content || "",
          accommodationContent: rawData.accommodation_content || "",
          giftRegistryContent: rawData.gift_registry_content || "",
          itineraryMessage: rawData.itinerary_message || "",
          accommodationMessage: rawData.accommodation_message || "",
          giftRegistryMessage: rawData.gift_registry_message || "",
          contactPhone: rawData.contact_phone || defaultSettings.contactPhone,
          contactEmail: rawData.contact_email || defaultSettings.contactEmail,
        };
        setSettings(settingsData);
      } else {
        // If no record exists, create one with defaults
        await saveSettings(defaultSettings);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveSettings = async (
    newSettings: Omit<AdminSettings, "id" | "created_at" | "updated_at">
  ) => {
    try {
      // Map camelCase to snake_case for database
      const dbData = {
        id: "main", // Fixed ID for single record
        names: newSettings.names,
        subtitle: newSettings.subtitle,
        wedding_date: newSettings.weddingDate,
        invitation_text: newSettings.invitationText,
        location: newSettings.location,
        show_countdown: newSettings.showCountdown,
        show_rsvp: newSettings.showRSVP,
        show_guest_book: newSettings.showGuestBook,
        show_photo_gallery: newSettings.showPhotoGallery,
        show_itinerary: newSettings.showItinerary,
        show_gift_registry: newSettings.showGiftRegistry,
        show_accommodation: newSettings.showAccommodation,
        show_contact: newSettings.showContact,
        gallery_images: newSettings.gallery_images,
        background_images: newSettings.background_images,
        selected_background: newSettings.selected_background,
        show_background_image: newSettings.showBackgroundImage,
        itinerary_content: newSettings.itineraryContent,
        accommodation_content: newSettings.accommodationContent,
        gift_registry_content: newSettings.giftRegistryContent,
        itinerary_message: newSettings.itineraryMessage,
        accommodation_message: newSettings.accommodationMessage,
        gift_registry_message: newSettings.giftRegistryMessage,
        contact_phone: newSettings.contactPhone,
        contact_email: newSettings.contactEmail,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("admin_settings")
        .upsert(dbData, { onConflict: "id" });

      if (error) {
        console.error("Error saving settings:", error);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `gallery/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("wedding-images")
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("wedding-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const addGalleryImage = async (imageUrl: string) => {
    const newImages = [...settings.gallery_images, imageUrl];
    setSettings({ ...settings, gallery_images: newImages });
    await saveSettings({ ...settings, gallery_images: newImages });
  };

  const removeGalleryImage = async (index: number) => {
    const newImages = settings.gallery_images.filter((_, i) => i !== index);
    setSettings({ ...settings, gallery_images: newImages });
    await saveSettings({ ...settings, gallery_images: newImages });
  };

  const addBackgroundImage = async (imageUrl: string) => {
    const newImages = [...settings.background_images, imageUrl];
    setSettings({ ...settings, background_images: newImages });
    await saveSettings({ ...settings, background_images: newImages });
  };

  const removeBackgroundImage = async (index: number) => {
    const newImages = settings.background_images.filter((_, i) => i !== index);
    const newSelected =
      settings.selected_background === settings.background_images[index]
        ? newImages[0] || defaultSettings.selected_background
        : settings.selected_background;

    setSettings({
      ...settings,
      background_images: newImages,
      selected_background: newSelected,
    });
    await saveSettings({
      ...settings,
      background_images: newImages,
      selected_background: newSelected,
    });
  };

  const selectBackground = async (imageUrl: string) => {
    setSettings({ ...settings, selected_background: imageUrl });
    await saveSettings({ ...settings, selected_background: imageUrl });
  };

  const loadFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Error loading FAQs:", error);
        return;
      }

      setFaqs(data || []);
    } catch (error) {
      console.error("Error loading FAQs:", error);
    }
  };

  const createFAQ = async (
    faq: Omit<FAQ, "id" | "created_at" | "updated_at">
  ) => {
    try {
      const { data, error } = await supabase
        .from("faqs")
        .insert([faq])
        .select()
        .single();

      if (error) {
        console.error("Error creating FAQ:", error);
        throw error;
      }

      setFaqs((prev) =>
        [...prev, data].sort((a, b) => a.sort_order - b.sort_order)
      );
    } catch (error) {
      console.error("Error creating FAQ:", error);
      throw error;
    }
  };

  const updateFAQ = async (id: string, updates: Partial<FAQ>) => {
    try {
      const { data, error } = await supabase
        .from("faqs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating FAQ:", error);
        throw error;
      }

      setFaqs((prev) =>
        prev
          .map((faq) => (faq.id === id ? data : faq))
          .sort((a, b) => a.sort_order - b.sort_order)
      );
    } catch (error) {
      console.error("Error updating FAQ:", error);
      throw error;
    }
  };

  const deleteFAQ = async (id: string) => {
    try {
      const { error } = await supabase.from("faqs").delete().eq("id", id);

      if (error) {
        console.error("Error deleting FAQ:", error);
        throw error;
      }

      setFaqs((prev) => prev.filter((faq) => faq.id !== id));
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      throw error;
    }
  };

  const reorderFAQs = async (reorderedFaqs: FAQ[]) => {
    try {
      // Update sort_order for each FAQ
      const updates = reorderedFaqs.map((faq, index) => ({
        id: faq.id,
        sort_order: index,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("faqs")
          .update({ sort_order: update.sort_order })
          .eq("id", update.id);

        if (error) {
          console.error("Error updating FAQ order:", error);
          throw error;
        }
      }

      setFaqs(reorderedFaqs);
    } catch (error) {
      console.error("Error reordering FAQs:", error);
      throw error;
    }
  };

  return (
    <AdminContext.Provider
      value={{
        settings,
        updateSetting,
        isLoading,
        user,
        signIn,
        signOut,
        uploadImage,
        addGalleryImage,
        removeGalleryImage,
        addBackgroundImage,
        removeBackgroundImage,
        selectBackground,
        faqs,
        loadFAQs,
        createFAQ,
        updateFAQ,
        deleteFAQ,
        reorderFAQs,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
}
