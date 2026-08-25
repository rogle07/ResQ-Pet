import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useSessionBootstrap } from '@/hooks/useSessionBootstrap';
import ProtectedRoute from '@/routes/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ThemeProvider } from '@/contexts/ThemeContext';

import Home from '@/pages/public/Home';
import Login from '@/pages/public/Login';
import Register from '@/pages/public/Register';
import { Unauthorized, NotFound } from '@/pages/public/StatusPages';
import TrackPet from '@/pages/public/TrackPet';
import ReportFoundPet from '@/pages/public/ReportFoundPet';
import Adoption from '@/pages/public/Adoption';
import FosterCare from '@/pages/public/FosterCare';
import DonationsPage from '@/pages/public/DonationsPage';
import RescueTeams from '@/pages/public/RescueTeams';
import AboutUs from '@/pages/public/AboutUs';

import OwnerOverview from '@/pages/owner/OwnerOverview';
import OwnerPets from '@/pages/owner/OwnerPets';
import PetProfile from '@/pages/owner/PetProfile';
import OwnerTracking from '@/pages/owner/OwnerTracking';
import OwnerFoster from '@/pages/owner/OwnerFoster';
import OwnerDonations from '@/pages/owner/OwnerDonations';
import OwnerSettings from '@/pages/owner/OwnerSettings';

import RescueTeamOverview from '@/pages/rescueTeam/RescueTeamOverview';
import RescueTeamRequests from '@/pages/rescueTeam/RescueTeamRequests';
import RescueTeamMap from '@/pages/rescueTeam/RescueTeamMap';
import TeamCommunication from '@/pages/rescueTeam/TeamCommunication';
import TasksAssignments from '@/pages/rescueTeam/TasksAssignments';
import ResourcesEquipment from '@/pages/rescueTeam/ResourcesEquipment';
import ReportsAnalytics from '@/pages/rescueTeam/ReportsAnalytics';

import NgoOverview from '@/pages/ngo/NgoOverview';
import NgoRequests from '@/pages/ngo/NgoRequests';
import NgoRescueTeam from '@/pages/ngo/NgoRescueTeam';
import NgoCases from '@/pages/ngo/NgoCases';
import NgoFoundAnimals from '@/pages/ngo/NgoFoundAnimals';
import NgoAnimals from '@/pages/ngo/NgoAnimals';
import NgoAdoptions from '@/pages/ngo/NgoAdoptions';
import NgoDonations from '@/pages/ngo/NgoDonations';
import NgoVolunteers from '@/pages/ngo/NgoVolunteers';
import NgoResources from '@/pages/ngo/NgoResources';
import NgoAwareness from '@/pages/ngo/NgoAwareness';
import NgoMessages from '@/pages/ngo/NgoMessages';
import NgoSettings from '@/pages/ngo/NgoSettings';

import FosterHomeOverview from '@/pages/fosterHome/FosterHomeOverview';
import FosterApplication from '@/pages/fosterHome/FosterApplication';
import FosterHomeRequests from '@/pages/fosterHome/FosterHomeRequests';
import FosterAdoption from '@/pages/fosterHome/FosterAdoption';
import FosterStatistics from '@/pages/fosterHome/FosterStatistics';
import FosterDonations from '@/pages/fosterHome/FosterDonations';
import FosterProfile from '@/pages/fosterHome/FosterProfile';
import FosterNotifications from '@/pages/fosterHome/FosterNotifications';
import FosterSettings from '@/pages/fosterHome/FosterSettings';

