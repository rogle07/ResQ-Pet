/**
 * Comprehensive Indian Cities Dataset
 * Covers all major metros, tier-1, tier-2, tier-3 cities and regional centers across India.
 */

export interface CityOption {
  id: string;
  name: string;
  state: string;
  popular?: boolean;
}

export const POPULAR_CITIES: CityOption[] = [
  { id: 'all', name: 'All Cities (All India)', state: 'All States' },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', popular: true },
  { id: 'delhi-ncr', name: 'Delhi NCR', state: 'Delhi', popular: true },
  { id: 'bengaluru', name: 'Bengaluru (Bangalore)', state: 'Karnataka', popular: true },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana', popular: true },
  { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu', popular: true },
  { id: 'kolkata', name: 'Kolkata', state: 'West Bengal', popular: true },
  { id: 'pune', name: 'Pune', state: 'Maharashtra', popular: true },
  { id: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat', popular: true },
  { id: 'jaipur', name: 'Jaipur', state: 'Rajasthan', popular: true },
  { id: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh', popular: true },
  { id: 'chandigarh', name: 'Chandigarh', state: 'Punjab / Haryana', popular: true },
  { id: 'dehradun', name: 'Dehradun', state: 'Uttarakhand', popular: true },
  { id: 'haldwani', name: 'Haldwani', state: 'Uttarakhand', popular: true },
  { id: 'nainital', name: 'Nainital', state: 'Uttarakhand', popular: true },
  { id: 'haridwar', name: 'Haridwar', state: 'Uttarakhand', popular: true },
  { id: 'rishikesh', name: 'Rishikesh', state: 'Uttarakhand', popular: true },
  { id: 'rudrapur', name: 'Rudrapur', state: 'Uttarakhand', popular: true },
  { id: 'indore', name: 'Indore', state: 'Madhya Pradesh', popular: true },
  { id: 'surat', name: 'Surat', state: 'Gujarat', popular: true },
  { id: 'patna', name: 'Patna', state: 'Bihar', popular: true },
  { id: 'bhopal', name: 'Bhopal', state: 'Madhya Pradesh', popular: true },
  { id: 'nagpur', name: 'Nagpur', state: 'Maharashtra', popular: true },
  { id: 'kochi', name: 'Kochi', state: 'Kerala', popular: true },
  { id: 'guwahati', name: 'Guwahati', state: 'Assam', popular: true },
];

export const ALL_INDIAN_CITIES: CityOption[] = [
  { id: 'all', name: 'All Cities (All India)', state: 'All States' },
  
  // Popular & Metros
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', popular: true },
  { id: 'delhi-ncr', name: 'Delhi NCR', state: 'Delhi', popular: true },
  { id: 'bengaluru', name: 'Bengaluru (Bangalore)', state: 'Karnataka', popular: true },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana', popular: true },
  { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu', popular: true },
  { id: 'kolkata', name: 'Kolkata', state: 'West Bengal', popular: true },
  { id: 'pune', name: 'Pune', state: 'Maharashtra', popular: true },
  { id: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat', popular: true },
  { id: 'jaipur', name: 'Jaipur', state: 'Rajasthan', popular: true },
  { id: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh', popular: true },
  { id: 'chandigarh', name: 'Chandigarh', state: 'Chandigarh', popular: true },
  { id: 'indore', name: 'Indore', state: 'Madhya Pradesh', popular: true },
  { id: 'surat', name: 'Surat', state: 'Gujarat', popular: true },
  { id: 'bhopal', name: 'Bhopal', state: 'Madhya Pradesh', popular: true },
  { id: 'nagpur', name: 'Nagpur', state: 'Maharashtra', popular: true },
  { id: 'patna', name: 'Patna', state: 'Bihar', popular: true },
  { id: 'visakhapatnam', name: 'Visakhapatnam', state: 'Andhra Pradesh', popular: true },
  { id: 'vadodara', name: 'Vadodara', state: 'Gujarat', popular: true },
  { id: 'ghaziabad', name: 'Ghaziabad', state: 'Uttar Pradesh', popular: true },
  { id: 'ludhiana', name: 'Ludhiana', state: 'Punjab', popular: true },
  { id: 'agra', name: 'Agra', state: 'Uttar Pradesh', popular: true },
  { id: 'nashik', name: 'Nashik', state: 'Maharashtra', popular: true },
  { id: 'faridabad', name: 'Faridabad', state: 'Haryana', popular: true },
  { id: 'meerut', name: 'Meerut', state: 'Uttar Pradesh', popular: true },
  { id: 'rajkot', name: 'Rajkot', state: 'Gujarat', popular: true },
  { id: 'varanasi', name: 'Varanasi', state: 'Uttar Pradesh', popular: true },
  { id: 'srinagar', name: 'Srinagar', state: 'Jammu and Kashmir', popular: true },
  { id: 'aurangabad', name: 'Chhatrapati Sambhajinagar (Aurangabad)', state: 'Maharashtra' },
  { id: 'dhanbad', name: 'Dhanbad', state: 'Jharkhand' },
  { id: 'amritsar', name: 'Amritsar', state: 'Punjab', popular: true },
  { id: 'navi-mumbai', name: 'Navi Mumbai', state: 'Maharashtra' },
  { id: 'prayagraj', name: 'Prayagraj (Allahabad)', state: 'Uttar Pradesh' },
  { id: 'ranchi', name: 'Ranchi', state: 'Jharkhand', popular: true },
  { id: 'howrah', name: 'Howrah', state: 'West Bengal' },
  { id: 'coimbatore', name: 'Coimbatore', state: 'Tamil Nadu', popular: true },
  { id: 'jabalpur', name: 'Jabalpur', state: 'Madhya Pradesh' },
  { id: 'gwalior', name: 'Gwalior', state: 'Madhya Pradesh' },
  { id: 'vijayawada', name: 'Vijayawada', state: 'Andhra Pradesh' },
  { id: 'jodhpur', name: 'Jodhpur', state: 'Rajasthan' },
  { id: 'madurai', name: 'Madurai', state: 'Tamil Nadu' },
  { id: 'raipur', name: 'Raipur', state: 'Chhattisgarh', popular: true },
  { id: 'kota', name: 'Kota', state: 'Rajasthan' },
  { id: 'guwahati', name: 'Guwahati', state: 'Assam', popular: true },
  { id: 'solapur', name: 'Solapur', state: 'Maharashtra' },
  { id: 'hubli-dharwad', name: 'Hubballi-Dharwad', state: 'Karnataka' },
  { id: 'bareilly', name: 'Bareilly', state: 'Uttar Pradesh' },
  { id: 'moradabad', name: 'Moradabad', state: 'Uttar Pradesh' },
  { id: 'mysuru', name: 'Mysuru (Mysore)', state: 'Karnataka' },
  { id: 'gurugram', name: 'Gurugram (Gurgaon)', state: 'Haryana', popular: true },
  { id: 'noida', name: 'Noida', state: 'Uttar Pradesh', popular: true },
  { id: 'greater-noida', name: 'Greater Noida', state: 'Uttar Pradesh' },
  { id: 'aligarh', name: 'Aligarh', state: 'Uttar Pradesh' },
  { id: 'jalandhar', name: 'Jalandhar', state: 'Punjab' },
  { id: 'tiruchirappalli', name: 'Tiruchirappalli', state: 'Tamil Nadu' },
  { id: 'bhubaneswar', name: 'Bhubaneswar', state: 'Odisha', popular: true },
  { id: 'salem', name: 'Salem', state: 'Tamil Nadu' },
  { id: 'warangal', name: 'Warangal', state: 'Telangana' },
  { id: 'thiruvananthapuram', name: 'Thiruvananthapuram', state: 'Kerala', popular: true },
  { id: 'kochi', name: 'Kochi (Cochin)', state: 'Kerala', popular: true },
  { id: 'kozhikode', name: 'Kozhikode (Calicut)', state: 'Kerala' },

  // Uttarakhand Hubs (Local focus)
  { id: 'dehradun', name: 'Dehradun', state: 'Uttarakhand', popular: true },
  { id: 'haldwani', name: 'Haldwani', state: 'Uttarakhand', popular: true },
  { id: 'nainital', name: 'Nainital', state: 'Uttarakhand', popular: true },
  { id: 'haridwar', name: 'Haridwar', state: 'Uttarakhand', popular: true },
  { id: 'rishikesh', name: 'Rishikesh', state: 'Uttarakhand', popular: true },
  { id: 'rudrapur', name: 'Rudrapur', state: 'Uttarakhand', popular: true },
  { id: 'kashipur', name: 'Kashipur', state: 'Uttarakhand' },
  { id: 'roorkee', name: 'Roorkee', state: 'Uttarakhand' },
  { id: 'almora', name: 'Almora', state: 'Uttarakhand' },
  { id: 'pantnagar', name: 'Pantnagar', state: 'Uttarakhand' },
  { id: 'ramnagar', name: 'Ramnagar', state: 'Uttarakhand' },
  { id: 'bhimtal', name: 'Bhimtal', state: 'Uttarakhand' },
  { id: 'mussoorie', name: 'Mussoorie', state: 'Uttarakhand' },
  { id: 'pithoragarh', name: 'Pithoragarh', state: 'Uttarakhand' },

  // Himachal Pradesh & North
  { id: 'shimla', name: 'Shimla', state: 'Himachal Pradesh' },
  { id: 'dharamshala', name: 'Dharamshala', state: 'Himachal Pradesh' },
  { id: 'manali', name: 'Manali', state: 'Himachal Pradesh' },
  { id: 'jammu', name: 'Jammu', state: 'Jammu and Kashmir' },
  { id: 'leh', name: 'Leh', state: 'Ladakh' },

  // Western & Southern Hubs
  { id: 'panaji', name: 'Panaji / North Goa', state: 'Goa' },
  { id: 'margao', name: 'Margao / South Goa', state: 'Goa' },
  { id: 'mangalore', name: 'Mangaluru (Mangalore)', state: 'Karnataka' },
  { id: 'belagavi', name: 'Belagavi (Belgaum)', state: 'Karnataka' },
  { id: 'udupi', name: 'Udupi', state: 'Karnataka' },
  { id: 'puducherry', name: 'Puducherry (Pondicherry)', state: 'Puducherry' },
  { id: 'bikaner', name: 'Bikaner', state: 'Rajasthan' },
  { id: 'udaipur', name: 'Udaipur', state: 'Rajasthan' },
  { id: 'ajmer', name: 'Ajmer', state: 'Rajasthan' },
  { id: 'alwar', name: 'Alwar', state: 'Rajasthan' },
  { id: 'jamshedpur', name: 'Jamshedpur', state: 'Jharkhand' },
  { id: 'bokaro', name: 'Bokaro Steel City', state: 'Jharkhand' },
  { id: 'siliguri', name: 'Siliguri', state: 'West Bengal' },
  { id: 'asansol', name: 'Asansol', state: 'West Bengal' },
  { id: 'durgapur', name: 'Durgapur', state: 'West Bengal' },
  
  // North-East Capitals & Hubs
  { id: 'shillong', name: 'Shillong', state: 'Meghalaya' },
  { id: 'agartala', name: 'Agartala', state: 'Tripura' },
  { id: 'imphal', name: 'Imphal', state: 'Manipur' },
  { id: 'aizawl', name: 'Aizawl', state: 'Mizoram' },
  { id: 'kohima', name: 'Kohima', state: 'Nagaland' },
  { id: 'gangtok', name: 'Gangtok', state: 'Sikkim' },
  { id: 'itanagar', name: 'Itanagar', state: 'Arunachal Pradesh' },
];

/**
 * Filter cities based on a search term
 */
export function filterCities(searchTerm: string): CityOption[] {
  if (!searchTerm.trim()) return ALL_INDIAN_CITIES;
  const q = searchTerm.toLowerCase().trim();
  return ALL_INDIAN_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
  );
}

/**
 * Get city name by id
 */
export function getCityName(id: string): string {
  const city = ALL_INDIAN_CITIES.find((c) => c.id === id || c.name.toLowerCase() === id.toLowerCase());
  return city ? city.name : id;
}
