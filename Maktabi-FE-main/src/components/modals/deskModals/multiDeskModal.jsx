import { useEffect, useRef, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../manageWorkspaceModal.css';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Tooltip } from "@mui/material"


export default function MultiDeskModal(props) {
    const [modal, setModal] = useState(props.isOpen);
    const [deskType, setDeskType] = useState(props.deskType)
    const [capacity, setCapacity] = useState(1)

    const deskLabel = useRef('');


    const toggle = () => setModal(!modal);

    useEffect(() => {

    }, [])


    const save = async () => {
        try {
            props.modalResult({ mode: props.mode, success: true, desk: { 'name': deskLabel.current.value, 'capacity': capacity } });
            toggle();

        } catch (err) {
            toast.error("Failed to create meeting room");
        }
    }

    const cancel = () => {
        props.modalResult(null);
        toggle();
    }

    function handleChange(e) {
        const regex = /^[0-9\b]+$/;
        if (e.target.value === "" || regex.test(e.target.value)) {
            setCapacity(e.target.value);
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
                            inputRef={deskLabel}
                            label="Room Name" variant="outlined" required focused placeholder='Room name' />
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
                            value={capacity}
                            onChange={handleChange}
                            label="Room Capacity" variant="outlined" required focused placeholder='' />
                    </FormControl>
                </Box>
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