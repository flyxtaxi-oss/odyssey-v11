// ==============================================================================
// Visa Data Service — Source de vérité pour les règles d'immigration
// ==============================================================================

export interface CountryVisaRules {
  country: string;
  flag: string;
  maxDays: number;
  visaType: string;
}

const VISA_DATABASE: Record<string, CountryVisaRules> = {
  "PT": { country: "Portugal", flag: "🇵🇹", maxDays: 90, visaType: "Schengen / D8" },
  "TH": { country: "Thaïlande", flag: "🇹🇭", maxDays: 60, visaType: "Exemption / DTV" },
  "ID": { country: "Indonésie", flag: "🇮🇩", maxDays: 60, visaType: "B211A / VOA" },
  "JP": { country: "Japon", flag: "🇯🇵", maxDays: 90, visaType: "Tourist Exemption" },
  "MX": { country: "Mexique", flag: "🇲🇽", maxDays: 180, visaType: "Tourist Exemption" },
};

export const visaDataService = {
  async getCountryVisaData(countryCode: string): Promise<CountryVisaRules> {
    // Simule un appel réseau ou Firestore
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    // Retourne le pays s'il existe, sinon une règle générique de 90 jours
    return VISA_DATABASE[countryCode.toUpperCase()] || { country: countryCode, flag: "🌍", maxDays: 90, visaType: "Tourist" };
  }
};