import { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button, Tooltip } from "@mui/material"
import './manageWorkspaceModal.css';
import { getAdminByEmail, getAdminById, getBasicUsersByEmail, getBasicUsersByName, getUsersById, getWorkspaceById, getWorkspaces, searchAdminsByEmail, searchAdminsByName, updateWorkspaceById } from '../../scripts/APIs';
import { Table } from "reactstrap";

export default function ManageWSAdminsModal(props) {
    const [modal, setModal] = useState(props.isOpen);
    const [adminsList, setAdminsList] = useState([]);
    const [searchList, setSearchList] = useState([]);
    const [adminSearchType, setAdminSearchType] = useState("name");
    const [selectedPrimaryAdmin, setSelectedPrimaryAdmin] = useState(null);
    const [originalPrimaryAdmin, setOriginalPrimaryAdmin] = useState(null);
    const [workspace, setWorkspace] = useState({})

    const toggle = () => setModal(!modal);

    useEffect(() => {
        async function getWSAdmins() {
            await getWorkspaceById(props.workspaceId).then((res) => {
                setWorkspace(res.data)
                setAdminsList([...res.data.admins, res.data.primaryAdmin])
                setOriginalPrimaryAdmin(res.data.primaryAdmin._id)
                setSelectedPrimaryAdmin(res.data.primaryAdmin._id)
            })
        }
        getWSAdmins();
    }, [])

    useEffect(() => {
        searchForAdmins();
    }, [adminsList.length])


    const save = async () => {
        try {
            let admins = adminsList.filter((ad) => {
                return selectedPrimaryAdmin != ad._id
            })
            let adminIds = admins.map((user) => { return user._id });
            let data = { admins: adminIds }
            console.log(selectedPrimaryAdmin, originalPrimaryAdmin)
            if (selectedPrimaryAdmin != originalPrimaryAdmin) {
                data['primaryAdmin'] = selectedPrimaryAdmin
            }
            await updateWorkspaceById(props.workspaceId, data).then((res) => {
                props.modalResult({ mode: props.mode, success: true });
                toggle();
            })
        } catch (err) {
            toast.error("Failed to edit admins");
        }
    }

    const cancel = () => {
        props.modalResult(null);
        toggle();
    }


    async function searchForAdmins() {
        try {
            if (adminSearchType == 'name') {
                await searchAdminsByName(document.getElementById('search').value).then((res) => {
                    let searchRes = [];
                    for (var i in res.data) {
                        let user = res.data[i]
                        let index = adminsList.findIndex((wsUser) => { return wsUser._id == user._id });
                        let index2 = workspace.admins.findIndex((wsUser) => {
                            return wsUser._id == user._id
                        })
                        let primeFlag = workspace.primaryAdmin._id == user._id;
                        if (index == -1 && index2 == -1 && !primeFlag) {
                            searchRes.push(user);
                        }
                    }
                    setSearchList(searchRes)
                })
            } else {
                await searchAdminsByEmail(document.getElementById('search').value).then((res) => {
                    let searchRes = [];
                    for (var i in res.data) {
                        let user = res.data[i]
                        let index = adminsList.findIndex((wsUser) => { return wsUser._id == user._id });
                        let index2 = workspace.admins.findIndex((wsUser) => {
                            return wsUser._id == user._id
                        })
                        let primeFlag = workspace.primaryAdmin._id == user._id;
                        if (index == -1 && index2 == -1 && !primeFlag) {
                            searchRes.push(user);
                        }
                    }
                    setSearchList(searchRes)
                })
            }
        } catch (err) {
            setSearchList([])
        }
    }

    function addUserToList(user) {
        let newList = adminsList;
        newList.push(user);
        setAdminsList(newList);
        searchForAdmins()
        console.log(newList)
    }

    function removeUserFromWorkspace(userId) {
        let usersListCopy = adminsList
        let index = usersListCopy.findIndex((user) => { return user._id == userId });
        usersListCopy.splice(index, 1);
        searchForAdmins()
        setAdminsList(usersListCopy)
    }

    function changePrimaryAdmin(id) {
        console.log(id)
        setSelectedPrimaryAdmin(id);
    }

    return (
        <Modal isOpen={modal} toggle={toggle} size='lg' className='manage-workspace-modal'>
            <ToastContainer />
            <ModalHeader toggle={toggle}>{props.title}</ModalHeader>
            <ModalBody>
                <section name='add new users'>
                    <div>
                        <h3>Search users to add to workspace</h3>
                    </div>
                    <div className='d-flex g-2'>
                        <Input
                            id='search'
                            name='search'
                            placeholder='search for users'
                            type='search'
                            onChange={(e) => { searchForAdmins(e.target.value) }}
                            className='w-75'
                        >
                        </Input>
                        <Input
                            id='searchOption'
                            name='searchOption'
                            type='select'
                            onChange={(e) => { setAdminSearchType(e.target.value) }}
                            className='w-25'
                        >
                            <option value="name">
                                Search by name
                            </option>
                            <option value="email">
                                Search by email
                            </option>
                        </Input>
                    </div>
                    <div className='small-table mt-1'>
                        <Table
                            bordered
                            hover
                            responsive
                            size="sm"
                            striped>
                            <thead>
                                <tr>
                                    <th>
                                        Name
                                    </th>
                                    <th>
                                        Email
                                    </th>
                                    <th>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {searchList && searchList.map((user) => {
                                    return (
                                        <tr>
                                            <td>
                                                {user.firstName + ' ' + user.lastName}
                                            </td>
                                            <td>
                                                {user.email}
                                            </td>
                                            <td>
                                                <div className="d-flex gap-3 ps-1">
                                                    <Tooltip title="Add user to workspace admins" key={"act"}><span onClick={() => { addUserToList({ _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email }) }} style={{ color: 'green', cursor: "pointer" }}> <i className="fa-solid fa-check-circle fa-xl"></i></span></Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </div>
                </section>
                <hr className='mt-5'></hr>
                <section name='browse users' className='mt-5'>
                    <div>
                        <h3>Workspace Admins</h3>
                    </div>
                    <div className='small-table'>
                        <Table
                            bordered
                            hover
                            responsive
                            size="sm"
                            striped>
                            <thead>
                                <tr>
                                    <th>
                                        Name
                                    </th>
                                    <th>
                                        Email
                                    </th>
                                    <th>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {adminsList && adminsList.map((user) => {
                                    return (
                                        <tr>
                                            <td>
                                                {user.firstName + ' ' + user.lastName}
                                            </td>
                                            <td>
                                                {user.email}
                                            </td>
                                            <td>
                                                <div className="d-flex gap-3 ps-1">
                                                    {user._id != selectedPrimaryAdmin && <Tooltip title="remove user from workspace users" key={"rem"}><span onClick={() => { removeUserFromWorkspace(user._id) }} style={{ color: 'red', cursor: "pointer" }}> <i className="fa-solid fa-circle-xmark fa-xl"></i></span></Tooltip>}
                                                    {user._id != selectedPrimaryAdmin && <Tooltip title="set as primary admin" key={"set"}><span onClick={() => { changePrimaryAdmin(user._id) }} style={{ color: 'green', cursor: "pointer" }}> <i class="fa-solid fa-shield fa-xl"></i></span></Tooltip>}
                                                    {user._id == selectedPrimaryAdmin && <span>Primary admin</span>}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </div>
                    <div>{adminsList.length + (adminsList.length == 1 ? " admin " : " admins ") + "in workspace"}</div>
                </section>
            </ModalBody >
            <ModalFooter>
                <Button sx={{
                    color: "white",
                    backgroundColor: "#449933",
                    marginRight: 1,
                    '&:hover': {
                        backgroundColor: "#0b5715",
                    }
                }}
                    onClick={() => { save() }}
                    variant="contained">
                    Save</Button>
                <Button sx={{
                    color: "#449933"
                }}
                    onClick={() => { cancel() }}>
                    Cancel</Button>
            </ModalFooter>
        </Modal >
    )
}