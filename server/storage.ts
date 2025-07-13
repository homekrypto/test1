import {
  users,
  properties,
  propertyInquiries,
  type User,
  type UpsertUser,
  type Property,
  type InsertProperty,
  type PropertyWithAgent,
  type PropertyInquiry,
  type InsertPropertyInquiry,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ilike, or, gte, lte, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(id: string, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User>;
  
  // Property operations
  getProperties(filters?: {
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    propertyType?: string;
    bedrooms?: number;
    bathrooms?: number;
    features?: string[];
    limit?: number;
    offset?: number;
  }): Promise<PropertyWithAgent[]>;
  getPropertyById(id: number): Promise<PropertyWithAgent | undefined>;
  getPropertiesByAgent(agentId: string): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property>;
  deleteProperty(id: number): Promise<void>;
  
  // Inquiry operations
  createInquiry(inquiry: InsertPropertyInquiry): Promise<PropertyInquiry>;
  getInquiriesByAgent(agentId: string): Promise<PropertyInquiry[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(id: string, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId,
        stripeSubscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Property operations
  async getProperties(filters: {
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    propertyType?: string;
    bedrooms?: number;
    bathrooms?: number;
    features?: string[];
    limit?: number;
    offset?: number;
  } = {}): Promise<PropertyWithAgent[]> {
    let query = db
      .select()
      .from(properties)
      .innerJoin(users, eq(properties.agentId, users.id))
      .where(eq(properties.status, "active"));

    // Apply filters
    const conditions = [eq(properties.status, "active")];

    if (filters.location) {
      conditions.push(
        or(
          ilike(properties.city, `%${filters.location}%`),
          ilike(properties.country, `%${filters.location}%`),
          ilike(properties.searchableLocation, `%${filters.location}%`)
        )!
      );
    }

    if (filters.minPrice) {
      conditions.push(gte(properties.price, filters.minPrice.toString()));
    }

    if (filters.maxPrice) {
      conditions.push(lte(properties.price, filters.maxPrice.toString()));
    }

    if (filters.propertyType) {
      conditions.push(eq(properties.propertyType, filters.propertyType));
    }

    if (filters.bedrooms) {
      conditions.push(gte(properties.bedrooms, filters.bedrooms));
    }

    if (filters.bathrooms) {
      conditions.push(gte(properties.bathrooms, filters.bathrooms));
    }

    if (filters.features && filters.features.length > 0) {
      // Check if property has any of the specified features
      conditions.push(
        or(
          ...filters.features.map(feature => 
            ilike(properties.features, `%${feature}%`)
          )
        )!
      );
    }

    const results = await db
      .select()
      .from(properties)
      .innerJoin(users, eq(properties.agentId, users.id))
      .where(and(...conditions))
      .orderBy(desc(properties.createdAt))
      .limit(filters.limit || 20)
      .offset(filters.offset || 0);

    return results.map(result => ({
      ...result.properties,
      agent: result.users,
    }));
  }

  async getPropertyById(id: number): Promise<PropertyWithAgent | undefined> {
    const [result] = await db
      .select()
      .from(properties)
      .innerJoin(users, eq(properties.agentId, users.id))
      .where(eq(properties.id, id));

    if (!result) return undefined;

    return {
      ...result.properties,
      agent: result.users,
    };
  }

  async getPropertiesByAgent(agentId: string): Promise<Property[]> {
    return await db
      .select()
      .from(properties)
      .where(eq(properties.agentId, agentId))
      .orderBy(desc(properties.createdAt));
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    // Create searchable location text
    const searchableLocation = `${property.city}, ${property.stateProvince || ''}, ${property.country}`.replace(/,\s*,/g, ',').trim();
    
    const [created] = await db
      .insert(properties)
      .values({
        ...property,
        searchableLocation,
      })
      .returning();
    return created;
  }

  async updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property> {
    const [updated] = await db
      .update(properties)
      .set({
        ...property,
        updatedAt: new Date(),
      })
      .where(eq(properties.id, id))
      .returning();
    return updated;
  }

  async deleteProperty(id: number): Promise<void> {
    await db.delete(properties).where(eq(properties.id, id));
  }

  // Inquiry operations
  async createInquiry(inquiry: InsertPropertyInquiry): Promise<PropertyInquiry> {
    const [created] = await db
      .insert(propertyInquiries)
      .values(inquiry)
      .returning();
    return created;
  }

  async getInquiriesByAgent(agentId: string): Promise<PropertyInquiry[]> {
    return await db
      .select()
      .from(propertyInquiries)
      .where(eq(propertyInquiries.agentId, agentId))
      .orderBy(desc(propertyInquiries.createdAt));
  }
}

export const storage = new DatabaseStorage();
