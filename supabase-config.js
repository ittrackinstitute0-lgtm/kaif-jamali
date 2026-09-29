// Kaif Jamali Bikes - Supabase Configuration & Data Service

const SUPABASE_URL = "https://aspnzrvupuwtpvlzphnr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzcG56cnZ1cHV3dHB2bHpwaG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2NjYxOTcsImV4cCI6MjEwNjI0MjE5N30.A4ssSSgwtCBWJmdpKpgHB6WkkARyuE_G51eiockpcOI";

let db = null;
let isSupabaseConnected = false;

// Empty initial bike catalog (All default items removed)
const INITIAL_BIKES = [];

// Initialize Supabase Client
function initSupabase() {
  try {
    if (window.supabase && typeof window.supabase.createClient === "function") {
      db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      isSupabaseConnected = true;
      console.log("Supabase Client initialized successfully for Kaif Jamali Motors.");
    } else {
      console.warn("Supabase library not loaded. Falling back to local storage service.");
    }
  } catch (error) {
    console.error("Error initializing Supabase client:", error);
  }
}

// Local Storage Helpers
function getLocalBikes() {
  const local = localStorage.getItem("kj_bikes");
  if (!local) {
    localStorage.setItem("kj_bikes", JSON.stringify([]));
    return [];
  }
  return JSON.parse(local);
}

function saveLocalBikes(bikes) {
  localStorage.setItem("kj_bikes", JSON.stringify(bikes));
}

function getLocalOrders() {
  const local = localStorage.getItem("kj_orders");
  return local ? JSON.parse(local) : [];
}

function saveLocalOrders(orders) {
  localStorage.setItem("kj_orders", JSON.stringify(orders));
}

// Clear all local bikes cache to ensure items are removed
localStorage.setItem("kj_bikes", JSON.stringify([]));

// API Methods (Supabase + Local Sync)
const DataService = {
  // Fetch All Bikes
  async getBikes() {
    if (isSupabaseConnected && db) {
      try {
        const { data, error } = await db.from("bikes").select("*").order("created_at", { ascending: false });
        if (!error && data) {
          saveLocalBikes(data);
          return { data, source: "Supabase Database" };
        }
      } catch (err) {
        console.warn("Supabase fetch error, using local fallback:", err);
      }
    }
    return { data: getLocalBikes(), source: "Local Storage / Standalone" };
  },

  // Add New Bike
  async addBike(bike) {
    const newBike = {
      ...bike,
      id: bike.id || "bike-" + Date.now(),
      created_at: new Date().toISOString()
    };

    let supabaseSuccess = false;
    if (isSupabaseConnected && db) {
      try {
        const { data, error } = await db.from("bikes").insert([bike]).select();
        if (!error) supabaseSuccess = true;
      } catch (err) {
        console.warn("Supabase insert error:", err);
      }
    }

    // Always sync local storage
    const bikes = getLocalBikes();
    bikes.unshift(newBike);
    saveLocalBikes(bikes);

    return { success: true, bike: newBike, syncedToSupabase: supabaseSuccess };
  },

  // Update Bike
  async updateBike(id, updatedFields) {
    let supabaseSuccess = false;
    if (isSupabaseConnected && db) {
      try {
        const { error } = await db.from("bikes").update(updatedFields).eq("id", id);
        if (!error) supabaseSuccess = true;
      } catch (err) {
        console.warn("Supabase update error:", err);
      }
    }

    const bikes = getLocalBikes();
    const index = bikes.findIndex(b => b.id == id);
    if (index !== -1) {
      bikes[index] = { ...bikes[index], ...updatedFields };
      saveLocalBikes(bikes);
    }
    return { success: true, syncedToSupabase: supabaseSuccess };
  },

  // Delete Single Bike
  async deleteBike(id) {
    let supabaseSuccess = false;
    if (isSupabaseConnected && db) {
      try {
        const { error } = await db.from("bikes").delete().eq("id", id);
        if (!error) supabaseSuccess = true;
      } catch (err) {
        console.warn("Supabase delete error:", err);
      }
    }

    const bikes = getLocalBikes().filter(b => b.id != id);
    saveLocalBikes(bikes);
    return { success: true, syncedToSupabase: supabaseSuccess };
  },

  // Delete ALL Bikes from website & database
  async removeAllBikes() {
    let supabaseSuccess = false;
    if (isSupabaseConnected && db) {
      try {
        const { error } = await db.from("bikes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        if (!error) supabaseSuccess = true;
      } catch (err) {
        console.warn("Supabase remove all error:", err);
      }
    }

    saveLocalBikes([]);
    return { success: true, syncedToSupabase: supabaseSuccess };
  },

  // Submit Order / Inquiry
  async submitOrder(orderData) {
    const newOrder = {
      id: "ord-" + Date.now(),
      ...orderData,
      status: "Pending",
      created_at: new Date().toISOString()
    };

    let supabaseSuccess = false;
    if (isSupabaseConnected && db) {
      try {
        const { data, error } = await db.from("orders").insert([{
          customer_name: orderData.customer_name,
          customer_email: orderData.customer_email,
          customer_phone: orderData.customer_phone,
          city: orderData.city,
          bike_id: orderData.bike_id,
          bike_title: orderData.bike_title,
          bike_price: orderData.bike_price,
          message: orderData.message || "",
          status: "Pending"
        }]).select();

        if (!error) supabaseSuccess = true;
      } catch (err) {
        console.warn("Supabase order submit error:", err);
      }
    }

    const orders = getLocalOrders();
    orders.unshift(newOrder);
    saveLocalOrders(orders);

    return { success: true, order: newOrder, syncedToSupabase: supabaseSuccess };
  },

  // Fetch All Orders (Admin)
  async getOrders() {
    if (isSupabaseConnected && db) {
      try {
        const { data, error } = await db.from("orders").select("*").order("created_at", { ascending: false });
        if (!error && data) {
          saveLocalOrders(data);
          return { data, source: "Supabase Database" };
        }
      } catch (err) {
        console.warn("Supabase order fetch error:", err);
      }
    }
    return { data: getLocalOrders(), source: "Local Storage" };
  },

  // Update Order Status (Admin)
  async updateOrderStatus(id, newStatus) {
    let supabaseSuccess = false;
    if (isSupabaseConnected && db) {
      try {
        const { error } = await db.from("orders").update({ status: newStatus }).eq("id", id);
        if (!error) supabaseSuccess = true;
      } catch (err) {
        console.warn("Supabase order update error:", err);
      }
    }

    const orders = getLocalOrders();
    const index = orders.findIndex(o => o.id == id);
    if (index !== -1) {
      orders[index].status = newStatus;
      saveLocalOrders(orders);
    }
    return { success: true, syncedToSupabase: supabaseSuccess };
  }
};

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  initSupabase();
});