import VeterinarianOverview from '@/pages/veterinarian/VeterinarianOverview';
import VeterinarianAppointments from '@/pages/veterinarian/VeterinarianAppointments';
import VeterinarianPatients from '@/pages/veterinarian/VeterinarianPatients';
import VeterinarianPatientDetail from '@/pages/veterinarian/VeterinarianPatientDetail';
import VeterinarianTreatments from '@/pages/veterinarian/VeterinarianTreatments';
import VeterinarianRecords from '@/pages/veterinarian/VeterinarianRecords';
import VeterinarianRecordDetail from '@/pages/veterinarian/VeterinarianRecordDetail';
import VeterinarianPrescriptions from '@/pages/veterinarian/VeterinarianPrescriptions';
import VeterinarianVaccinations from '@/pages/veterinarian/VeterinarianVaccinations';
import VeterinarianEmergency from '@/pages/veterinarian/VeterinarianEmergency';
import VeterinarianLabReports from '@/pages/veterinarian/VeterinarianLabReports';
import VeterinarianTelemetry from '@/pages/veterinarian/VeterinarianTelemetry';
import VeterinarianCollarDiagnostics from '@/pages/veterinarian/VeterinarianCollarDiagnostics';
import VeterinarianNotifications from '@/pages/veterinarian/VeterinarianNotifications';
import VeterinarianProfile from '@/pages/veterinarian/VeterinarianProfile';
import VeterinarianSettings from '@/pages/veterinarian/VeterinarianSettings';

import FinderOverview from '@/pages/finder/FinderOverview';
import FinderReport from '@/pages/finder/FinderReport';
import FinderMyReports from '@/pages/finder/FinderMyReports';
import FinderAwareness from '@/pages/finder/FinderAwareness';
import FinderMessages from '@/pages/finder/FinderMessages';
import FinderResources from '@/pages/finder/FinderResources';
import FinderHowToHelp from '@/pages/finder/FinderHowToHelp';
import FinderSettings from '@/pages/finder/FinderSettings';

import DonorOverview from '@/pages/donor/DonorOverview';
import DonorDonate from '@/pages/donor/DonorDonate';
import DonorMyDonations from '@/pages/donor/DonorMyDonations';
import DonorHistory from '@/pages/donor/DonorHistory';
import DonorCampaigns from '@/pages/donor/DonorCampaigns';
import DonorImpact from '@/pages/donor/DonorImpact';
import DonorRewards from '@/pages/donor/DonorRewards';
import DonorMessages from '@/pages/donor/DonorMessages';
import DonorSettings from '@/pages/donor/DonorSettings';

import AdminOverview from '@/pages/admin/AdminOverview';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminPets from '@/pages/admin/AdminPets';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminSettings from '@/pages/admin/AdminSettings';

