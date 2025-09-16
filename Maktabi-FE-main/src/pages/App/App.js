import './App.css';
import LandingPage from '../landingPage/landingPage.jsx'
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { useState } from 'react';
import Login from '../login/login';
import UserSignUp from '../userSignUp/userSignUp';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import MaktabiAdmin from '../Maktabi-Admin-pages/maktabiAdmin/maktabiAdmin';
import WorkspaceAdmin from '../Workspace-Admin/adminDashboard/adminDashboard';
import AdminLogin from '../Maktabi-Admin-pages/maktabiAdminLogin/adminLogin';
import TestComp from '../testPage/testPage';
import EditWorkspaceConfiguration from '../Workspace-Admin/editWorkspaceConfiguration/editWorkspaceConfiguration';
import UserHomepage from '../User/userHomePage/userHomepage';
import WorkspaceInfo from '../User/workspaceInfo/workspaceInfo';
import BookWorkspace from '../User/bookWorkspace/bookWorkspace';
import BrowseWorkspaces from '../User/browseWorkspaces/browseWorkspaces';

function App() {
  const [token, setToken] = useState('');

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <BrowserRouter>
        <Routes>
          <Route path="" element={<LandingPage />} />
          <Route path="/Login" element={<Login onLogin={setToken} />} />
          <Route path="/signup/user" element={<UserSignUp />} />
          <Route path="/workspace-admin" element={<WorkspaceAdmin />} />
          <Route path="/maktabi-admin" element={<MaktabiAdmin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path='/user/home' element={<UserHomepage />} />
          <Route path='/user/workspace/info' element={<WorkspaceInfo />} />
          <Route path='/user/workspace/book/:id' element={<BookWorkspace />} />
          <Route path='/user/workspaces/browse' element={<BrowseWorkspaces />} />
          <Route path="/test" element={<TestComp />} />
          <Route path="/configure" element={<EditWorkspaceConfiguration />} />
        </Routes>
      </BrowserRouter>
    </LocalizationProvider>
  );
}

export default App;
