import { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, ButtonGroup } from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button, FormControlLabel, FormLabel, RadioGroup } from "@mui/material"
import Radio from '@mui/material/Radio';
import 'react-phone-number-input/style.css'
import './manageUserModal.css'
import PhoneInput, { isPossiblePhoneNumber, isValidPhoneNumber } from 'react-phone-number-input'
import { getUserAvatarById, getUsersById, updateAvatar, updateUsersById, userSignUp } from '../../scripts/APIs';
import FormData from 'form-data';
import { getTokenFromLocalStorage } from '../../scripts/common';

export default function ManageUserModal(props) {
    const [modal, setModal] = useState(props.isOpen);
    const [phnValue, setPhnValue] = useState()
    const [imageUploaded, setImageUploaded] = useState(false);
    const [selectedFile, setSelectedFile] = useState(undefined);
    const [selectedValue, setSelectedValue] = useState('basic');

    useEffect(() => {
        async function getUserInfo() {
            await getUsersById(props.userID).then(async (user) => {
                await getUserAvatarById(props.userID).then(async (avatar) => {
                    document.getElementById('fName').value = user.data.firstName;
                    document.getElementById('lName').value = user.data.lastName;
                    document.getElementById('email').value = user.data.email;
                    setSelectedValue(user.data.role.toLowerCase())
                    setPhnValue('+' + user.data.phone)
                    if (avatar.data.size != 0) {
                        setSelectedFile(avatar.data)
                        setImageUploaded(true)
                    }
                })
            })
        }
        if (props.mode == 'edit') {
            getUserInfo()
        }
    }, [])

    const handleChange = (event) => {
        setSelectedValue(event.target.value);
    };

    const toggle = () => setModal(!modal);


    const save = async () => {
        if (props.mode == "create") {
            //try creating
            let fName = document.getElementById('fName').value;
            let lName = document.getElementById('lName').value;
            let email = document.getElementById('email').value;
            let pass = document.getElementById('pass').value;
            try {
                await userSignUp(fName, lName, email, pass, selectedValue, phnValue)
                    .then(async (response) => {
                        if (selectedFile) {
                            let data = new FormData();
                            data.append('avatar', selectedFile);
                            await updateAvatar(response.data.token, data);
                        }
                        props.modalResult({ mode: props.mode, success: true, user: response.data.user });
                        toggle();
                    })
            }
            catch (err) {
                toast.error("Failed to create User");
            }

        } else {
            let data = {}
            data['firstName'] = document.getElementById('fName').value;
            data['lastName'] = document.getElementById('lName').value;
            data['email'] = document.getElementById('email').value;
            if (document.getElementById('pass').value != '') {
                data['password'] = document.getElementById('pass').value
            }

            data['phone'] = phnValue.includes('undefined') || phnValue.includes('null') ? '' : phnValue;
            if (props.isAdmin) {
                data['role'] = selectedValue
            }
            console.log(data)
            try {
                await updateUsersById(props.userID, data)
                    .then(async (response) => {
                        if (selectedFile && !props.isAdmin) {
                            let data = new FormData();
                            data.append('avatar', selectedFile);
                            await updateAvatar(getTokenFromLocalStorage(), data);
                        }
                        props.modalResult({ mode: props.mode, success: true, user: response.data });
                        toggle();
                    })
            }
            catch (err) {
                toast.error("Failed to edit User");
            }

        }
    }

    const cancel = () => {
        props.modalResult(null);
        toggle();
    }

    function handleImageUpload(e) {
        setSelectedFile(e.target.files[0]);
        console.log(e.target.files[0])
        setImageUploaded(true);
    }

    return (
        <Modal isOpen={modal} toggle={toggle}>
            <ToastContainer />
            <ModalHeader toggle={toggle}>{props.title}</ModalHeader>
            <ModalBody>
                <Form>
                    {<div className={props.isAdmin ? "user-signup-input-container flex-row align-items-center justify-content-center" : "user-signup-input-container flex-row align-items-center justify-content-between"}>
                        <div className='user-signup-file-uploader'>
                            {imageUploaded ? <img className='user-signup-profile-image' src={URL.createObjectURL(selectedFile)} /> : <i className='fa fa-user fa-4x' />}
                        </div>
                        {!imageUploaded && !props.isAdmin && <Button variant="contained" component="label" sx={{
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
                        {imageUploaded && !props.isAdmin && <Button variant="contained" component="label" sx={{
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
                    </div>}
                    <div className="d-flex justify-content-between">
                        <div className="w-48">
                            <FormGroup floating>
                                <Input id="fName"
                                    name="fName"
                                    type="text"
                                    placeholder='First Name'
                                />
                                <Label for="fName">
                                    First Name
                                </Label>
                            </FormGroup>
                        </div>
                        <div className="w-50">
                            <FormGroup floating>
                                <Input
                                    id="lName"
                                    name="lName"
                                    type="lName"
                                    placeholder='Last Name'
                                />
                                <Label for="lName">
                                    Last Name
                                </Label>
                            </FormGroup>
                        </div>
                    </div>
                    <div className="d-flex justify-content-between">
                        <div className="w-100">
                            <FormGroup floating>
                                <Input id="email"
                                    name="email"
                                    type="email"
                                    placeholder='Email'
                                />
                                <Label for="email">
                                    Email
                                </Label>
                            </FormGroup>
                        </div>
                    </div>
                    <div className="d-flex ">
                        <div className="w-100">
                            <FormGroup floating>
                                <Input id="pass"
                                    name="pass"
                                    type="password"
                                    placeholder='Password'
                                />
                                <Label for="pass">
                                    Password
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
                    {props.isAdmin && <div className="d-flex justify-content-center">
                        <div>
                            <FormLabel id="demo-controlled-radio-buttons-group">Account type</FormLabel>
                            <RadioGroup
                                row
                                aria-labelledby="demo-controlled-radio-buttons-group"
                                name="controlled-radio-buttons-group"
                                value={selectedValue}
                                onChange={handleChange}
                            >
                                <FormControlLabel sx={{ color: '#0b5715', '&.Mui-checked': { color: '#0b5715' }, '.MuiRadio-colorPrimary': { color: '#0b5715' } }}
                                    value="basic" control={<Radio sx={{ color: '#0b5715', '&.Mui-checked': { color: '#0b5715' }, '.MuiRadio-colorPrimary': { color: '#0b5715' } }} />} label="Basic" />
                                <FormControlLabel sx={{ color: '#0b5715', '&.Mui-checked': { color: '#0b5715' } }}
                                    value="admin" control={<Radio sx={{ color: '#0b5715', '&.Mui-checked': { color: '#0b5715' }, '.MuiRadio-colorPrimary': { color: '#0b5715' } }} />} label="Admin" />
                            </RadioGroup>
                        </div>
                    </div>}
                </Form>
            </ModalBody>
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
        </Modal>
    )
}