// ==============================================================================
// VISA COUNTRIES — Data source for programmatic SEO pages
// 50 popular destinations for French expats / digital nomads
// ==============================================================================

export type VisaCountry = {
  slug: string;
  name: string;          // FR display name
  flag: string;
  visaName: string;      // primary nomad/expat visa
  maxStayDays: number;   // for nomads (90 EU, 365 Portugal D7, etc.)
  taxFlatRate?: number;  // simplified flat rate if applicable
  minIncome: number;     // €/month required for visa
  capitalCity: string;
  costOfLivingIndex: number; // 100 = Paris baseline
  highlights: string[];
};

export const VISA_COUNTRIES: VisaCountry[] = [
  { slug: "portugal", name: "Portugal", flag: "🇵🇹", visaName: "Visa D7 / D8 Digital Nomad", maxStayDays: 365, taxFlatRate: 20, minIncome: 3480, capitalCity: "Lisbonne", costOfLivingIndex: 68, highlights: ["NHR fiscal pendant 10 ans", "Climat doux", "Communauté expat solide"] },
  { slug: "espagne", name: "Espagne", flag: "🇪🇸", visaName: "Visa Digital Nomad", maxStayDays: 365, taxFlatRate: 24, minIncome: 2762, capitalCity: "Madrid", costOfLivingIndex: 72, highlights: ["Régime Beckham (impôt fixe 24% pendant 6 ans)", "Style de vie", "Coût raisonnable"] },
  { slug: "italie", name: "Italie", flag: "🇮🇹", visaName: "Visa Digital Nomad (2024)", maxStayDays: 365, minIncome: 2700, capitalCity: "Rome", costOfLivingIndex: 78, highlights: ["Régime impatrié 70% exonération", "Régions du sud très abordables", "Climat méditerranéen"] },
  { slug: "estonie", name: "Estonie", flag: "🇪🇪", visaName: "Digital Nomad Visa", maxStayDays: 365, minIncome: 4500, capitalCity: "Tallinn", costOfLivingIndex: 65, highlights: ["E-residency unique au monde", "Pays le plus digital d'Europe", "Société estonienne facile à créer"] },
  { slug: "croatie", name: "Croatie", flag: "🇭🇷", visaName: "Digital Nomad Permit", maxStayDays: 365, minIncome: 2540, capitalCity: "Zagreb", costOfLivingIndex: 60, highlights: ["Exonération totale d'impôts pendant 1 an", "Côte adriatique", "EU + Schengen"] },
  { slug: "grece", name: "Grèce", flag: "🇬🇷", visaName: "Digital Nomad Visa", maxStayDays: 365, taxFlatRate: 50, minIncome: 3500, capitalCity: "Athènes", costOfLivingIndex: 64, highlights: ["50% d'exonération fiscale pendant 7 ans", "Îles paradisiaques", "Coût bas"] },
  { slug: "chypre", name: "Chypre", flag: "🇨🇾", visaName: "Digital Nomad Visa", maxStayDays: 365, taxFlatRate: 0, minIncome: 3500, capitalCity: "Nicosie", costOfLivingIndex: 71, highlights: ["183 jours = non-dom 0% sur dividendes étrangers", "Anglophone", "Climat exceptionnel"] },
  { slug: "malte", name: "Malte", flag: "🇲🇹", visaName: "Nomad Residence Permit", maxStayDays: 365, taxFlatRate: 10, minIncome: 3500, capitalCity: "La Valette", costOfLivingIndex: 75, highlights: ["10% impôt forfaitaire", "Anglophone (langue officielle)", "EU + Schengen"] },
  { slug: "georgie", name: "Géorgie", flag: "🇬🇪", visaName: "Remotely from Georgia", maxStayDays: 365, taxFlatRate: 1, minIncome: 2000, capitalCity: "Tbilissi", costOfLivingIndex: 38, highlights: ["1% d'impôt pour micro-entreprises (jusqu'à 156k€/an)", "Visa-free pour Français 365 jours", "Coût ultra bas"] },
  { slug: "thailande", name: "Thaïlande", flag: "🇹🇭", visaName: "LTR Visa / DTV", maxStayDays: 1825, minIncome: 80000, capitalCity: "Bangkok", costOfLivingIndex: 45, highlights: ["LTR jusqu'à 10 ans renouvelable", "Coût de vie très bas", "Communauté nomade massive"] },
  { slug: "indonesie", name: "Indonésie", flag: "🇮🇩", visaName: "Second Home / Remote Worker Visa", maxStayDays: 1825, minIncome: 5000, capitalCity: "Jakarta", costOfLivingIndex: 42, highlights: ["Bali = hub nomade #1 mondial", "Coût très bas", "Visa Second Home jusqu'à 10 ans"] },
  { slug: "malaisie", name: "Malaisie", flag: "🇲🇾", visaName: "DE Rantau Nomad Pass", maxStayDays: 365, minIncome: 2400, capitalCity: "Kuala Lumpur", costOfLivingIndex: 48, highlights: ["MM2H pour long terme", "Bilingue anglais-malais", "Infrastructure moderne"] },
  { slug: "vietnam", name: "Vietnam", flag: "🇻🇳", visaName: "E-Visa 90 jours", maxStayDays: 90, minIncome: 1500, capitalCity: "Hanoï", costOfLivingIndex: 40, highlights: ["Coût parmi les plus bas d'Asie", "Côte vietnamienne", "E-visa simple"] },
  { slug: "philippines", name: "Philippines", flag: "🇵🇭", visaName: "SRRV / Tourist Visa Extension", maxStayDays: 1095, minIncome: 1500, capitalCity: "Manille", costOfLivingIndex: 44, highlights: ["Anglophone", "Coût bas", "SRRV résidence permanente dès 35 ans"] },
  { slug: "japon", name: "Japon", flag: "🇯🇵", visaName: "Digital Nomad Visa (6 mois)", maxStayDays: 180, minIncome: 8333, capitalCity: "Tokyo", costOfLivingIndex: 92, highlights: ["Visa nomade lancé en 2024", "Qualité de vie exceptionnelle", "Culture unique"] },
  { slug: "coree-du-sud", name: "Corée du Sud", flag: "🇰🇷", visaName: "Workation Visa", maxStayDays: 730, minIncome: 5500, capitalCity: "Séoul", costOfLivingIndex: 80, highlights: ["Internet le plus rapide au monde", "Visa nomade jusqu'à 2 ans", "Culture pop forte"] },
  { slug: "emirats-arabes-unis", name: "Émirats Arabes Unis", flag: "🇦🇪", visaName: "Virtual Working Programme", maxStayDays: 365, taxFlatRate: 0, minIncome: 3500, capitalCity: "Abou Dhabi", costOfLivingIndex: 95, highlights: ["0% d'impôt sur le revenu", "Visa Golden possible (10 ans)", "Hub business mondial"] },
  { slug: "maroc", name: "Maroc", flag: "🇲🇦", visaName: "Long Stay Visa", maxStayDays: 365, minIncome: 2000, capitalCity: "Rabat", costOfLivingIndex: 42, highlights: ["Francophone", "Proximité avec la France (3h vol)", "Coût bas"] },
  { slug: "tunisie", name: "Tunisie", flag: "🇹🇳", visaName: "Long Stay Visa", maxStayDays: 365, minIncome: 1500, capitalCity: "Tunis", costOfLivingIndex: 38, highlights: ["Francophone", "Méditerranée", "Coût très bas"] },
  { slug: "afrique-du-sud", name: "Afrique du Sud", flag: "🇿🇦", visaName: "Remote Work Visa (2024)", maxStayDays: 1095, minIncome: 3500, capitalCity: "Le Cap", costOfLivingIndex: 50, highlights: ["Anglophone", "Cape Town parmi les + belles villes mondiales", "Coût raisonnable"] },
  { slug: "ile-maurice", name: "Île Maurice", flag: "🇲🇺", visaName: "Premium Visa", maxStayDays: 365, minIncome: 1500, capitalCity: "Port-Louis", costOfLivingIndex: 55, highlights: ["Visa premium 1 an renouvelable", "Bilingue français-anglais", "Île paradisiaque"] },
  { slug: "canada", name: "Canada", flag: "🇨🇦", visaName: "Working Holiday / Skilled Worker", maxStayDays: 730, minIncome: 2300, capitalCity: "Ottawa", costOfLivingIndex: 85, highlights: ["PVT pour les < 35 ans", "Québec francophone", "Voie vers résidence permanente"] },
  { slug: "etats-unis", name: "États-Unis", flag: "🇺🇸", visaName: "E-2 / O-1 / EB-5", maxStayDays: 1825, minIncome: 5000, capitalCity: "Washington D.C.", costOfLivingIndex: 105, highlights: ["E-2 pour investisseurs", "Marché tech mondial", "Diversité géographique"] },
  { slug: "mexique", name: "Mexique", flag: "🇲🇽", visaName: "Temporary Resident Visa", maxStayDays: 1460, minIncome: 2700, capitalCity: "Mexico", costOfLivingIndex: 50, highlights: ["Temporary Resident 4 ans renouvelable", "Coût bas", "Communauté nomade à Mexico/Tulum"] },
  { slug: "panama", name: "Panama", flag: "🇵🇦", visaName: "Friendly Nations / Short Stay Visa for Remote Workers", maxStayDays: 1825, taxFlatRate: 0, minIncome: 3000, capitalCity: "Panama City", costOfLivingIndex: 55, highlights: ["0% d'impôt sur revenus étrangers", "Friendly Nations résidence permanente", "Dollar US comme monnaie"] },
  { slug: "costa-rica", name: "Costa Rica", flag: "🇨🇷", visaName: "Rentista / Digital Nomad Visa", maxStayDays: 730, minIncome: 3000, capitalCity: "San José", costOfLivingIndex: 58, highlights: ["Visa nomade 1 an renouvelable", "Pura Vida lifestyle", "Nature exceptionnelle"] },
  { slug: "colombie", name: "Colombie", flag: "🇨🇴", visaName: "M Visa (Digital Nomad)", maxStayDays: 730, minIncome: 700, capitalCity: "Bogota", costOfLivingIndex: 40, highlights: ["Visa nomade 2 ans (très accessible)", "Coût parmi les plus bas Amérique latine", "Medellín = hub nomade"] },
  { slug: "argentine", name: "Argentine", flag: "🇦🇷", visaName: "Digital Nomad Visa", maxStayDays: 365, minIncome: 1000, capitalCity: "Buenos Aires", costOfLivingIndex: 35, highlights: ["Coût très bas (inflation)", "Buenos Aires = Paris d'Amérique du Sud", "Visa 6 mois renouvelable"] },
  { slug: "bresil", name: "Brésil", flag: "🇧🇷", visaName: "Digital Nomad Visa", maxStayDays: 730, minIncome: 1500, capitalCity: "Brasilia", costOfLivingIndex: 47, highlights: ["Visa nomade 1 an renouvelable", "Coût bas", "Climat tropical"] },
  { slug: "australie", name: "Australie", flag: "🇦🇺", visaName: "Working Holiday / Skilled Independent", maxStayDays: 730, minIncome: 3500, capitalCity: "Canberra", costOfLivingIndex: 95, highlights: ["PVT < 35 ans", "Anglophone", "Qualité de vie"] },
  { slug: "nouvelle-zelande", name: "Nouvelle-Zélande", flag: "🇳🇿", visaName: "Working Holiday / Skilled Migrant", maxStayDays: 365, minIncome: 3500, capitalCity: "Wellington", costOfLivingIndex: 87, highlights: ["PVT", "Nature spectaculaire", "Société paisible"] },
  { slug: "allemagne", name: "Allemagne", flag: "🇩🇪", visaName: "Freelance Visa (Freiberufler)", maxStayDays: 1095, minIncome: 1500, capitalCity: "Berlin", costOfLivingIndex: 84, highlights: ["Freelance Visa très populaire", "Berlin = capitale tech EU", "EU + Schengen"] },
  { slug: "pays-bas", name: "Pays-Bas", flag: "🇳🇱", visaName: "DAFT (USA only) / Highly Skilled Migrant", maxStayDays: 1095, minIncome: 5000, capitalCity: "Amsterdam", costOfLivingIndex: 92, highlights: ["30% Ruling fiscal pendant 5 ans", "Anglophone de facto", "Hub tech européen"] },
  { slug: "irlande", name: "Irlande", flag: "🇮🇪", visaName: "Critical Skills Employment Permit", maxStayDays: 1825, minIncome: 5000, capitalCity: "Dublin", costOfLivingIndex: 100, highlights: ["Anglophone", "Hub tech EU (Google, Meta, Apple)", "EU"] },
  { slug: "royaume-uni", name: "Royaume-Uni", flag: "🇬🇧", visaName: "Skilled Worker Visa / Innovator", maxStayDays: 1825, minIncome: 3500, capitalCity: "Londres", costOfLivingIndex: 110, highlights: ["Anglophone", "Hub financier mondial", "Diversité culturelle"] },
  { slug: "norvege", name: "Norvège", flag: "🇳🇴", visaName: "Skilled Worker Visa", maxStayDays: 1095, minIncome: 4500, capitalCity: "Oslo", costOfLivingIndex: 110, highlights: ["Salaires élevés", "Qualité de vie #1 mondiale", "Nature exceptionnelle"] },
  { slug: "suede", name: "Suède", flag: "🇸🇪", visaName: "Work Permit", maxStayDays: 1825, minIncome: 3000, capitalCity: "Stockholm", costOfLivingIndex: 95, highlights: ["Anglophone de facto", "Société innovante", "Work-life balance"] },
  { slug: "danemark", name: "Danemark", flag: "🇩🇰", visaName: "Positive List / Pay Limit Scheme", maxStayDays: 1825, minIncome: 6500, capitalCity: "Copenhague", costOfLivingIndex: 105, highlights: ["Pays le plus heureux au monde", "Anglophone", "Salaires élevés"] },
  { slug: "finlande", name: "Finlande", flag: "🇫🇮", visaName: "Specialist Permit / Self-employed Visa", maxStayDays: 730, minIncome: 1300, capitalCity: "Helsinki", costOfLivingIndex: 88, highlights: ["Self-employed visa accessible", "Pays #1 happiness", "Anglophone de facto"] },
  { slug: "suisse", name: "Suisse", flag: "🇨🇭", visaName: "Permit B / G", maxStayDays: 1825, minIncome: 5500, capitalCity: "Berne", costOfLivingIndex: 130, highlights: ["Salaires très élevés", "Stabilité absolue", "Francophone en Romandie"] },
  { slug: "luxembourg", name: "Luxembourg", flag: "🇱🇺", visaName: "Salaried Worker / Self-employed", maxStayDays: 1825, minIncome: 3500, capitalCity: "Luxembourg", costOfLivingIndex: 100, highlights: ["Multilingue français-allemand-anglais", "Salaires élevés", "EU"] },
  { slug: "belgique", name: "Belgique", flag: "🇧🇪", visaName: "Single Permit", maxStayDays: 1825, minIncome: 3000, capitalCity: "Bruxelles", costOfLivingIndex: 82, highlights: ["Francophone (Wallonie)", "Hub EU institutionnel", "Proximité avec la France"] },
  { slug: "pologne", name: "Pologne", flag: "🇵🇱", visaName: "Business Activity Visa", maxStayDays: 365, minIncome: 1500, capitalCity: "Varsovie", costOfLivingIndex: 58, highlights: ["EU + Schengen", "Coût bas pour l'EU", "Économie en croissance"] },
  { slug: "hongrie", name: "Hongrie", flag: "🇭🇺", visaName: "White Card (Digital Nomad)", maxStayDays: 365, minIncome: 2000, capitalCity: "Budapest", costOfLivingIndex: 55, highlights: ["White Card spécifique nomades 2022", "Budapest abordable", "EU + Schengen"] },
  { slug: "tchequie", name: "Tchéquie", flag: "🇨🇿", visaName: "Zivnostensky List (Freelance Trade License)", maxStayDays: 1095, minIncome: 1500, capitalCity: "Prague", costOfLivingIndex: 62, highlights: ["Zivno = freelance visa réputé", "Prague centrale EU", "Coût modéré"] },
  { slug: "roumanie", name: "Roumanie", flag: "🇷🇴", visaName: "Digital Nomad Visa", maxStayDays: 365, minIncome: 3700, capitalCity: "Bucarest", costOfLivingIndex: 45, highlights: ["Visa nomade depuis 2022", "Coût très bas", "EU"] },
  { slug: "turquie", name: "Turquie", flag: "🇹🇷", visaName: "Turquoise Card / Short-term Residence", maxStayDays: 365, minIncome: 1000, capitalCity: "Ankara", costOfLivingIndex: 40, highlights: ["Istanbul = pont Asie-Europe", "Coût très bas", "Visa relativement accessible"] },
  { slug: "albanie", name: "Albanie", flag: "🇦🇱", visaName: "Unique Permit", maxStayDays: 365, minIncome: 1500, capitalCity: "Tirana", costOfLivingIndex: 38, highlights: ["1 an visa-free pour Français", "Coût parmi les plus bas Europe", "Côte adriatique"] },
  { slug: "uruguay", name: "Uruguay", flag: "🇺🇾", visaName: "Residency for Independents", maxStayDays: 1825, minIncome: 1500, capitalCity: "Montevideo", costOfLivingIndex: 55, highlights: ["Stabilité politique Amérique latine", "Voie rapide vers citoyenneté", "Climat tempéré"] },
  { slug: "ecuador", name: "Équateur", flag: "🇪🇨", visaName: "Professional Visa", maxStayDays: 730, minIncome: 1350, capitalCity: "Quito", costOfLivingIndex: 42, highlights: ["Dollar US comme monnaie", "Coût bas", "Galápagos + Andes"] },
];

export function getVisaCountry(slug: string): VisaCountry | undefined {
  return VISA_COUNTRIES.find((c) => c.slug === slug);
}

export function getVisaCountrySlugs(): string[] {
  return VISA_COUNTRIES.map((c) => c.slug);
}
