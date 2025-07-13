import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertPropertySchema, insertPropertyInquirySchema } from "@shared/schema";
import { z } from "zod";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Public property routes
  app.get("/api/properties", async (req, res) => {
    try {
      const {
        location,
        minPrice,
        maxPrice,
        propertyType,
        bedrooms,
        bathrooms,
        features,
        limit,
        offset
      } = req.query;

      const filters = {
        location: location as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        propertyType: propertyType as string,
        bedrooms: bedrooms ? parseInt(bedrooms as string) : undefined,
        bathrooms: bathrooms ? parseInt(bathrooms as string) : undefined,
        features: features ? (features as string).split(',') : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      };

      const properties = await storage.getProperties(filters);
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const property = await storage.getPropertyById(id);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.json(property);
    } catch (error) {
      console.error("Error fetching property:", error);
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  // Property inquiry route
  app.post("/api/properties/:id/inquire", async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getPropertyById(propertyId);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      const inquiryData = insertPropertyInquirySchema.parse({
        ...req.body,
        propertyId,
        agentId: property.agentId,
      });

      const inquiry = await storage.createInquiry(inquiryData);
      res.json(inquiry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid inquiry data", errors: error.errors });
      }
      console.error("Error creating inquiry:", error);
      res.status(500).json({ message: "Failed to create inquiry" });
    }
  });

  // Protected agent routes
  app.get("/api/agent/properties", isAuthenticated, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      const properties = await storage.getPropertiesByAgent(agentId);
      res.json(properties);
    } catch (error) {
      console.error("Error fetching agent properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.post("/api/agent/properties", isAuthenticated, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      
      console.log("Request body received:", JSON.stringify(req.body, null, 2));
      
      const propertyData = insertPropertySchema.parse({
        ...req.body,
        agentId,
      });

      console.log("Parsed property data:", JSON.stringify(propertyData, null, 2));

      const property = await storage.createProperty(propertyData);
      res.json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ 
          message: "Invalid property data", 
          errors: error.errors,
          received: req.body 
        });
      }
      console.error("Error creating property:", error);
      res.status(500).json({ message: "Failed to create property", error: error.message });
    }
  });

  app.put("/api/agent/properties/:id", isAuthenticated, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      const propertyId = parseInt(req.params.id);
      
      // Verify the property belongs to the agent
      const existingProperty = await storage.getPropertyById(propertyId);
      if (!existingProperty || existingProperty.agentId !== agentId) {
        return res.status(404).json({ message: "Property not found" });
      }

      const propertyData = insertPropertySchema.partial().parse(req.body);
      const property = await storage.updateProperty(propertyId, propertyData);
      res.json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid property data", errors: error.errors });
      }
      console.error("Error updating property:", error);
      res.status(500).json({ message: "Failed to update property" });
    }
  });

  app.delete("/api/agent/properties/:id", isAuthenticated, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      const propertyId = parseInt(req.params.id);
      
      // Verify the property belongs to the agent
      const existingProperty = await storage.getPropertyById(propertyId);
      if (!existingProperty || existingProperty.agentId !== agentId) {
        return res.status(404).json({ message: "Property not found" });
      }

      await storage.deleteProperty(propertyId);
      res.json({ message: "Property deleted successfully" });
    } catch (error) {
      console.error("Error deleting property:", error);
      res.status(500).json({ message: "Failed to delete property" });
    }
  });

  // Agent inquiries
  app.get("/api/agent/inquiries", isAuthenticated, async (req: any, res) => {
    try {
      const agentId = req.user.claims.sub;
      const inquiries = await storage.getInquiriesByAgent(agentId);
      res.json(inquiries);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      res.status(500).json({ message: "Failed to fetch inquiries" });
    }
  });

  // Stripe subscription routes
  app.post('/api/create-subscription', isAuthenticated, async (req: any, res) => {
    const user = req.user;

    if (user.stripeSubscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId, {
        expand: ['latest_invoice.payment_intent'],
      });

      const latestInvoice = subscription.latest_invoice as any;
      const clientSecret = latestInvoice?.payment_intent?.client_secret || null;

      res.send({
        subscriptionId: subscription.id,
        clientSecret,
      });

      return;
    }
    
    if (!user.claims.email) {
      return res.status(400).json({ error: { message: 'No user email on file' } });
    }

    try {
      const { priceId } = req.body;
      
      if (!priceId) {
        return res.status(400).json({ error: { message: 'Price ID is required' } });
      }

      let customerId = user.stripeCustomerId;
      
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.claims.email,
          name: `${user.claims.first_name || ''} ${user.claims.last_name || ''}`.trim(),
        });
        
        customerId = customer.id;
        await storage.updateUserStripeInfo(user.claims.sub, customerId);
      }

      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price: priceId,
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      await storage.updateUserStripeInfo(user.claims.sub, customerId, subscription.id);

      const latestInvoice = subscription.latest_invoice as any;
      const clientSecret = latestInvoice?.payment_intent?.client_secret || null;
  
      res.send({
        subscriptionId: subscription.id,
        clientSecret,
      });
    } catch (error: any) {
      console.error('Stripe error:', error);
      return res.status(400).send({ error: { message: error.message } });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
