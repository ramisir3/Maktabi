import { Tooltip, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { FormGroup, Input, Label, Table } from "reactstrap";
import WorkspaceActionModal from "../../../components/modals/workspaceActionModal";
import "./workspaceManagement.css"
import AddCircleIcon from '@mui/icons-material/AddCircle';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ManageWorkspaceModal from "../../../components/modals/manageWorkspaceModal";
import { getWorkspaceById, getWorkspaces, searchWorkspacesByCity, searchWorkspacesByName, searchWorkspacesByPrimaryAdminEmail, searchWorkspacesByPrimaryAdminId, searchWorkspacesByPrimaryAdminName } from "../../../scripts/APIs";

export default function WorkspaceManagementMaktabiAdmin() {
    const [workspaceList, setWorkspaceList] = useState([]);
    const [modalWorkspace, setModalWorkspace] = useState({});
    const [modalView, setModalView] = useState();
    const [filteredWSList, setFilteredWSList] = useState([]);
    const [reload, setReload] = useState(false)


    useEffect(() => {
        async function loadData() {
            await getWorkspaces().then((res) => {
                setWorkspaceList(res.data);
                setFilteredWSList(res.data)
            })
        }
        loadData();
    }, [])

    useEffect(() => {
        async function loadData() {
            await getWorkspaces().then((res) => {
                setWorkspaceList(res.data);
                setFilteredWSList(res.data)
            })
        }
        loadData();
    }, [reload])

    useEffect(() => {
        setModalView(<>
            {modalWorkspace.activate && <WorkspaceActionModal isOpen={modalWorkspace.activate ? true : false} title="Activate Workspace?"
                action={"activate"}
                modalResult={confirmActivation}
                workspaceID={modalWorkspace.workspaceID}
                workspaceName={modalWorkspace.workspaceName}
            ></WorkspaceActionModal>}
            {modalWorkspace.deActivate && <WorkspaceActionModal isOpen={modalWorkspace.deActivate ? true : false} title="Deactivate Workspace?"
                action={"deactivate"}
                modalResult={confirmDeactivation}
                workspaceID={modalWorkspace.workspaceID}
                workspaceName={modalWorkspace.workspaceName}
            ></WorkspaceActionModal>}
            {modalWorkspace.delete && <WorkspaceActionModal isOpen={modalWorkspace.delete ? true : false} title="Delete Workspace?"
                action={"delete"}
                modalResult={confirmDeletion}
                workspaceID={modalWorkspace.workspaceID}
                workspaceName={modalWorkspace.workspaceName}
            ></WorkspaceActionModal>}
            {modalWorkspace.create && <ManageWorkspaceModal isOpen={modalWorkspace.create ? true : false} title="Create Workspace"
                modalResult={confirmCreation} mode={"create"}
            ></ManageWorkspaceModal>}
            {
                modalWorkspace.edit && <ManageWorkspaceModal isOpen={modalWorkspace.edit ? true : false} title="Edit Workspace"
                    workspaceId={modalWorkspace.workspaceId}
                    workspaceName={modalWorkspace.workspaceName}
                    modalResult={confirmEdit}
                    isAdmin={true}
                    mode={"edit"}
                ></ManageWorkspaceModal>
            }</>
        )

    }, [modalWorkspace])

    function confirmActivation(result) {
        if (result) {
            toast.success("Activated " + result.name + " Workspace");
        }
        setModalWorkspace({});
        setReload((prev) => !prev)
    }

    function confirmCreation(result) {
        if (result) {
            toast.success("Created " + result.workspace.name + " Workspace");
        }
        setModalWorkspace({});
        setReload((prev) => !prev)
    }

    function confirmEdit(result) {
        if (result) {
            toast.success("Edited " + result.workspace.name + " Workspace");
        }
        setModalWorkspace({});
        setReload((prev) => !prev)
    }

    function confirmDeactivation(result) {
        if (result) {
            if (result.success) {
                toast.success("Deactivated " + result.name + " Workspace");
            } else {
                toast.error("Failed to Deactivate " + result.name + " Workspace. Try Again Later.")
            }
        }
        setModalWorkspace({});
        setReload((prev) => !prev)
    }

    function confirmDeletion(result) {
        if (result) {
            toast.success("Deleted " + result.workspace.name + " Workspace");
        }
        setModalWorkspace({});
        setReload((prev) => !prev)
    }

    async function searchAndFilter() {
        // search
        let text = document.getElementById("search").value
        let searchOption = document.getElementById("searchSelect").value
        let activeFilter = document.getElementById("filterSelect").value
        let typeFilter = document.getElementById("filterSelect2").value

        let filterList = workspaceList;
        let filters = []
        if (activeFilter != 'none') filters.push({ 'name': 'active', 'value': activeFilter == 'true' });
        if (typeFilter != "none") filters.push({ 'name': 'type', 'value': typeFilter })
        //get search result
        if (text != '') {
            if (searchOption == 'name') {
                await searchWorkspacesByName(text).then((res) => {
                    filterList = res.data
                })
            } else if (searchOption == 'id') {
                await getWorkspaceById(text).then((res) => {
                    filterList = [res.data]
                })
            } else if (searchOption == 'city') {
                await searchWorkspacesByCity(text).then((res) => {
                    filterList = res.data
                })
            } else if (searchOption == 'adminId') {
                await searchWorkspacesByPrimaryAdminId(text).then((res) => {
                    filterList = res.data
                })
            } else if (searchOption == 'adminEmail') {
                await searchWorkspacesByPrimaryAdminEmail(text).then((res) => {
                    filterList = res.data
                })
            } else if (searchOption == 'adminName') {
                await searchWorkspacesByPrimaryAdminName(text).then((res) => {
                    filterList = res.data
                })
            }
        }
        //fitering
        setFilteredWSList(filter(filterList, filters));
    }

    function filter(list, filters) {
        let newList = [];
        let add = true;
        for (let i in list) {
            add = true;
            for (let j in filters) {
                console.log(filters[j])
                if (list[i][filters[j].name] != filters[j].value) {
                    add = false;
                }
            }
            if (!add) continue;
            newList.push(list[i]);
        }
        return newList;
    }

    function openModal(modalName, workspaceId, workspaceName) {
        switch (modalName) {
            case "activate_workspace":
                setModalWorkspace({
                    activate: true,
                    workspaceName: workspaceName,
                    workspaceID: workspaceId
                });
                return;
            case "deactivate_workspace":
                setModalWorkspace({
                    deActivate: true,
                    workspaceName: workspaceName,
                    workspaceID: workspaceId
                });
                return;
            case "delete_workspace":
                setModalWorkspace({
                    delete: true,
                    workspaceName: workspaceName,
                    workspaceID: workspaceId
                });
                return;
            case "create_workspace":
                setModalWorkspace({
                    create: true,
                });
                return;
            case "edit_workspace":
                setModalWorkspace({
                    edit: true,
                    workspaceName: workspaceName,
                    workspaceId: workspaceId
                });
                return;
        }

    }

    return (
        <>
            {modalView}
            <ToastContainer />
            <h1>Manage Workspaces</h1>
            <div className="d-flex justify-content-end py-2">
                <Button sx={{
                    color: "#449933"
                }}
                    onClick={() => { openModal('create_workspace') }}
                    endIcon={<AddCircleIcon />}>Create Workspace</Button>
            </div>
            <div className="d-flex py-2">
                <FormGroup className="flex-grow-1">
                    <Input id="search"
                        name="search"
                        type="search"
                        placeholder='Search for workspace'
                        className="w-100"
                        onChange={(e) => { searchAndFilter(e.target.value) }}
                    />
                </FormGroup>
                <FormGroup className="d-flex flex-shrink-0">
                    <Input
                        id="searchSelect"
                        name="searchSelect"
                        type="select"
                        className="w-100"
                        onChange={(e) => { searchAndFilter(e.target.value) }}
                    >
                        <option value="name">
                            Search by name
                        </option>
                        <option value="id">
                            Search by id
                        </option>
                        <option value="adminId">
                            Search by admin id
                        </option>
                        <option value="adminName">
                            Search by admin name
                        </option>
                        <option value="adminEmail">
                            Search by admin email
                        </option>
                        <option value="city">
                            Search by city
                        </option>
                    </Input>
                    <Input
                        id="filterSelect"
                        name="select"
                        type="select"
                        className="w-75"
                        onChange={(e) => { searchAndFilter(e.target.value) }}>
                        <option value="none">
                            Filter by active
                        </option>
                        <option value="true">
                            active
                        </option>
                        <option value="false">
                            inactive
                        </option>
                    </Input>
                    <Input
                        id="filterSelect2"
                        name="select"
                        type="select"
                        className="w-75"
                        onChange={(e) => { searchAndFilter(e.target.value) }}
                    >
                        <option value="none">
                            Filter by type
                        </option>
                        <option value="public">
                            Public
                        </option>
                        <option value="private">
                            Private
                        </option>
                    </Input>
                </FormGroup>
            </div>
            <Table
                bordered
                hover
                responsive
                size=""
                striped
            >
                <thead>
                    <tr>
                        <th>
                            Id
                        </th>
                        <th className="w-100">
                            Name
                        </th>
                        <th>
                            Phone
                        </th>
                        <th>
                            Email
                        </th>
                        <th>
                            Primary Admin Id
                        </th>
                        <th>
                            Primary Admin Name
                        </th>
                        <th>
                            Primary Admin Email
                        </th>
                        <th>
                            City
                        </th>
                        <th>
                            Type
                        </th>
                        <th>
                            Active
                        </th>
                        <th>
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {filteredWSList && filteredWSList.map((workspace) => {
                        return (
                            <tr>
                                <td>
                                    {workspace._id}
                                </td>
                                <td>
                                    {workspace.name}
                                </td>
                                <td>
                                    {workspace.phone}
                                </td>
                                <td>
                                    {workspace.email}
                                </td>
                                <td>
                                    {workspace.primaryAdmin && workspace.primaryAdmin._id}
                                </td>
                                <td>
                                    {workspace.primaryAdmin && (workspace.primaryAdmin.firstName + ' ' + workspace.primaryAdmin.lastName)}
                                </td>
                                <td>
                                    {workspace.primaryAdmin && workspace.primaryAdmin.email}
                                </td>
                                <td>
                                    {workspace.location?.city}
                                </td>
                                <td>
                                    {workspace.type}
                                </td>
                                <td>
                                    <input type="checkbox" disabled="disabled" checked={workspace.active}></input>
                                </td>
                                <td>
                                    <div className="d-flex gap-3 ps-1">
                                        <Tooltip title="Edit workspace" key={"edit"}><span onClick={() => { openModal('edit_workspace', workspace._id, workspace.name) }} style={{ color: "black", cursor: "pointer" }}><i className="fa-solid fa-pen-to-square"></i></span></Tooltip>
                                        {workspace.active && <Tooltip title="Deactivate Workspace" key={"deAct"}><span onClick={() => { openModal('deactivate_workspace', workspace._id, workspace.name) }} style={{ color: 'red', cursor: "pointer" }}> <i className="fa-solid fa-circle-xmark fa-xl"></i></span></Tooltip>}
                                        {!workspace.active && <Tooltip title="Activate Workspace" key={"act"}><span onClick={() => { openModal('activate_workspace', workspace._id, workspace.name) }} style={{ color: 'green', cursor: "pointer" }}> <i className="fa-solid fa-check-circle fa-xl"></i></span></Tooltip>}
                                        <Tooltip title="Delete Workspace" key={"del"}><span onClick={() => { openModal('delete_workspace', workspace._id, workspace.name) }} style={{ color: 'black', cursor: "pointer" }}> <i className="fa-solid fa-trash fa-xl"></i></span></Tooltip>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        </>
    )
}

var dummyWorkspaceData = [
    {
        id: 1234,
        name: "Factory X",
        primary_admin_id: "423424",
        primary_admin_name: "Admin Admin",
        primary_admin_email: "admin@gmail.com",
        isActive: true,
        city: "Nablus",
    },
    {
        id: 1222,
        name: "Office 2",
        primary_admin_id: "515315",
        primary_admin_name: "Admin Admin",
        primary_admin_email: "admin@gmail.com",
        isActive: false,
        city: "Ramallah",
    },
    {
        id: 1223,
        name: "Office 3",
        primary_admin_id: "515315",
        primary_admin_name: "Admin Admin",
        primary_admin_email: "admin@gmail.com",
        isActive: true,
        city: "Ramallah",
    },
];