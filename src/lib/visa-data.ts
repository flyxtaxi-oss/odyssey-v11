// ==============================================================================
// REAL-TIME VISA DATA — Fetch visa requirements, processing times, costs
// ==============================================================================

export interface VisaRequirement {
  country: string;
  visa_type: string;
  requirements: string[];
  processing_time: string;
  cost: {
    amount: number;
    currency: string;
  };
  validity: string;
  max_stay: string;
  url: string;
  last_updated: string;
}

export interface CountryVisaData {
  country: string;
  country_code: string;
  flag: string;
  visas: VisaRequirement[];
  work_permits: string[];
  digital_nomad: string | null;
  ease_of_entry: number; // 1-10
  cost_of_living_index: number;
  avg_salary: number;
}

// Static visa database (would be replaced by API in production)
const VISA_DATABASE: Record<string, CountryVisaData> = {
  portugal: {
    country: 'Portugal',
    country_code: 'PT',
    flag: '🇵🇹',
    visas: [
      {
        country: 'Portugal',
        visa_type: 'D7 - Passive Income',
        requirements: ['Proof of €760/month income', 'Health insurance', 'Clean criminal record', 'Accommodation proof'],
        processing_time: '60-90 days',
        cost: { amount: 90, currency: '€' },
        validity: '2 years',
        max_stay: 'Long-term',
        url: 'https://vistos.mne.gov.pt/',
        last_updated: '2024-01-15',
      },
      {
        country: 'Portugal',
        visa_type: 'Digital Nomad',
        requirements: ['€3,280/month income', 'Remote work proof', 'Health insurance', 'Clean criminal record'],
        processing_time: '30-60 days',
        cost: { amount: 90, currency: '€' },
        validity: '1 year',
        max_stay: 'Long-term',
        url: 'https://www.sef.pt/',
        last_updated: '2024-01-15',
      },
      {
        country: 'Portugal',
        visa_type: 'NHR - Tax Regime',
        requirements: ['Tax residency application', 'Proof of status', 'No prior NHR'],
        processing_time: '30 days',
        cost: { amount: 0, currency: '€' },
        validity: '10 years',
        max_stay: 'Long-term',
        url: 'https://portal.eportugal.gov.pt/',
        last_updated: '2024-01-15',
      },
    ],
    work_permits: ['D7', 'Blue Card', 'Entrepreneur'],
    digital_nomad: 'Available - €3,280/month min',
    ease_of_entry: 8.5,
    cost_of_living_index: 65,
    avg_salary: 1800,
  },
  dubai: {
    country: 'Dubaï (UAE)',
    country_code: 'AE',
    flag: '🇦🇪',
    visas: [
      {
        country: 'UAE',
        visa_type: 'Freelance Visa',
        requirements: ['Portfolio', 'Qualifications', 'Health insurance', 'Bank statement'],
        processing_time: '14-30 days',
        cost: { amount: 1100, currency: '€' },
        validity: '1-3 years',
        max_stay: 'Long-term',
        url: 'https://www.godubaixpats.gov.ae/',
        last_updated: '2024-01-15',
      },
      {
        country: 'UAE',
        visa_type: 'Remote Work Visa (Dubai Future)',
        requirements: ['$5,000/month income', 'Remote work proof', 'Employment contract'],
        processing_time: '5-14 days',
        cost: { amount: 611, currency: '€' },
        validity: '1 year',
        max_stay: 'Long-term',
        url: 'https://www.visitdubai.com/',
        last_updated: '2024-01-15',
      },
      {
        country: 'UAE',
        visa_type: 'Golden Visa',
        requirements: ['$1M investment or exceptional talent', 'Recommendation letters'],
        processing_time: '30-60 days',
        cost: { amount: 1150, currency: '€' },
        validity: '10 years',
        max_stay: 'Long-term',
        url: 'https://goldenballge.gov.ae/',
        last_updated: '2024-01-15',
      },
    ],
    work_permits: ['Freelance', 'Employment', 'Golden', 'Investor'],
    digital_nomad: 'Available - $5,000/month min',
    ease_of_entry: 9,
    cost_of_living_index: 85,
    avg_salary: 4500,
  },
  thailand: {
    country: 'Thaïlande',
    country_code: 'TH',
    flag: '🇹🇭',
    visas: [
      {
        country: 'Thailand',
        visa_type: 'DTV - Digital Nomad',
        requirements: ['$50,000 savings or $80,000 income', 'Remote work proof', 'Health insurance'],
        processing_time: '20-60 days',
        cost: { amount: 250, currency: '€' },
        validity: '5 years',
        max_stay: 'Long-term',
        url: 'https://www.immigration.go.th/',
        last_updated: '2024-01-15',
      },
      {
        country: 'Thailand',
        visa_type: 'LTR - Long Term Resident',
        requirements: ['$80,000/year income', 'Health insurance', 'Remote work'],
        processing_time: '20-60 days',
        cost: { amount: 50, currency: '€' },
        validity: '10 years',
        max_stay: 'Long-term',
        url: 'https://www.boi.go.th/',
        last_updated: '2024-01-15',
      },
      {
        country: 'Thailand',
        visa_type: 'Elite Visa',
        requirements: ['$60,000+ membership fee', 'Clean background'],
        processing_time: '7-14 days',
        cost: { amount: 16000, currency: '€' },
        validity: '5-20 years',
        max_stay: 'Long-term',
        url: 'https://www.thailandelite.com/',
        last_updated: '2024-01-15',
      },
    ],
    work_permits: ['LTR', 'SMART Visa', 'Elite', 'Eduration'],
    digital_nomad: 'Available - $80,000/year min',
    ease_of_entry: 7,
    cost_of_living_index: 40,
    avg_salary: 1200,
  },
  singapore: {
    country: 'Singapour',
    country_code: 'SG',
    flag: '🇸🇬',
    visas: [
      {
        country: 'Singapore',
        visa_type: 'Employment Pass',
        requirements: ['Job offer $5,000+/month', 'Qualifications', 'Company requirements'],
        processing_time: '3 weeks',
        cost: { amount: 225, currency: 'S$' },
        validity: '2 years',
        max_stay: 'Long-term',
        url: 'https://www.mom.gov.sg/',
        last_updated: '2024-01-15',
      },
      {
        country: 'Singapore',
        visa_type: 'Tech Pass',
        requirements: ['Tech entrepreneur/exec', '$80,000 revenue or funding'],
        processing_time: '4-6 weeks',
        cost: { amount: 200, currency: 'S$' },
        validity: '2 years',
        max_stay: 'Long-term',
        url: 'https://www.edb.gov.sg/',
        last_updated: '2024-01-15',
      },
      {
        country: 'Singapore',
        visa_type: 'ONE Pass',
        requirements: ['$30,000/month salary or tech leader'],
        processing_time: '4-6 weeks',
        cost: { amount: 200, currency: 'S$' },
        validity: '5 years',
        max_stay: 'Long-term',
        url: 'https://www.mom.gov.sg/',
        last_updated: '2024-01-15',
      },
    ],
    work_permits: ['Employment Pass', 'EntrePass', 'Tech Pass', 'ONE Pass'],
    digital_nomad: 'No specific program',
    ease_of_entry: 7,
    cost_of_living_index: 100,
    avg_salary: 5500,
  },
  spain: {
    country: 'Espagne',
    country_code: 'ES',
    flag: '🇪🇸',
    visas: [
      {
        country: 'Spain',
        visa_type: 'Digital Nomad',
        requirements: ['€2,334/month income', 'Remote work contract', 'Health insurance'],
        processing_time: '20-45 days',
        cost: { amount: 80, currency: '€' },
        validity: '3 years',
        max_stay: 'Long-term',
        url: 'https://www.mites.gob.es/',
        last_updated: '2024-01-15',
      },
      {
        country: 'Spain',
        visa_type: 'Non-Lucrative',
        requirements: ['€28,000/year savings', 'Health insurance', 'Clean record'],
        processing_time: '1-3 months',
        cost: { amount: 80, currency: '€' },
        validity: '1-3 years',
        max_stay: 'Long-term',
        url: 'https://extranjeros.mitramiss.gob.es/',
        last_updated: '2024-01-15',
      },
    ],
    work_permits: ['Digital Nomad', 'Self-employment', 'Blue Card'],
    digital_nomad: 'Available - €2,334/month min',
    ease_of_entry: 7.5,
    cost_of_living_index: 60,
    avg_salary: 2000,
  },
  mexico: {
    country: 'Mexique',
    country_code: 'MX',
    flag: '🇲🇽',
    visas: [
      {
        country: 'Mexico',
        visa_type: 'Temporary Resident',
        requirements: ['$4,300/month income or $43,000 savings', 'Bank statements'],
        processing_time: '4-6 weeks',
        cost: { amount: 50, currency: '$' },
        validity: '1-4 years',
        max_stay: 'Long-term',
        url: 'https://www.inm.gob.mx/',
        last_updated: '2024-01-15',
      },
      {
        country: 'Mexico',
        visa_type: 'Digital Nomad (Temporary Resident)',
        requirements: ['$2,600/month remote income', 'Health insurance'],
        processing_time: '4-6 weeks',
        cost: { amount: 50, currency: '$' },
        validity: '4 years',
        max_stay: 'Long-term',
        url: 'https://www.inm.gob.mx/',
        last_updated: '2024-01-15',
      },
    ],
    work_permits: ['Temporary Resident', 'Work Permit ( employer)'],
    digital_nomad: 'Available - $2,600/month min',
    ease_of_entry: 8,
    cost_of_living_index: 45,
    avg_salary: 900,
  },
};

