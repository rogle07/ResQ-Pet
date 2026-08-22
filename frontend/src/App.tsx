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
import NgoAnimals from '@/pages/ngo/NgoAnimals';
import NgoAdoptions from '@/pages/ngo/NgoAdoptions';
import NgoDonations from '@/pages/ngo/NgoDonations';

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
import VeterinarianRecords from '@/pages/veterinarian/VeterinarianRecords';

import FinderOverview from '@/pages/finder/FinderOverview';
import FinderReport from '@/pages/finder/FinderReport';

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
              <Route path="animals" element={<NgoAnimals />} />
              <Route path="adoptions" element={<NgoAdoptions />} />
              <Route path="donations" element={<NgoDonations />} />
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
              <Route path="records" element={<VeterinarianRecords />} />
            </Route>
          </Route>

          {/* Finder */}
          <Route element={<ProtectedRoute allowedRoles={['finder', 'owner', 'admin']} />}>
            <Route path="/finder" element={<DashboardLayout />}>
              <Route index element={<FinderOverview />} />
              <Route path="report" element={<FinderReport />} />
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
