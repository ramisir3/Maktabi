import { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button, Tooltip } from "@mui/material"
import './manageWorkspaceModal.css';
import { getBasicUsersByEmail, getBasicUsersByName, getUsersById, getWorkspaceById, getWorkspaces, updateUsersById, updateWorkspaceById } from '../../scripts/APIs';
import { Table } from "reactstrap";

export default function ManageUserWSModal(props) {
    const [modal, setModal] = useState(props.isOpen);
    const [workspacesList, setWorkspacesList] = useState([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState({});

    const toggle = () => setModal(!modal);

    useEffect(() => {
        async function getWSList() {
            await getUsersById(props.userId).then((res) => {
                let wsList = res.data;
                wsList.filter((ws) => {
                    return ws.primaryAmin._id != props.userId;
                })
                setWorkspacesList(wsList)
            })
        }
        getWSList();
    }, [])


    const save = async () => {
        try {
            console.log(workspacesList, selectedWorkspace)
            let index = workspacesList.findIndex((ws) => { return ws.id == selectedWorkspace })
            let wsList = workspacesList
            wsList.splice(index, 1)
            console.log(wsList)
            let data = { workspaces: wsList }
            await updateUsersById(props.userId, data).then((res) => {
                props.modalResult({ mode: props.mode, success: true });
                toggle();
            })
        } catch (err) {
            toast.error("Failed to update workspaces");
        }
    }

    const cancel = () => {
        props.modalResult(null);
        toggle();
    }

    return (
        <Modal isOpen={modal} toggle={toggle} size='lg' className='manage-workspace-modal'>
            <ToastContainer />
            <ModalHeader toggle={toggle}>{props.title}</ModalHeader>
            <ModalBody>
                <section name='add new users'>
                    <div>
                        <h3>Choose workspace to stop managing</h3>
                        <h6>*You can't unmanage if you are a primary admin</h6>
                    </div>
                    <div className='d-flex g-2'>
                        <Input
                            id='wsSelect'
                            name='wsSelect'
                            type='select'
                            onChange={(e) => { setSelectedWorkspace(e.target.value) }}
                            className='w-100'
                        >
                            {workspacesList && workspacesList.length > 0 && workspacesList.map((ws) => {
                                return <option value={ws.id}>
                                    {ws.name}
                                </option>
                            })}
                        </Input>
                    </div>
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