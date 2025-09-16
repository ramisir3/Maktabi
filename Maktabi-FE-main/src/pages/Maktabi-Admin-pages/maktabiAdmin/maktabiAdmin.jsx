import { useState } from 'react'
import SideBar from '../../../components/sideBar/sideBar';
import UserManagementMaktabiAdmin from '../userManagementPageMaktabiAdmin/userManagement';
import WorkspaceManagementMaktabiAdmin from '../workspaceManagementPageMaktabiAdmin/workspaceManagement';

import './maktabiAdmin.css'
import { useMaktabiAdmin } from '../../../scripts/customHooks';
import { useNavigate } from 'react-router-dom';

export default function MaktabiAdmin() {
    const [contentType, setContentType] = useState("workspaces");
    const { authenticated } = useMaktabiAdmin();
    const navigate = useNavigate();
    if (!authenticated) {
        navigate('/admin/login');
        return;
    }

    const changeContent = function (content) {
        setContentType(content);
    }

    return (
        <>
            <div>
                <SideBar content={contentType} changeContentType={setContentType}></SideBar>
                <div className='content-wrapper'>
                    {contentType == "workspaces" && <WorkspaceManagementMaktabiAdmin></WorkspaceManagementMaktabiAdmin>}
                    {contentType == "users" && <UserManagementMaktabiAdmin></UserManagementMaktabiAdmin>}
                </div>
            </div>
        </>
    )
}