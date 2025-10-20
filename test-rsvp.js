// Test script to create sample RSVP data
require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestData() {
  const testData = [
    {
      name: "John Doe",
      email: "john@example.com",
      attendance_status: "attending",
      party_size: 2,
      dietary_restrictions: "Vegetarian",
    },
    {
      name: "Jane Smith",
      email: "jane@example.com",
      attendance_status: "attending",
      party_size: 1,
      dietary_restrictions: null,
    },
    {
      name: "Bob Johnson",
      email: "bob@example.com",
      attendance_status: "not attending",
      party_size: 1,
      dietary_restrictions: "Gluten-free",
    },
  ];

  try {
    const { data, error } = await supabase
      .from("rsvp_responses")
      .insert(testData);

    if (error) throw error;

    console.log("Test data created successfully:", data);
  } catch (error) {
    console.error("Error creating test data:", error);
  }
}

createTestData();
