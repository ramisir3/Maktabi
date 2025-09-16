import { Tooltip, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { FormGroup, Input, Label, Table } from "reactstrap";
import UserActionModal from "../../../components/modals/userActionModal";
import "./userManagement.css"
import AddCircleIcon from '@mui/icons-material/AddCircle';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ManageUserModal from "../../../components/modals/manageUserModal";
import { getUsers, getUsersByEmail, getUsersById, getUsersByName, searchUsersByEmail, searchUsersById, searchUsersByName } from "../../../scripts/APIs";

export default function UserManagementMaktabiAdmin() {
    const [userList, setUserList] = useState([]);
    const [filteredUserList, setFilteredUserList] = useState([]);
    const [modalUser, setModalUser] = useState({});
    const [modalView, setModalView] = useState();
    const [reload, setReload] = useState(false)

    useEffect(() => {
        async function loadData() {
            await getUsers("").then((res) => {
                setUserList(res.data);
                setFilteredUserList(res.data)
            })
        }
        loadData();
    }, [])

    useEffect(() => {
        async function loadData() {
            await getUsers("").then((res) => {
                setUserList(res.data);
                setFilteredUserList(res.data)
            })
        }
        loadData();
    }, [reload])

    useEffect(() => {
        setModalView(<>
            {modalUser.activate && <UserActionModal isOpen={modalUser.activate ? true : false} title="Activate User?"
                action={"activate"}
                modalResult={confirmActivation}
                userID={modalUser.userID}
                userName={modalUser.userName}
            ></UserActionModal>}
            {modalUser.deActivate && <UserActionModal isOpen={modalUser.deActivate ? true : false} title="Deactivate User?"
                action={"deactivate"}
                modalResult={confirmDeactivation}
                userID={modalUser.userID}
                userName={modalUser.userName}
            ></UserActionModal>}
            {modalUser.delete && <UserActionModal isOpen={modalUser.delete ? true : false} title="Delete User?"
                action={"delete"}
                modalResult={confirmDeletion}
                userID={modalUser.userID}
                userName={modalUser.userName}
            ></UserActionModal>}
            {modalUser.create && <ManageUserModal isOpen={modalUser.create ? true : false} title="Create User"
                modalResult={confirmCreation} mode={"create"} isAdmin={true}
            ></ManageUserModal>}
            {
                modalUser.edit && <ManageUserModal isOpen={modalUser.edit ? true : false} title="Edit User"
                    userID={modalUser.userID}
                    userName={modalUser.userName}
                    modalResult={confirmEdit}
                    mode={"edit"}
                    isAdmin={true}
                ></ManageUserModal>
            }</>
        )

    }, [modalUser])

    function confirmActivation(result) {
        if (result) {
            toast.success("Activated " + result.user.firstName + " " + result.user.lastName + " User");
        }
        setModalUser({});
    }

    function confirmCreation(result) {
        if (result) {
            toast.success("Created " + result.user.firstName + " " + result.user.lastName + " User");
        }
        setModalUser({});
        setReload((prev) => { return !prev })
    }

    function confirmEdit(result) {
        if (result) {
            toast.success("Edited " + result.user.firstName + " " + result.user.lastName + " User");
        }
        setModalUser({});
    }

    function confirmDeactivation(result) {
        if (result) {
            if (result.success) {
                toast.success("Deactivated " + result.user.firstName + " " + result.user.lastName + " User");
            } else {
                toast.error("Failed to Deactivate " + result.user.firstName + " " + result.user.lastName + " User. Try Again Later.")
            }
        }
        setModalUser({});
    }

    async function confirmDeletion(result) {
        if (result) {
            toast.success("Deleted " + result.name + " User");
            await getUsers("").then((res) => {
                setUserList(res.data);
                searchAndFilter()
                setReload((prev) => { return !prev })
            })
        }
        setModalUser({});

    }

    async function searchAndFilter() {
        //search
        let text = document.getElementById("search").value
        let searchOption = document.getElementById("searchSelect").value
        let activeFilter = document.getElementById("activationFilterSelect").value
        let roleFilter = document.getElementById("roleFilterSelect").value

        let filterList = userList;
        let filters = [];
        if (activeFilter != 'none') filters.push({ 'name': 'active', 'value': activeFilter == 'true' });
        if (roleFilter != 'none') filters.push({ 'name': 'role', 'value': roleFilter });
        //get search result
        if (text != '') {
            if (searchOption == 'name') {
                await searchUsersByName(text).then((res) => {
                    filterList = res.data
                })
            } else if (searchOption == 'email') {
                await searchUsersByEmail(text).then((res) => {
                    filterList = res.data
                })
            } else if (searchOption == 'id') {
                await searchUsersById(text).then((res) => {
                    filterList = res.data
                })
            }
        }
        //fitering
        setFilteredUserList(filter(filterList, filters));
    }

    function filter(list, filters) {
        console.log(filters)
        let newList = [];
        let add = true;
        for (let i in list) {
            add = true;
            for (let j in filters) {
                if (filters[j].name == 'role' && list[i][filters[j].name].toLowerCase() != filters[j].value.toLowerCase()) {
                    add = false;
                } else if (filters[j].name == 'active' && list[i][filters[j].name] != filters[j].value) {
                    add = false;
                }
            }
            if (!add) continue;
            newList.push(list[i]);
        }
        return newList;
    }

    function openModal(modalName, user) {
        switch (modalName) {
            case "activate_user":
                setModalUser({
                    activate: true,
                    userName: user.firstName + ' ' + user.lastName,
                    userID: user._id
                });
                return;
            case "deactivate_user":
                setModalUser({
                    deActivate: true,
                    userName: user.firstName + ' ' + user.lastName,
                    userID: user._id
                });
                return;
            case "delete_user":
                setModalUser({
                    delete: true,
                    userName: user.firstName + ' ' + user.lastName,
                    userID: user._id
                });
                return;
            case "create_user":
                setModalUser({
                    create: true,
                });
                return;
            case "edit_user":
                setModalUser({
                    edit: true,
                    userName: user.firstName + ' ' + user.lastName,
                    userID: user._id
                });
                return;
        }

    }

    return (
        <>
            {modalView}
            <ToastContainer />
            <h1>Manage Users</h1>

            <div className="d-flex justify-content-end py-2">
                <Button sx={{
                    color: "#449933"
                }}
                    onClick={() => { openModal('create_user') }}
                    endIcon={<AddCircleIcon />}>Create User</Button>
            </div>
            <div className="d-flex py-2">
                <FormGroup className="flex-grow-1">
                    <Input id="search"
                        name="search"
                        type="search"
                        placeholder='Search for user'
                        className="w-100"
                        onChange={(e) => { searchAndFilter(e.target.value) }}
                    />
                </FormGroup>
                <FormGroup className="d-flex">
                    <Input
                        id="searchSelect"
                        name="searchSelect"
                        type="select"
                        onChange={(e) => { searchAndFilter(e.target.value) }}
                        className="w-100"
                    >
                        <option value="name">
                            Search by name
                        </option>
                        <option value="id">
                            Search by id
                        </option>
                        <option value="email">
                            Search by email
                        </option>
                    </Input>
                    <Input
                        id="activationFilterSelect"
                        name="activationFilterSelect"
                        type="select"
                        onChange={(e) => { searchAndFilter(e.target.value) }}
                        className="w-75"
                    >
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
                        id="roleFilterSelect"
                        name="roleFilterSelect"
                        type="select"
                        onChange={(e) => { searchAndFilter(e.target.value) }}
                        className="w-75"
                    >
                        <option value="none">
                            Filter by role
                        </option>
                        <option value="admin">
                            admin
                        </option>
                        <option value="basic">
                            basic
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
                        <th>
                            First Name
                        </th>
                        <th>
                            Last Name
                        </th>
                        <th>
                            Email
                        </th>
                        <th>
                            Phone Number
                        </th>
                        <th>
                            Role
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
                    {filteredUserList && filteredUserList.map((user) => {
                        return (
                            <tr>
                                <td>
                                    {user._id}
                                </td>
                                <td>
                                    {user.firstName}
                                </td>
                                <td>
                                    {user.lastName}
                                </td>
                                <td>
                                    {user.email}
                                </td>
                                <td>
                                    {user.phone}
                                </td>
                                <td>
                                    {user.role.toLowerCase()}
                                </td>
                                <td>
                                    <input type="checkbox" disabled="disabled" checked={user.active}></input>
                                </td>
                                <td>
                                    <div className="d-flex gap-3 ps-1">
                                        <Tooltip title="Edit User" key={"edit"}><span onClick={() => { openModal('edit_user', user) }} style={{ color: "black", cursor: "pointer" }}><i className="fa-solid fa-pen-to-square"></i></span></Tooltip>
                                        {user.active && <Tooltip title="Deactivate User" key={"deAct"}><span onClick={() => { openModal('deactivate_user', user) }} style={{ color: 'red', cursor: "pointer" }}> <i className="fa-solid fa-circle-xmark fa-xl"></i></span></Tooltip>}
                                        {!user.active && <Tooltip title="Activate User" key={"act"}><span onClick={() => { openModal('activate_user', user) }} style={{ color: 'green', cursor: "pointer" }}> <i className="fa-solid fa-check-circle fa-xl"></i></span></Tooltip>}
                                        <Tooltip title="Delete User" key={"del"}><span onClick={() => { openModal('delete_user', user) }} style={{ color: 'black', cursor: "pointer" }}> <i className="fa-solid fa-trash fa-xl"></i></span></Tooltip>
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