function App() {
  useSessionBootstrap();

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/track-pet" element={<TrackPet />} />
          <Route path="/report-found-pet" element={<ReportFoundPet />} />
          <Route path="/adoption" element={<Adoption />} />
          <Route path="/foster-care" element={<FosterCare />} />
          <Route path="/donations" element={<DonationsPage />} />
          <Route path="/rescue-teams" element={<RescueTeams />} />
          <Route path="/about" element={<AboutUs />} />

          {/* Owner */}
          <Route element={<ProtectedRoute allowedRoles={['owner', 'admin']} />}>
            <Route path="/owner" element={<DashboardLayout />}>
              <Route index element={<OwnerOverview />} />
              <Route path="pets" element={<OwnerPets />} />
              <Route path="pets/:id" element={<PetProfile />} />
              <Route path="tracking" element={<OwnerTracking />} />
              <Route path="foster" element={<OwnerFoster />} />
              <Route path="donations" element={<OwnerDonations />} />
              <Route path="settings" element={<OwnerSettings />} />
            </Route>
          </Route>

          {/* Rescue Team */}
          <Route element={<ProtectedRoute allowedRoles={['rescue_team', 'admin']} />}>
            <Route path="/rescue-team" element={<DashboardLayout />}>
              <Route index element={<RescueTeamOverview />} />
              <Route path="requests" element={<RescueTeamRequests />} />
              <Route path="map" element={<RescueTeamMap />} />
              <Route path="communication" element={<TeamCommunication />} />
              <Route path="tasks" element={<TasksAssignments />} />
              <Route path="resources" element={<ResourcesEquipment />} />
              <Route path="analytics" element={<ReportsAnalytics />} />
            </Route>
          </Route>

          {/* NGO */}
          <Route element={<ProtectedRoute allowedRoles={['ngo', 'admin']} />}>
            <Route path="/ngo" element={<DashboardLayout />}>
              <Route index element={<NgoOverview />} />
              <Route path="requests" element={<NgoRequests />} />
              <Route path="rescue-team" element={<NgoRescueTeam />} />
              <Route path="cases" element={<NgoCases />} />
              <Route path="found-animals" element={<NgoFoundAnimals />} />
              <Route path="animals" element={<NgoAnimals />} />
              <Route path="adoptions" element={<NgoAdoptions />} />
              <Route path="donations" element={<NgoDonations />} />
              <Route path="volunteers" element={<NgoVolunteers />} />
              <Route path="resources" element={<NgoResources />} />
              <Route path="awareness" element={<NgoAwareness />} />
              <Route path="messages" element={<NgoMessages />} />
              <Route path="settings" element={<NgoSettings />} />
            </Route>
          </Route>

          {/* Foster Home */}
          <Route element={<ProtectedRoute allowedRoles={['foster_home', 'admin']} />}>
            <Route path="/foster-home" element={<DashboardLayout />}>
              <Route index element={<FosterHomeOverview />} />
              <Route path="application" element={<FosterApplication />} />
              <Route path="requests" element={<FosterHomeRequests />} />
              <Route path="adoption" element={<FosterAdoption />} />
              <Route path="statistics" element={<FosterStatistics />} />
              <Route path="donations" element={<FosterDonations />} />
              <Route path="profile" element={<FosterProfile />} />
              <Route path="notifications" element={<FosterNotifications />} />
              <Route path="settings" element={<FosterSettings />} />
            </Route>
          </Route>

          {/* Veterinarian */}
          <Route element={<ProtectedRoute allowedRoles={['veterinarian', 'admin']} />}>
            <Route path="/veterinarian" element={<DashboardLayout />}>
              <Route index element={<VeterinarianOverview />} />
              <Route path="appointments" element={<VeterinarianAppointments />} />
              <Route path="patients" element={<VeterinarianPatients />} />
              <Route path="patients/:id" element={<VeterinarianPatientDetail />} />
              <Route path="treatments" element={<VeterinarianTreatments />} />
              <Route path="records" element={<VeterinarianRecords />} />
              <Route path="records/:id" element={<VeterinarianRecordDetail />} />
              <Route path="prescriptions" element={<VeterinarianPrescriptions />} />
              <Route path="vaccinations" element={<VeterinarianVaccinations />} />
              <Route path="emergency" element={<VeterinarianEmergency />} />
              <Route path="lab-reports" element={<VeterinarianLabReports />} />
              <Route path="telemetry" element={<VeterinarianTelemetry />} />
              <Route path="collar-diagnostics" element={<VeterinarianCollarDiagnostics />} />
              <Route path="notifications" element={<VeterinarianNotifications />} />
              <Route path="profile" element={<VeterinarianProfile />} />
              <Route path="settings" element={<VeterinarianSettings />} />
            </Route>
          </Route>

          {/* Finder */}
          <Route element={<ProtectedRoute allowedRoles={['finder', 'owner', 'admin']} />}>
            <Route path="/finder" element={<DashboardLayout />}>
              <Route index element={<FinderOverview />} />
              <Route path="report" element={<FinderReport />} />
              <Route path="my-reports" element={<FinderMyReports />} />
              <Route path="awareness" element={<FinderAwareness />} />
              <Route path="messages" element={<FinderMessages />} />
              <Route path="resources" element={<FinderResources />} />
              <Route path="how-to-help" element={<FinderHowToHelp />} />
              <Route path="settings" element={<FinderSettings />} />
            </Route>
          </Route>

          {/* Donor */}
          <Route element={<ProtectedRoute allowedRoles={['donor', 'owner', 'finder', 'admin']} />}>
            <Route path="/donor" element={<DashboardLayout />}>
              <Route index element={<DonorOverview />} />
              <Route path="donate" element={<DonorDonate />} />
              <Route path="my-donations" element={<DonorMyDonations />} />
              <Route path="history" element={<DonorHistory />} />
              <Route path="campaigns" element={<DonorCampaigns />} />
              <Route path="impact" element={<DonorImpact />} />
              <Route path="rewards" element={<DonorRewards />} />
              <Route path="messages" element={<DonorMessages />} />
              <Route path="settings" element={<DonorSettings />} />
            </Route>
          </Route>

          {/* Admin */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<DashboardLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="pets" element={<AdminPets />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
