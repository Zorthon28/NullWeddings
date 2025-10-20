"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdmin } from "@/contexts/AdminContext";
import RichTextEditor from "@/components/ui/richtext-editor";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Edit, Trash2, Plus } from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

interface SortableFAQItemProps {
  faq: FAQ;
  onEdit: (faq: FAQ) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
}

function SortableFAQItem({
  faq,
  onEdit,
  onDelete,
  onToggle,
}: SortableFAQItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: faq.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-4 bg-white border rounded-lg shadow-sm"
    >
      <button
        className="cursor-grab hover:text-gray-700 text-gray-400"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-5 h-5" />
      </button>

      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{faq.question}</h3>
        <div
          className="text-sm text-gray-600 mt-1 line-clamp-2"
          dangerouslySetInnerHTML={{ __html: faq.answer }}
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={faq.is_enabled}
          onCheckedChange={(checked) => onToggle(faq.id, checked)}
        />
        <Button variant="outline" size="sm" onClick={() => onEdit(faq)}>
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(faq.id)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function FAQManager() {
  const { faqs, createFAQ, updateFAQ, deleteFAQ, reorderFAQs } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    is_enabled: true,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFAQ) {
        await updateFAQ(editingFAQ.id, {
          question: formData.question,
          answer: formData.answer,
          is_enabled: formData.is_enabled,
        });
      } else {
        await createFAQ({
          question: formData.question,
          answer: formData.answer,
          is_enabled: formData.is_enabled,
          sort_order: faqs.length,
        });
      }
      resetForm();
    } catch (error) {
      console.error("Error saving FAQ:", error);
      alert("Failed to save FAQ. Please try again.");
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFAQ(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      is_enabled: faq.is_enabled,
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this FAQ?")) {
      try {
        await deleteFAQ(id);
      } catch (error) {
        console.error("Error deleting FAQ:", error);
        alert("Failed to delete FAQ. Please try again.");
      }
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await updateFAQ(id, { is_enabled: enabled });
    } catch (error) {
      console.error("Error updating FAQ:", error);
      alert("Failed to update FAQ. Please try again.");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = faqs.findIndex((faq) => faq.id === active.id);
      const newIndex = faqs.findIndex((faq) => faq.id === over.id);

      const reorderedFaqs = arrayMove(faqs, oldIndex, newIndex);
      // Update sort_order for all FAQs
      const updatedFaqs = reorderedFaqs.map((faq, index) => ({
        ...faq,
        sort_order: index,
      }));

      try {
        await reorderFAQs(updatedFaqs);
      } catch (error) {
        console.error("Error reordering FAQs:", error);
        alert("Failed to reorder FAQs. Please try again.");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      question: "",
      answer: "",
      is_enabled: true,
    });
    setEditingFAQ(null);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            FAQ Management
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
            >
              <Plus className="w-4 h-4 mr-2" />
              {isEditing ? "Cancel" : "Add FAQ"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing && (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <div>
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  placeholder="Enter the FAQ question"
                  required
                />
              </div>
              <div>
                <Label htmlFor="answer">Answer</Label>
                <RichTextEditor
                  value={formData.answer}
                  onChange={(value) =>
                    setFormData({ ...formData, answer: value })
                  }
                  placeholder="Enter the FAQ answer"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_enabled"
                  checked={formData.is_enabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_enabled: checked })
                  }
                />
                <Label htmlFor="is_enabled">Enabled</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingFAQ ? "Update FAQ" : "Create FAQ"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              FAQs ({faqs.length})
            </h3>

            {faqs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No FAQs created yet.</p>
                <p className="text-sm">
                  Click "Add FAQ" to create your first FAQ.
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={faqs.map((faq) => faq.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {faqs.map((faq) => (
                      <SortableFAQItem
                        key={faq.id}
                        faq={faq}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggle={handleToggle}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
