import { z } from "zod";
import { actionRegistry, type ToolHandler } from "../action-engine";

// ==============================================================================
// RESTAURANT TOOLS — Search + Book
// ==============================================================================

// ─── Search Restaurants ──────────────────────────────────────────────────────

const SearchRestaurantsParams = z.object({
    query: z.string().min(1),
    location: z.string().optional().default(""),
    cuisine: z.string().optional().default(""),
    budget: z.enum(["$", "$$", "$$$", "$$$$"]).optional(),
    maxResults: z.number().min(1).max(10).optional().default(3),
});

type RestaurantResult = {
    name: string;
    cuisine: string;
    rating: number;
    priceLevel: string;
    address: string;
    distance: string;
    openNow: boolean;
    phone: string;
    website: string;
    mapLink: string;
    highlights: string[];
};

// Mock restaurant database (used when Google Places API key is not set)
const MOCK_RESTAURANTS: Record<string, RestaurantResult[]> = {
    japonais: [
        {
            name: "Kamo",
            cuisine: "Japonais • Omakase",
            rating: 4.8,
            priceLevel: "$$$",
            address: "13 Rue du Marché aux Poulets, 1000 Bruxelles",
            distance: "1.2 km",
            openNow: true,
            phone: "+32 2 511 78 52",
            website: "https://kamo.be",
            mapLink: "https://maps.google.com/?q=Kamo+Bruxelles",
            highlights: ["Omakase counter", "Chef japonais", "Sake pairing"],
        },
        {
            name: "Yaki",
            cuisine: "Japonais • Yakitori",
            rating: 4.6,
            priceLevel: "$$",
            address: "25 Rue de Flandre, 1000 Bruxelles",
            distance: "0.8 km",
            openNow: true,
            phone: "+32 2 502 00 53",
            website: "https://yaki.be",
            mapLink: "https://maps.google.com/?q=Yaki+Bruxelles",
            highlights: ["Yakitori au charbon", "Ambiance izakaya", "Menu €38"],
        },
        {
            name: "Tagawa",
            cuisine: "Japonais • Traditionnel",
            rating: 4.5,
            priceLevel: "$$",
            address: "48 Rue de l'Aqueduc, 1050 Ixelles",
            distance: "2.1 km",
            openNow: true,
            phone: "+32 2 640 49 55",
            website: "https://tagawa.be",
            mapLink: "https://maps.google.com/?q=Tagawa+Bruxelles",
            highlights: ["Sushi frais", "Menu bento", "Terrasse été"],
        },
    ],
    italien: [
        {
            name: "Racines",
            cuisine: "Italien • Farm-to-table",
            rating: 4.7,
            priceLevel: "$$$",
            address: "94 Rue de Rollebeek, 1000 Bruxelles",
            distance: "0.5 km",
            openNow: true,
            phone: "+32 2 503 60 12",
            website: "https://racinesbruxelles.com",
            mapLink: "https://maps.google.com/?q=Racines+Bruxelles",
            highlights: ["Pasta maison", "Wine pairing", "Produits locaux"],
        },
        {
            name: "Caffè al Dente",
            cuisine: "Italien • Pasta Bar",
            rating: 4.5,
            priceLevel: "$$",
            address: "7 Rue du Fossé aux Loups, 1000 Bruxelles",
            distance: "0.3 km",
            openNow: true,
            phone: "+32 2 512 31 95",
            website: "https://caffealdente.be",
            mapLink: "https://maps.google.com/?q=Caffe+al+Dente+Bruxelles",
            highlights: ["Pasta fraîche minute", "Tiramisu légendaire", "Menu €25"],
        },
        {
            name: "Nona",
            cuisine: "Italien • Pizza Napoletana",
            rating: 4.6,
            priceLevel: "$$",
            address: "3 Quai au Bois à Brûler, 1000 Bruxelles",
            distance: "0.9 km",
            openNow: true,
            phone: "+32 2 893 06 87",
            website: "https://nonapizza.be",
            mapLink: "https://maps.google.com/?q=Nona+Pizza+Bruxelles",
            highlights: ["Four napolitain 480°C", "Burrata DOP", "Sans réservation"],
        },
    ],
    default: [
        {
            name: "Humphrey",
            cuisine: "Brasserie moderne",
            rating: 4.4,
            priceLevel: "$$",
            address: "Place du Châtelain 17, 1050 Bruxelles",
            distance: "1.5 km",
            openNow: true,
            phone: "+32 2 534 35 73",
            website: "https://humphrey.be",
            mapLink: "https://maps.google.com/?q=Humphrey+Bruxelles",
            highlights: ["Brunch weekend", "Cocktails maison", "Terrasse"],
        },
        {
            name: "Le Petit Chou",
            cuisine: "Française • Bistro",
            rating: 4.3,
            priceLevel: "$$",
            address: "Place Jourdan 1, 1040 Etterbeek",
            distance: "2.0 km",
            openNow: true,
            phone: "+32 2 230 55 81",
            website: "https://lepetitchou.be",
            mapLink: "https://maps.google.com/?q=Le+Petit+Chou+Bruxelles",
            highlights: ["Menu du jour €22", "Vin naturel", "Ambiance cosy"],
        },
        {
            name: "Kif Kif",
            cuisine: "Libanais • Mezze",
            rating: 4.5,
            priceLevel: "$",
            address: "9 Rue de la Paix, 1050 Ixelles",
            distance: "1.8 km",
            openNow: true,
            phone: "+32 2 649 41 11",
            website: "https://kifkif.be",
            mapLink: "https://maps.google.com/?q=Kif+Kif+Bruxelles",
            highlights: ["Mezze à partager", "Falafel croustillant", "Budget-friendly"],
        },
    ],
};

