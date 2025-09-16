import { useEffect, useRef, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Input, Label, FormGroup } from 'reactstrap';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Tooltip } from "@mui/material"
import '../manageWorkspaceModal.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getWorkspaceById } from '../../../scripts/APIs';
import { Save } from '@mui/icons-material';

const typeNameMap = {
    'FIXED_SINGLE_DESK': 'Fixed Single Desk',
    'FLEXIBLE_SINGLE_DESK': 'Flexible Single Desk',
    'MEETING_ROOM': 'Meeting Room',
}


export default function DeskInfoModal(props) {
    const [modal, setModal] = useState(props.isOpen);
    const view = props.view
    const [desk, setDesk] = useState(props.desk)
    const [workspace, setWorkspace] = useState(null)
    let deskLabel = useRef('');
    let capacityLabel = useRef('');
    const [usersList, setUsersList] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null)
    const viewUser = desk.deskType == 'FIXED_SINGLE_DESK' && desk.user
    const [capacity, setCapacity] = useState(desk.capacity)


    const toggle = () => setModal(!modal);

    useEffect(() => {
        async function getWSUsers() {
            try {
                await getWorkspaceById(props.desk.workspace._id).then((res) => {
                    setWorkspace(res.data)
                    setUsersList(res.data.users)
                })
            } catch (err) {
                props.modalResult(null);
                toggle();
            }
        }
        getWSUsers();
        console.log(desk)
        !view && props.desk.type == 'FIXED_SINGLE_DESK' && setSelectedUser(desk.user._id)
    }, [])

    const handleChange = (event) => {
        const {
            target: { value },
        } = event;
        setSelectedUser(
            // On autofill we get a stringified value.
            value
        );
    };


    const save = () => {
        desk.user = usersList.filter((user) => {
            return user._id == selectedUser
        })[0];

        props.modalResult(desk)
        toggle()
    }

    const cancel = () => {
        props.modalResult(null);
        toggle();
    }

    function handleCapacityChange(e) {
        const regex = /^[0-9\b]+$/;
        if (e.target.value === "" || regex.test(e.target.value)) {
            setCapacity(e.target.value);
            desk.capacity = e.target.value
        }
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
                            value={typeNameMap[desk.deskType]}
                            disabled
                            label="Desk Type" variant="outlined" />
                    </FormControl>
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
                            value={desk.name}
                            disabled={view}
                            label="Desk Name" variant="outlined" required={!view} focused placeholder='desk name' />
                    </FormControl>
                </Box>
                {
                    props.desk.type == 'FIXED_SINGLE_DESK' && !view && usersList && usersList.length > 0 &&
                    <Box sx={{ minWidth: 120 }}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Desk Owner</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={selectedUser}
                                label="Desk Owner"
                                onChange={handleChange}
                                required={!view}
                                disabled={view}
                            >

                                {usersList.map((user) => {
                                    return <MenuItem value={user._id}>{user.firstName + ' ' + user.lastName}</MenuItem>
                                })}
                            </Select>
                        </FormControl>
                    </Box>
                }
                {view && viewUser &&
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
                            value={viewUser.firstName + ' ' + viewUser.lastName}
                            disabled={view}
                            label="Desk Owner" variant="outlined" required={!view} focused />
                    </FormControl>
                }
                {desk.deskType == 'MEETING_ROOM' &&
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
                            value={capacity}
                            disabled={view}
                            onChange={handleCapacityChange}
                            label="Room Capacity" variant="outlined" required focused placeholder='1' />
                    </FormControl>}
            </ModalBody >
            <ModalFooter>
                {!view && <Button sx={{
                    color: "white",
                    backgroundColor: "#449933",
                    marginRight: 1,
                    '&:hover': {
                        backgroundColor: "#0b5715",
                    }
                }}
                    onClick={() => { save() }}
                    variant="contained">
                    Save</Button>}
                <Button sx={{
                    color: "#449933"
                }}
                    onClick={() => { cancel() }}>
                    Cancel</Button>
            </ModalFooter>
        </Modal >
    )
}