import { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button, Tooltip } from "@mui/material"
import './manageWorkspaceModal.css';
import { getBasicUsersByEmail, getBasicUsersByName, getWorkspaceById, getWorkspaces, updateWorkspaceById } from '../../scripts/APIs';
import { Table } from "reactstrap";

export default function ManageWSUsersModal(props) {
    const [modal, setModal] = useState(props.isOpen);
    const [usersList, setUsersList] = useState([]);
    const [searchList, setSearchList] = useState([]);
    const [userSearchType, setUserSearchType] = useState("name");
    const [workspace, setWorkspace] = useState({})

    const toggle = () => setModal(!modal);

    useEffect(() => {
        async function getWSUsers() {
            await getWorkspaceById(props.workspaceId).then((res) => {
                setWorkspace(res.data)
                console.log(res.data.users)
                setUsersList(res.data.users)
            })
        }
        getWSUsers();
    }, [])

    useEffect(() => {
        searchForUsers();
    }, [usersList.length])


    const save = async () => {
        try {
            let userIds = usersList.map((user) => { return user._id });
            console.log(usersList, userIds)
            let data = { users: userIds }
            await updateWorkspaceById(props.workspaceId, data).then((res) => {
                props.modalResult({ mode: props.mode, success: true });
                toggle();
            })
        } catch (err) {
            toast.error("Failed to edit workspace users");
        }
    }

    const cancel = () => {
        props.modalResult(null);
        toggle();
    }


    async function searchForUsers() {
        try {
            if (userSearchType == 'name') {
                await getBasicUsersByName(document.getElementById('search').value).then((res) => {
                    let searchRes = [];
                    for (var i in res.data) {
                        let user = res.data[i]
                        let index = usersList.findIndex((wsUser) => { return wsUser._id == user._id });
                        let index2 = workspace.users.findIndex((wsAdmin) => {
                            return wsAdmin._id == user._id
                        })
                        if (index == -1 && index2 == -1) {
                            searchRes.push(user);
                        }
                    }
                    setSearchList(searchRes)
                })
            } else {
                await getBasicUsersByEmail(document.getElementById('search').value).then((res) => {
                    let searchRes = [];
                    for (var i in res.data) {
                        let user = res.data[i]
                        let index = usersList.findIndex((wsUser) => { return wsUser._id == user._id });
                        let index2 = workspace.users.findIndex((wsAdmin) => {
                            return wsAdmin._id == user._id
                        })
                        if (index == -1 && index2 == -1) {
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
        let newList = usersList;
        newList.push(user);
        setUsersList(newList);
        searchForUsers()
        console.log(newList)
    }

    function removeUserFromWorkspace(userId) {
        let usersListCopy = usersList
        let index = usersListCopy.findIndex((user) => { return user._id == userId });
        usersListCopy.splice(index, 1);
        searchForUsers()
        setUsersList(usersListCopy)
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
                            onChange={(e) => { searchForUsers(e.target.value) }}
                            className='w-75'
                        >
                        </Input>
                        <Input
                            id='searchOption'
                            name='searchOption'
                            type='select'
                            onChange={(e) => { setUserSearchType(e.target.value) }}
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
                                                    <Tooltip title="Add user to workspace users" key={"act"}><span onClick={() => { addUserToList(user) }} style={{ color: 'green', cursor: "pointer" }}> <i className="fa-solid fa-check-circle fa-xl"></i></span></Tooltip>
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
                        <h3>Workspace Users</h3>
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
                                {usersList && usersList.map((user) => {
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
                                                    <Tooltip title="remove user from workspace users" key={"rem"}><span onClick={() => { removeUserFromWorkspace(user._id) }} style={{ color: 'red', cursor: "pointer" }}> <i className="fa-solid fa-circle-xmark fa-xl"></i></span></Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </div>
                    <div>{usersList.length + (usersList.length == 1 ? " user " : " users ") + "in workspace"}</div>
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