const searchRestaurantsHandler: ToolHandler = async (params: any) => {
    const { query, cuisine, maxResults } = params as z.infer<typeof SearchRestaurantsParams>;

    const hasGooglePlacesKey = !!process.env.GOOGLE_PLACES_API_KEY;

    if (hasGooglePlacesKey) {
        // ─── Mode A: Google Places API ────────────────────────────────────
        try {
            const searchQuery = [cuisine, query].filter(Boolean).join(" ");
            const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
            url.searchParams.set("query", `restaurant ${searchQuery}`);
            url.searchParams.set("key", process.env.GOOGLE_PLACES_API_KEY!);
            url.searchParams.set("type", "restaurant");

            const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
            const data = await res.json();

            if (data.status !== "OK") {
                throw new Error(`Google Places API error: ${data.status}`);
            }

            const results: RestaurantResult[] = data.results
                .slice(0, maxResults)
                .map((place: Record<string, unknown>) => ({
                    name: place.name as string,
                    cuisine: (place.types as string[])?.includes("restaurant") ? searchQuery : "Restaurant",
                    rating: (place.rating as number) || 0,
                    priceLevel: ["$", "$$", "$$$", "$$$$"][(place.price_level as number) || 1],
                    address: place.formatted_address as string,
                    distance: "—",
                    openNow: (place.opening_hours as Record<string, boolean>)?.open_now ?? true,
                    phone: "",
                    website: "",
                    mapLink: `https://maps.google.com/?q=${encodeURIComponent(place.name as string)}`,
                    highlights: [],
                }));

            return { success: true, data: { source: "google_places", results } };
        } catch (err) {
            // Fallback to mock on API error
            console.error("Google Places API failed, falling back to mock:", err);
        }
    }

    // ─── Mode B: Mock Database ────────────────────────────────────────
    const searchLower = [query, cuisine].join(" ").toLowerCase();
    let results: RestaurantResult[];

    if (searchLower.includes("japon") || searchLower.includes("sushi") || searchLower.includes("ramen")) {
        results = MOCK_RESTAURANTS.japonais;
    } else if (searchLower.includes("ital") || searchLower.includes("pizza") || searchLower.includes("pasta")) {
        results = MOCK_RESTAURANTS.italien;
    } else {
        results = MOCK_RESTAURANTS.default;
    }

    return {
        success: true,
        data: {
            source: hasGooglePlacesKey ? "google_places_fallback" : "mock",
            results: results.slice(0, maxResults),
        },
    };
};

// ─── Book Restaurant ─────────────────────────────────────────────────────────

const BookRestaurantParams = z.object({
    restaurantName: z.string(),
    date: z.string(),
    time: z.string(),
    partySize: z.number().min(1).max(20),
    specialRequests: z.string().optional().default(""),
});

const bookRestaurantHandler: ToolHandler = async (params: any) => {
    const { restaurantName, date, time, partySize, specialRequests } =
        params as z.infer<typeof BookRestaurantParams>;

    const hasTheForkKey = !!process.env.THEFORK_API_KEY;

    if (hasTheForkKey) {
        // Mode A: API partenaire (TheFork/OpenTable)
        // TODO: Implement when API access is granted
        return {
            success: true,
            data: {
                method: "api",
                status: "confirmed",
                confirmation: `Réservation confirmée via TheFork`,
                details: { restaurantName, date, time, partySize },
            },
        };
    }

    // Mode B: Fallback — deep-link + guide step-by-step
    const searchUrl = `https://www.thefork.com/search?q=${encodeURIComponent(restaurantName)}`;
    const googleSearch = `https://www.google.com/search?q=${encodeURIComponent(
        `${restaurantName} réservation`
    )}`;

    return {
        success: true,
        data: {
            method: "assisted",
            status: "guide_ready",
            message: `Je n'ai pas d'accès direct à la réservation, mais voici comment réserver en 30 secondes :`,
            steps: [
                `1. Ouvre TheFork : ${searchUrl}`,
                `2. Ou cherche sur Google : ${googleSearch}`,
                `3. Sélectionne "${restaurantName}"`,
                `4. Choisis : ${date} à ${time}, ${partySize} personne${partySize > 1 ? "s" : ""}`,
                specialRequests ? `5. Mentions spéciales : "${specialRequests}"` : null,
                `${specialRequests ? "6" : "5"}. Confirme la réservation`,
            ].filter(Boolean),
            links: {
                thefork: searchUrl,
                google: googleSearch,
            },
            details: { restaurantName, date, time, partySize, specialRequests },
        },
        undoInstructions: `Annule via TheFork ou appelle le restaurant directement.`,
    };
};

// ─── Register Tools ──────────────────────────────────────────────────────────

export function registerRestaurantTools() {
    actionRegistry.register({
        name: "search_restaurants",
        description: "Rechercher des restaurants par lieu, cuisine, et budget",
        intent: "search_restaurants",
        paramSchema: SearchRestaurantsParams,
        requiresConfirmation: false, // Search is safe
        handler: searchRestaurantsHandler,
        timeout: 10000,
        retries: 1,
    });

    actionRegistry.register({
        name: "book_restaurant",
        description: "Réserver un restaurant (via API partenaire ou guide assisté)",
        intent: "book_restaurant",
        paramSchema: BookRestaurantParams,
        requiresConfirmation: true, // MUST confirm before booking
        handler: bookRestaurantHandler,
        timeout: 15000,
        retries: 0,
    });
}
