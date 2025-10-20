"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Ornament } from "./Ornament";
import { supabase } from "../lib/supabase";
import { useToast } from "./ui/use-toast";

// Validation schema
const rsvpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  partySize: z.string().min(1, "Please select party size"),
  dietaryRestrictions: z.string().optional(),
});

type RSVPFormData = z.infer<typeof rsvpSchema>;

/**
 * RSVPSection component displaying an RSVP form with validation and state management.
 * @returns JSX.Element
 */
export default function RSVPSection() {
  const shouldReduceMotion = useReducedMotion();
  const { toast } = useToast();

  const form = useForm<RSVPFormData>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      name: "",
      email: "",
      partySize: "",
      dietaryRestrictions: "",
    },
  });

  const onSubmit = async (data: RSVPFormData) => {
    try {
      const { error } = await supabase.from("rsvp_responses").insert([
        {
          name: data.name,
          email: data.email,
          party_size: parseInt(data.partySize),
          dietary_restrictions: data.dietaryRestrictions || null,
        },
      ]);

      if (error) {
        throw error;
      }

      toast({
        title: "RSVP Submitted Successfully!",
        description: "Thank you for your RSVP! We look forward to seeing you.",
      });

      form.reset();
    } catch (error) {
      console.error("Error submitting RSVP:", error);
      toast({
        title: "Error Submitting RSVP",
        description:
          "There was an error submitting your RSVP. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <section
      id="rsvp"
      className="py-20 px-4 bg-gradient-to-b from-white to-gray-50"
    >
      <div className="max-w-2xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={shouldReduceMotion ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                staggerChildren: shouldReduceMotion ? 0 : 0.2,
              },
            },
          }}
        >
          <Ornament className="mb-8" />
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            variants={{
              hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            RSVP
          </motion.h2>
          <motion.p
            className="text-lg text-gray-600"
            variants={{
              hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            Please let us know if you'll be joining us for our special day
          </motion.p>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-lg p-8"
          initial={shouldReduceMotion ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 30 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: shouldReduceMotion ? 0 : 0.6 },
            },
          }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-semibold">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        {...field}
                        className="border-gray-300 focus:border-gold focus:ring-gold"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-semibold">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        {...field}
                        className="border-gray-300 focus:border-gold focus:ring-gold"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="partySize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-semibold">
                      Party Size
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-gray-300 focus:border-gold focus:ring-gold">
                          <SelectValue placeholder="Select number of guests" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(
                          (num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? "guest" : "guests"}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dietaryRestrictions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-semibold">
                      Dietary Restrictions (Optional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please let us know about any dietary restrictions or allergies"
                        className="border-gray-300 focus:border-gold focus:ring-gold resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold/80 text-black font-semibold py-3 rounded-full text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-white"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Submitting..." : "Send RSVP"}
              </Button>
            </form>
          </Form>
        </motion.div>
      </div>
    </section>
  );
}