const SALARY_DATABASE: Record<string, number> = {
  lisbon: 1800,
  porto: 1500,
  dubai: 4500,
  bangkok: 1200,
  singapore: 5500,
  barcelona: 2200,
  mexico_city: 900,
  berlin: 2800,
  amsterdam: 3200,
  london: 3500,
};

const COST_OF_LIVING: Record<string, { rent: number; utilities: number; food: number; transport: number }> = {
  lisbon: { rent: 1200, utilities: 150, food: 400, transport: 50 },
  dubai: { rent: 2000, utilities: 200, food: 500, transport: 150 },
  bangkok: { rent: 600, utilities: 80, food: 300, transport: 50 },
  singapore: { rent: 2500, utilities: 150, food: 450, transport: 100 },
  barcelona: { rent: 1100, utilities: 120, food: 350, transport: 55 },
  mexico_city: { rent: 700, utilities: 80, food: 300, transport: 40 },
};

class VisaDataService {
  private cache: Map<string, { data: CountryVisaData; timestamp: number }> = new Map();
  private cacheDuration = 1000 * 60 * 60; // 1 hour

  async getCountryVisaData(countryCode: string): Promise<CountryVisaData | null> {
    const normalized = countryCode.toLowerCase();
    
    // Check cache
    const cached = this.cache.get(normalized);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }

