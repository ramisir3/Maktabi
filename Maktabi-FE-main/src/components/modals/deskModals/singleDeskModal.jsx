import { useEffect, useRef, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Input, Label, FormGroup } from 'reactstrap';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Tooltip } from "@mui/material"
import '../manageWorkspaceModal.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getWorkspaceById } from '../../../scripts/APIs';

function getStyles(name, personName, theme) {
    return {
        fontWeight:
            personName.indexOf(name) === -1
                ? 400
                : 600,
    };
}

export default function SingleDeskModal(props) {
    const [modal, setModal] = useState(props.isOpen);
    const [deskType, setDeskType] = useState(props.deskType)
    const [usersList, setUsersList] = useState([]);
    const [workspace, setWorkspace] = useState({})
    const [selectedUser, setSelectedUser] = useState('')

    const deskLabel = useRef('');


    const toggle = () => setModal(!modal);

    useEffect(() => {
        async function getWSUsers() {
            try {
                await getWorkspaceById(props.workspaceId).then((res) => {
                    if (deskType == 'fixed' && (!res.data.users || res.data.users.length < 1)) {
                        throw new Error({ code: 11 })
                    }
                    setWorkspace(res.data)
                    setUsersList(res.data.users)
                })
            } catch (err) {
                if (err.code == '11') {
                    toast.error("No available users to assign to desk");
                    props.modalResult(null);
                    toggle();
                }
            }
        }
        getWSUsers();
    }, [])

    const handleChange = (event) => {
        const {
            target: { value },
        } = event;
        setSelectedUser(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };


    const save = async () => {
        try {
            props.modalResult({ mode: props.mode, success: true, desk: { 'name': deskLabel.current.value, 'type': deskType, 'users': selectedUser } });
            toggle();

        } catch (err) {
            toast.error("Failed to create desk");
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
                <Box sx={{ minWidth: 120, display: 'flex', flexDirection: 'column' }}>
                    <FormControl fullWidth>
                        <TextField
                            sx={{
                                marginBottom: 5,
                                "& label.Mui-focused": {
                                    color: "#0b5715"
                                },
                                "& .MuiOutlinedInput-root": {
                                    '&.Mui-focused fieldset': {
                                        borderColor: "#0b5715",
                                    },
                                    color: '#0b5715',
                                    margin: 0,
                                    padding: 0
                                }
                            }}
                            inputRef={deskLabel}
                            label="Desk Name" variant="outlined" required focused placeholder='desk name' />
                    </FormControl>
                </Box>
                {
                    deskType == 'fixed' && usersList && usersList.length > 0 &&
                    <Box sx={{ minWidth: 120 }}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Desk Owner</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={selectedUser}
                                label="Desk Owner"
                                onChange={handleChange}
                                required
                            >

                                {usersList.map((user) => {
                                    return <MenuItem value={user}>{user.firstName + ' ' + user.lastName}</MenuItem>
                                })}
                            </Select>
                        </FormControl>
                    </Box>
                }
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
                    Add</Button>
                <Button sx={{
                    color: "#449933"
                }}
                    onClick={() => { cancel() }}>
                    Cancel</Button>
            </ModalFooter>
        </Modal >
    )
}