# Integrations & Connectors Specification

## Overview
Odyssey.ai interacts with the real world through a robust Action Engine utilizing Connectors. Each Connector is an isolated module responsible for standardizing input/output with an external API.

## Core Connectors

### 1. Google Places API (Restaurant & Venues)
- **Status:** Integrated (Mock mode active pending API Key)
- **Purpose:** Finding high-quality venues, restaurants, and coworking spaces worldwide.
- **Input Parameters:** Location (lat/lng or city name), Query ("Japonais", "Quiet cafe"), Price Level.
- **Data Extracted:** Name, Rating, Price Level, Address, Map Link, Open Status.

### 2. Google Calendar / Gmail (OAuth2)
- **Status:** Planned
- **Purpose:** 
  - Read: Analyzing user's schedule to find free slots. Searching emails for flight tickets and reservations.
  - Write: Booking events, sending follow-up emails for networking.
- **Security:** Requires strict OAuth consent screens, granular scopes (`calendar.events`, `gmail.send`).

### 3. Stripe (Payments & Invoices)
- **Status:** Planned
- **Purpose:** If Odyssey.ai becomes SaaS, this handles subscriptions. Potentially, it could eventually handle making payments on behalf of the user (highly restricted, requiring Virtual Cards).

### 4. Skyscanner / Amadeus (Travel)
- **Status:** Planned
- **Purpose:** Finding optimal flight routes for Digital Nomads.
- **Input:** Origin, Destination, Dates, Flexibility.

## Fallback Mechanisms (The "Concierge" Approach)
If an API fails or doesn't support direct booking (e.g., booking a specific non-chain restaurant):
1. **Deep Linking:** The Connector returns a direct URL to the booking page pre-filled with the target destination.
2. **Concierge Guide:** JARVIS generates a step-by-step instruction sheet (e.g., "Call +33 1 23 45 67 89. Ask for a table for 2 at 8 PM by the window. Tell them it's an anniversary.").

## Security & Human-in-the-loop
All Connectors that perform **write** actions (booking, paying, emailing) MUST pass through the `CommandCenter`'s **Confirmation Phase**. 
- Action Planners generate an `ActionPlan` with `requiresConfirmation: true`.
- The UX blocks actual execution until the user manually presses "Confirmer".
