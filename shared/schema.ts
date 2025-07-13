import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionPlan: varchar("subscription_plan"), // bronze, silver, gold
  subscriptionStatus: varchar("subscription_status"), // active, canceled, expired
  agencyName: varchar("agency_name"),
  licenseNumber: varchar("license_number"),
  phoneNumber: varchar("phone_number"),
  whatsappNumber: varchar("whatsapp_number"),
  languagesSpoken: text("languages_spoken").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  listingType: varchar("listing_type").notNull(), // for_sale, for_rent, pre_sale
  propertyType: varchar("property_type").notNull(), // apartment, villa, commercial, land
  status: varchar("status").notNull().default("active"), // active, pending, archived, sold, removed
  
  // Location
  country: varchar("country").notNull(),
  city: varchar("city").notNull(),
  streetAddress: varchar("street_address").notNull(),
  stateProvince: varchar("state_province"),
  postalCode: varchar("postal_code"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  
  // Price & Financials
  price: decimal("price", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default("USD"),
  paymentFrequency: varchar("payment_frequency").notNull(), // one_time, monthly, yearly
  isNegotiable: boolean("is_negotiable").default(false),
  acceptsCrypto: boolean("accepts_crypto").default(false),
  acceptedCryptos: text("accepted_cryptos").array(),
  maintenanceFees: decimal("maintenance_fees", { precision: 12, scale: 2 }),
  propertyTaxes: decimal("property_taxes", { precision: 12, scale: 2 }),
  
  // Property Metrics
  totalArea: decimal("total_area", { precision: 10, scale: 2 }),
  livingArea: decimal("living_area", { precision: 10, scale: 2 }),
  lotSize: decimal("lot_size", { precision: 10, scale: 2 }),
  areaUnit: varchar("area_unit").default("sqm"), // sqm, sqft
  yearBuilt: integer("year_built"),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  floors: integer("floors"),
  parkingSpaces: integer("parking_spaces"),
  furnishingStatus: varchar("furnishing_status"), // yes, partially, no
  floorNumber: integer("floor_number"),
  hasElevator: boolean("has_elevator").default(false),
  view: varchar("view"), // sea, mountain, city, garden
  energyRating: varchar("energy_rating"),
  
  // Features & Amenities
  features: text("features").array(),
  nearbyPlaces: text("nearby_places").array(),
  
  // Media
  coverImage: varchar("cover_image"),
  galleryImages: text("gallery_images").array(),
  videoTourUrl: varchar("video_tour_url"),
  virtualTourUrl: varchar("virtual_tour_url"),
  floorPlanImage: varchar("floor_plan_image"),
  
  // Availability & Legal
  availableFrom: timestamp("available_from"),
  ownershipType: varchar("ownership_type"), // freehold, leasehold
  titleDeedAvailable: boolean("title_deed_available").default(false),
  exclusiveListing: boolean("exclusive_listing").default(false),
  
  // SEO & Search
  searchableLocation: text("searchable_location"), // Combined location text for search
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const propertyInquiries = pgTable("property_inquiries", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  agentId: varchar("agent_id").notNull().references(() => users.id),
  inquirerName: varchar("inquirer_name").notNull(),
  inquirerEmail: varchar("inquirer_email").notNull(),
  inquirerPhone: varchar("inquirer_phone"),
  message: text("message"),
  status: varchar("status").default("new"), // new, contacted, qualified, closed
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  properties: many(properties),
  inquiries: many(propertyInquiries),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  agent: one(users, {
    fields: [properties.agentId],
    references: [users.id],
  }),
  inquiries: many(propertyInquiries),
}));

export const propertyInquiriesRelations = relations(propertyInquiries, ({ one }) => ({
  property: one(properties, {
    fields: [propertyInquiries.propertyId],
    references: [properties.id],
  }),
  agent: one(users, {
    fields: [propertyInquiries.agentId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertyInquirySchema = createInsertSchema(propertyInquiries).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;
export type InsertPropertyInquiry = z.infer<typeof insertPropertyInquirySchema>;
export type PropertyInquiry = typeof propertyInquiries.$inferSelect;

// Property with agent info
export type PropertyWithAgent = Property & {
  agent: User;
};