    // Return from database
    const data = VISA_DATABASE[normalized];
    if (data) {
      this.cache.set(normalized, { data, timestamp: Date.now() });
      return data;
    }

    return null;
  }

  async getVisaRequirements(countryCode: string, visaType?: string): Promise<VisaRequirement[]> {
    const data = await this.getCountryVisaData(countryCode);
    if (!data) return [];

    if (visaType) {
      return data.visas.filter(v => v.visa_type.toLowerCase().includes(visaType.toLowerCase()));
    }

    return data.visas;
  }

  getDigitalNomadVisa(countryCode: string): string | null {
    const data = VISA_DATABASE[countryCode.toLowerCase()];
    return data?.digital_nomad || null;
  }

  getEaseOfEntry(countryCode: string): number {
    const data = VISA_DATABASE[countryCode.toLowerCase()];
    return data?.ease_of_entry || 5;
  }

  getCostOfLiving(city: string): { rent: number; utilities: number; food: number; transport: number } | null {
    return COST_OF_LIVING[city.toLowerCase()] || null;
  }

  getAverageSalary(city: string): number {
    return SALARY_DATABASE[city.toLowerCase()] || 2000;
  }

  getAllCountries(): { code: string; name: string; flag: string; digitalNomad: string | null }[] {
    return Object.entries(VISA_DATABASE).map(([code, data]) => ({
      code,
      name: data.country,
      flag: data.flag,
      digitalNomad: data.digital_nomad,
    }));
  }

  // Compare multiple countries
  compareCountries(countryCodes: string[]): CountryVisaData[] {
    return countryCodes
      .map(code => VISA_DATABASE[code.toLowerCase()])
      .filter(Boolean) as CountryVisaData[];
  }
}

export const visaDataService = new VisaDataService();
export default visaDataService;