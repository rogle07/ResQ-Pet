export type AnimalSpecies = 'Dog' | 'Cat' | 'Goat' | 'Cow' | 'Rabbit' | 'Bird' | 'Other';

export interface IoTGpioPinStatus {
  pin: string;
  connectedTo: string;
  purpose: string;
  state: string;
  voltage?: string;
  color?: string;
}

export interface IoTTempReading {
  time: string;
  tempC: number;
}

export interface IoTMotionReading {
  accelX: number;
  accelY: number;
  accelZ: number;
  gyroX: number;
  gyroY: number;
  gyroZ: number;
  activityLevel: 'Resting' | 'Active' | 'High Activity' | 'Tremor / Spike';
  stepCount: number;
  tremorDetected: boolean;
  fallDetected: boolean;
}

export interface IoTGpsReading {
  latitude: number;
  longitude: number;
  altitudeM: number;
  speedKmh: number;
  satellites: number;
  geofenceStatus: 'Inside Safe Zone' | 'Breached Safe Zone' | 'Geofence Breach';
  lastLocationName: string;
}

export interface IoTActuatorStatus {
  buzzerActive: boolean;
  buzzerFrequencyHz: number;
  rgbLedColor: 'Green' | 'Blue' | 'Red' | 'Off' | 'Strobe';
  sampleRateHz: number;
}

export interface IoTCollarDevice {
  deviceId: string;
  chipModel: 'ESP32-C3 SuperMini' | string;
  firmwareVersion: string;
  batteryPercent: number;
  batteryVoltage: number;
  isCharging: boolean;
  wifiSsid: string;
  wifiRssi: number;
  ipAddress: string;
  macAddress: string;
  lastPingSecsAgo: number;
  onlineStatus: 'Online' | 'Offline' | 'Low Battery' | 'Alert';
  temperature: {
    currentC: number;
    status: 'Normal' | 'Fever' | 'Hypothermia';
    minToday: number;
    maxToday: number;
    history: IoTTempReading[];
  };
  motion: IoTMotionReading;
  gps: IoTGpsReading;
  actuators: IoTActuatorStatus;
  gpioPins: IoTGpioPinStatus[];
}

export interface VetAppointment {
  id: string;
  time: string;
  date: string;
  petId: string;
  petName: string;
  species: AnimalSpecies;
  breed: string;
  age: string;
  gender: 'Male' | 'Female';
  image: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  ownerAddress?: string;
  purpose: string;
  badgeType: 'Checkup' | 'Follow-up' | 'Vaccination' | 'Emergency' | 'Surgery' | 'IoT Vitals Review';
  status: 'Scheduled' | 'Upcoming' | 'Completed' | 'Cancelled' | 'In-Progress';
  notes?: string;
  collarDeviceId?: string;
  liveTempC?: number;
}

export interface VetPatient {
  id: string;
  petCode: string;
  name: string;
  species: AnimalSpecies;
  breed: string;
  age: string;
  gender: 'Male' | 'Female';
  weightKg: number;
  color: string;
  microchipId?: string;
  image: string;
  status: 'Healthy' | 'Under Treatment' | 'Recovering' | 'Critical' | 'Discharged';
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  ownerAddress?: string;
  overallStatus?: 'Good' | 'Fair' | 'Poor' | 'Critical';
  lastCheckup: string;
  nextAppointment?: string;
  allergies?: string;
  chronicCondition?: string;
  collar?: IoTCollarDevice;
}

export interface MedicationItem {
  id: string;
  medicine: string;
  dosage: string;
  duration: string;
  instructions: string;
}

export interface VetMedicalRecord {
  id: string;
  recordId: string;
  petId: string;
  petName: string;
  petCode: string;
  species: AnimalSpecies;
  breed: string;
  age: string;
  gender: 'Male' | 'Female';
  image: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  date: string;
  attendingVet: string;
  diagnosis: string;
  symptoms: string[];
  treatmentPlan: string[];
  medications: MedicationItem[];
  notes?: string;
  attachments?: {
    name: string;
    size: string;
    type: 'image' | 'pdf';
    url: string;
  }[];
  nextAppointmentDate?: string;
  nextAppointmentTime?: string;
  emergencyContact?: string;
  iotTelemetrySnapshot?: {
    collarId: string;
    temperatureC: number;
    motionLevel: string;
    batteryPercent: number;
    gpsLocation: string;
  };
}

export interface VetTreatment {
  id: string;
  petId: string;
  petName: string;
  species: AnimalSpecies;
  breed: string;
  age: string;
  image: string;
  condition: string;
  treatmentName: string;
  startDate: string;
  endDate: string;
  status: 'Ongoing' | 'Completed';
  attendingVet: string;
  progressNotes: string;
  collarMonitored?: boolean;
}

export interface VetVaccination {
  id: string;
  petName: string;
  species: AnimalSpecies;
  ownerName: string;
  vaccineName: string;
  dose: string;
  givenDate: string;
  nextDueDate: string;
  status: 'Administered' | 'Due Soon' | 'Due' | 'Overdue';
}

export interface VetPrescription {
  id: string;
  prescriptionNumber: string;
  date: string;
  petName: string;
  ownerName: string;
  doctorName: string;
  diagnosis: string;
  medications: MedicationItem[];
  instructions?: string;
}

export interface VetLabReport {
  id: string;
  reportNumber: string;
  petName: string;
  ownerName: string;
  testName: string;
  date: string;
  status: 'Completed' | 'Pending Analysis' | 'Pending' | 'In Analysis';
  summary: string;
  labTechnician: string;
}

export interface VetEmergencyCase {
  id: string;
  petName: string;
  species: AnimalSpecies;
  age: string;
  image: string;
  ownerName: string;
  ownerPhone: string;
  reportedAt: string;
  symptoms: string;
  urgency: 'Critical' | 'Severe' | 'Moderate';
  status: 'Triage' | 'In Surgery' | 'ICU Care' | 'Stabilized';
  iotCollarAlert?: {
    highFever?: boolean;
    cardiacSpike?: boolean;
    traumaImpactG?: number;
    lastGpsCoordinates?: string;
  };
}
