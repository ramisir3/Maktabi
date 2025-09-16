import { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button, FormControlLabel, FormLabel, Radio, RadioGroup } from "@mui/material"
import PhoneInput from 'react-phone-number-input';
import './manageWorkspaceModal.css';
import { createWorkspace, getAdminByEmail, getAdminById, getWorkspaceAvatarById, getWorkspaceById, updateWorkspaceAvatarById, updateWorkspaceById } from '../../scripts/APIs';

export default function ManageWorkspaceModal(props) {
    const [modal, setModal] = useState(props.isOpen);
    const [phnValue, setPhnValue] = useState()
    const [imageUploaded, setImageUploaded] = useState(false);
    const [selectedFile, setSelectedFile] = useState(undefined);
    const [selectedValue, setSelectedValue] = useState('public');
    const [adminSearchType, setAdminSearchType] = useState("id");
    const [adminFound, setAdminFound] = useState(false);
    const [primaryAdmin, setPrimaryAdmin] = useState(null);

    useEffect(() => {
        async function getWSInfo() {
            await getWorkspaceById(props.workspaceId).then(async (ws) => {
                document.getElementById('name').value = ws.data.name;
                document.getElementById('city').value = ws.data.location.city;
                document.getElementById('address').value = ws.data.location.address;
                document.getElementById('email').value = ws.data.email;
                document.getElementById('floors').value = ws.data.numberOfFloors;
                setPrimaryAdmin(ws.data.primaryAdmin)
                setAdminFound(true)
                setSelectedValue(ws.data.type.toLowerCase())
                setPhnValue('+' + ws.data.phone)
                await getWorkspaceAvatarById(ws.data._id).then((avatar) => {
                    if (avatar.data.size > 0) {
                        setSelectedFile(avatar.data)
                        setImageUploaded(true)
                    }
                })
            })
        }
        if (props.mode == 'edit') {
            getWSInfo()
        }
    }, [])

    const toggle = () => setModal(!modal);


    const save = async () => {
        if (props.mode == "create") {
            //try creating
            //name, location, phone, type, email, numberOfFloors, active, users, admins, primaryAdmin
            let workspace = {} //getfields
            workspace['name'] = document.getElementById('name').value;
            workspace['location'] = { city: document.getElementById('city').value, address: document.getElementById('address').value };
            workspace['phone'] = phnValue;
            workspace['email'] = document.getElementById('email').value;
            workspace['numberOfFloors'] = parseInt(document.getElementById('floors').value);
            workspace['active'] = props.active != undefined ? props.active : true;
            workspace['users'] = [];
            workspace['admins'] = [];
            workspace['primaryAdmin'] = props.active == false ? props.primaryAdmin._id : primaryAdmin._id;
            workspace['type'] = selectedValue;
            console.log(workspace)
            try {
                await createWorkspace(workspace).then(async (res) => {
                    if (selectedFile) {
                        let data = new FormData();
                        data.append('avatar', selectedFile);
                        await updateWorkspaceAvatarById(res.data._id, data);
                    }
                    props.modalResult({ mode: props.mode, success: true, workspace: workspace });
                    toggle();
                })
            } catch (err) {
                toast.error("Failed to create workspace");
            }
        } else {
            let workspace = {} //getfields
            workspace['name'] = document.getElementById('name').value;
            workspace['location'] = { city: document.getElementById('city').value, address: document.getElementById('address').value };
            workspace['phone'] = phnValue;
            workspace['email'] = document.getElementById('email').value;
            workspace['numberOfFloors'] = parseInt(document.getElementById('floors').value);
            workspace['type'] = selectedValue;
            workspace['primaryAdmin'] = primaryAdmin._id

            console.log(workspace, selectedFile)

            try {
                await updateWorkspaceById(props.workspaceId, workspace).then(async (res) => {
                    if (selectedFile) {
                        let data = new FormData();
                        data.append('avatar', selectedFile, 'avatar.png');
                        console.log(selectedFile)
                        await updateWorkspaceAvatarById(res.data._id, data);
                    }
                    props.modalResult({ mode: props.mode, success: true, workspace: workspace });
                    toggle();
                })
            } catch (err) {
                toast.error("Failed to edit workspace");
            }

        }
    }

    const cancel = () => {
        props.modalResult(null);
        toggle();
    }

    const handleChange = (event) => {
        setSelectedValue(event.target.value);
    };

    function changeAdminSearchType(type) {
        setAdminSearchType(type)
    }

    function handleImageUpload(e) {
        setSelectedFile(e.target.files[0]);
        console.log(e.target.files[0])
        setImageUploaded(true);
    }


    async function searchForAdmin() {
        if (adminSearchType == 'id') {
            await getAdminById(document.getElementById('primaryAdmin').value).then((res) => {
                if (res.data.length != 0) {
                    setAdminFound(true)
                    res.data[0].name = res.data[0].firstName + ' ' + res.data[0].lastName
                    setPrimaryAdmin(res.data[0])
                } else {
                    setAdminFound(false)
                    setPrimaryAdmin(null)
                }
            })
        } else {
            await getAdminByEmail(document.getElementById('primaryAdmin').value).then((res) => {
                console.log(res)
                if (res.data.length != 0) {
                    setAdminFound(true)
                    res.data[0].name = res.data[0].firstName + ' ' + res.data[0].lastName
                    setPrimaryAdmin(res.data[0])
                } else {
                    setAdminFound(false)
                    setPrimaryAdmin(null)
                }
            })
        }
    }

    return (
        <Modal isOpen={modal} toggle={toggle} size='lg' className='manage-workspace-modal'>
            <ToastContainer />
            <ModalHeader toggle={toggle}>{props.title}</ModalHeader>
            <ModalBody>
                <Form>
                    <div className="user-signup-input-container flex-row align-items-center justify-content-around">
                        <div className='user-signup-file-uploader'>
                            {imageUploaded ? <img className='user-signup-profile-image' src={URL.createObjectURL(selectedFile)} /> : <i className='fa fa-user fa-4x' />}
                        </div>
                        {!imageUploaded && <Button variant="contained" component="label" sx={{
                            height: 40,
                            color: "white",
                            borderColor: "#0b5715",
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 600,
                            bgcolor: '#0b5715',
                            ':hover': {
                                bgcolor: '#449933',
                                color: 'white',
                            },
                        }}>
                            Upload Profile Picture
                            <input hidden accept="image/*" type="file"
                                onChange={(e) => handleImageUpload(e)} />
                        </Button>}
                        {imageUploaded && <Button variant="contained" component="label" sx={{
                            height: 40,
                            color: "white",
                            borderColor: "#0b5715",
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 600,
                            bgcolor: '#0b5715',
                            ':hover': {
                                bgcolor: '#449933',
                                color: 'white',
                            },
                        }}
                            onClick={() => { setImageUploaded(false); setSelectedFile(undefined) }}
                        >
                            Remove Image
                        </Button>}
                    </div>
                    <div className="d-flex ">
                        <div className="w-100">
                            <FormGroup floating>
                                <Input id="name"
                                    name="name"
                                    type="text"
                                    placeholder='Name'
                                />
                                <Label for="name">
                                    Workspace name
                                </Label>
                            </FormGroup>
                        </div>
                    </div>
                    <div className="d-flex justify-content-between">
                        <div className="w-45">
                            <FormGroup floating>
                                <Input id="city"
                                    name="city"
                                    type="text"
                                    placeholder='City'
                                />
                                <Label for="city">
                                    City
                                </Label>
                            </FormGroup>
                        </div>
                        <div className="w-50">
                            <FormGroup floating>
                                <Input id="address"
                                    name="address"
                                    type="address"
                                    placeholder='address'
                                />
                                <Label for="address">
                                    Address
                                </Label>
                            </FormGroup>
                        </div>
                    </div>
                    <div className="d-flex ">
                        <div className="w-100">
                            <FormGroup floating>
                                <Input id="email"
                                    name="email"
                                    type="email"
                                    placeholder='email'
                                />
                                <Label for="email">
                                    Workspace email
                                </Label>
                            </FormGroup>
                        </div>
                    </div>
                    <div className="d-flex justify-content-between">
                        <div className="w-100">
                            <FormGroup floating>
                                <PhoneInput
                                    placeholder="Enter phone number"
                                    defaultCountry='PS'
                                    international={true}
                                    withCountryCallingCode={true}
                                    value={phnValue}
                                    onChange={setPhnValue} />
                            </FormGroup>
                        </div>
                    </div>
                    <div className="d-flex justify-content-center">
                        <div>
                            <FormLabel id="demo-controlled-radio-buttons-group">Workspace Type</FormLabel>
                            <RadioGroup
                                row
                                aria-labelledby="demo-controlled-radio-buttons-group"
                                name="controlled-radio-buttons-group"
                                value={selectedValue}
                                onChange={handleChange}
                            >
                                <FormControlLabel sx={{ color: '#0b5715', '&.Mui-checked': { color: '#0b5715' }, '.MuiRadio-colorPrimary': { color: '#0b5715' } }}
                                    value="public" control={<Radio sx={{ color: '#0b5715', '&.Mui-checked': { color: '#0b5715' }, '.MuiRadio-colorPrimary': { color: '#0b5715' } }} />} label="Public" />
                                <FormControlLabel sx={{ color: '#0b5715', '&.Mui-checked': { color: '#0b5715' } }}
                                    value="private" control={<Radio sx={{ color: '#0b5715', '&.Mui-checked': { color: '#0b5715' }, '.MuiRadio-colorPrimary': { color: '#0b5715' } }} />} label="Private" />
                            </RadioGroup>
                        </div>
                    </div>
                    <div className="d-flex ">
                        <div className="w-100">
                            <FormGroup floating>
                                <Input id="floors"
                                    name="floors"
                                    type="number"
                                    placeholder='floors'
                                    min={0}
                                />
                                <Label for="floors">
                                    Number of floors
                                </Label>
                            </FormGroup>
                        </div>
                    </div>
                    {((props.mode == 'create' && props.active != false) || props.isAdmin) &&
                        <div className="d-flex primary-admin-wrapper">
                            <Input id="primaryAdmin"
                                name="primaryAdmin"
                                type="text"
                                placeholder='Primary admin'
                                className='w-50'
                            />
                            <Input
                                id="searchSelect"
                                name="searchSelect"
                                type="select"
                                className='w-25'
                                onChange={(e) => { changeAdminSearchType(e.target.value) }}
                            >
                                <option value="id">
                                    Search by id
                                </option>
                                <option value="email">
                                    Search by email
                                </option>
                            </Input>
                            <Button sx={{
                                color: "#449933"
                            }}
                                onClick={() => { searchForAdmin() }}>
                                Search</Button>
                            <div className="align-items-center d-flex mb-1">
                                {adminFound ? <i class="fa-solid fa-check dark-green admin-search-icon"></i> : <i class="fa-solid fa-xmark red admin-search-icon"></i>}
                            </div>
                        </div>
                    }
                    {adminFound && (<div className="user-signup-input-container flex-row align-items-center justify-content-around">
                        primary admin: {primaryAdmin && primaryAdmin.firstName + ' ' + primaryAdmin.lastName}
                    </div>)}
                    {(props.mode != 'edit' && props.active === false && !props.isAdmin) &&
                        <div className="user-signup-input-container">
                            After the activation of the workspace, you can continue the setup and configuration from the 'Edit workspace' of the selected workspace
                        </div>
                    }
                </Form>
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
                    disabled={!adminFound && props.active !== false}
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