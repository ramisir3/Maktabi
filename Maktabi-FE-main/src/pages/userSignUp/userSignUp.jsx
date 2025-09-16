import { Button, TextField } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../../images/logo-no-background.png'
import './userSignUp.css'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import LoadingSpinner from '../../components/loadingSpinner/spinner';
import { updateAvatar, userSignUp } from '../../scripts/APIs';
import FormData from 'form-data'
import { useUser } from '../../scripts/customHooks';
import 'react-phone-number-input/style.css'
import PhoneInput, { isPossiblePhoneNumber, isValidPhoneNumber } from 'react-phone-number-input'




export default function UserSignUp(props) {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [userType, setUserType] = useState(searchParams.get('type') ? searchParams.get('type') : 'BASIC');

    const { user, authenticated } = useUser();

    const [emailErrorText, setEmailErrorText] = useState(" ");
    const [passErrorText, setPassErrorText] = useState(" ");
    const [fNameErrorText, setFNameErrorText] = useState(" ");
    const [lNameErrorText, setLNameErrorText] = useState(" ");
    const [phnErrorText, setPhnErrorText] = useState(" ");
    const [processing, setProcessing] = useState(false);
    const [imageUploaded, setImageUploaded] = useState(false);
    const [selectedFile, setSelectedFile] = useState(undefined);
    const [phnValue, setPhnValue] = useState()

    const emailValue = useRef('');
    const passValue = useRef('');
    const fNameValue = useRef('');
    const lNameValue = useRef('');



    let passError = false;
    let emailError = false;
    let fNameError = false;
    let lNameError = false;
    let phnError = false;


    function validateEmail() {
        let re = /[^\s@]+@[^\s@]+\.[^\s@]+/;
        if (emailValue.current.value === "") {
            emailError = true;
            setEmailErrorText("Email is required")
            return;
        }
        if (!emailValue.current.value.match(re)) {
            emailError = true;
            setEmailErrorText("Email is the wrong format")
            return;
        }
        emailError = false;
        setEmailErrorText(" ");
        return true;
    }

    function validatePass() {
        if (passValue.current.value === "") {
            passError = true;
            setPassErrorText("Password is required")
            return;
        }
        if (passValue.current.value.length < 7 || passValue.current.value.length > 64) {
            passError = true;
            setPassErrorText("Password should be between 7 and 64 characters")
            return;
        }
        passError = false;
        setPassErrorText(" ");
        return true;
    }

    function validateFName() {
        if (fNameValue.current.value === "") {
            setFNameErrorText("First name is required")
            fNameError = true;
            return;
        }
        fNameError = false;
        setFNameErrorText("");
        return true;
    }

    function validateLName() {
        if (lNameValue.current.value === "") {
            setLNameErrorText("Last name is required")
            lNameError = true;
            return;
        }
        lNameError = false;
        setLNameErrorText("");
        return true;
    }

    function validatePhoneNumer() {
        if (phnValue == '' || phnValue == undefined) {
            setPhnErrorText("Phone number is required")
            phnError = true;
            return;
        } else if (!isValidPhoneNumber(phnValue)) {
            setPhnErrorText("Invalid phone number")
            phnError = true;
            return;
        }
        phnError = false;
        setPhnErrorText("")
        return true;
    }

    async function handleSignUp() {
        setProcessing(true);
        validateEmail();
        validatePass();
        validateFName();
        validateLName();
        validatePhoneNumer();
        if (!passError && !emailError && !fNameError && !lNameError && !phnError) {
            try {
                await userSignUp(fNameValue.current.value, lNameValue.current.value, emailValue.current.value, passValue.current.value, userType, phnValue)
                    .then(async (response) => {
                        if (selectedFile) {
                            let data = new FormData();
                            data.append('avatar', selectedFile);
                            await updateAvatar(response.data.token, data);
                        }
                        navigate('/');
                    })
            }
            catch (err) {
                console.log('Some error occured during signing in: ', err);
            }
            finally {
                setProcessing(false);
            }
        } else {
            setProcessing(false);
        }
    }
    useEffect(() => {
        const keyDownHandler = event => {

            if (event.key === 'Enter') {
                event.preventDefault();

                // 👇️ call submit function here
                handleSignUp();
            }
        };

        document.addEventListener('keydown', keyDownHandler);

        return () => {
            document.removeEventListener('keydown', keyDownHandler);
        };
    }, []);

    function handleImageUpload(e) {
        setSelectedFile(e.target.files[0]);
        setImageUploaded(true);
    }

    if (user && authenticated) {
        navigate(-1);
        return;
    }

    return (
        <>
            <div className="user-signup-fill">
                <Button onClick={() => navigate("/?activeTab=Home")}
                    variant="contained" startIcon={<KeyboardBackspaceIcon />} sx={{
                        position: 'fixed',
                        top: 30,
                        left: 30,
                        backgroundColor: '#0b5715',
                        color: 'white',
                        ':hover': {
                            bgcolor: '#449933',
                            color: 'white',
                        },
                    }}> Back to homepage</Button>
                <div className='user-signup-box'>
                    <img className="login-logo" src={Logo} alt="Logo" />
                    {userType == 'BASIC' ? <div className='dark-green pt-4'>Create your new user account</div>
                        : <><div className='dark-green pt-4 px-5'>If you already have an Admin account, log into that account and create a workspace there</div>
                            <div className='dark-green px-5'>If there is your first workspace management account, create the account here and create you workspace when you log in</div></>}
                    <div className="user-signup-form">
                        <form>
                            <div className='user-signup-input-container user-signup-two-inputs'>
                                <TextField sx={{
                                    width: '50%',
                                    "& label.Mui-focused": {
                                        color: fNameErrorText.length > 1 ? "red" : "#0b5715"
                                    },
                                    "& .MuiOutlinedInput-root": {
                                        '&.Mui-focused fieldset': {
                                            borderColor: fNameErrorText.length > 1 ? "red" : "#0b5715",
                                        },
                                        color: '#0b5715',
                                        margin: 0,
                                        padding: 0
                                    },
                                    "& .MuiFormHelperText-root": {
                                        color: "red",
                                    },
                                }}
                                    inputRef={fNameValue}
                                    helperText={fNameErrorText}
                                    onChange={() => { (fNameErrorText.length > 1 || fNameValue.current.value.length === 0) && validateFName() }}
                                    label="First Name" variant="outlined" required focused placeholder='John' />
                                <TextField sx={{
                                    width: '50%',
                                    "& label.Mui-focused": {
                                        color: lNameErrorText.length > 1 ? "red" : "#0b5715"
                                    },
                                    "& .MuiOutlinedInput-root": {
                                        '&.Mui-focused fieldset': {
                                            borderColor: lNameErrorText.length > 1 ? "red" : "#0b5715",
                                        },
                                        color: '#0b5715',
                                        margin: 0,
                                        padding: 0
                                    },
                                    "& .MuiFormHelperText-root": {
                                        color: "red",
                                    },
                                }}
                                    inputRef={lNameValue}
                                    helperText={lNameErrorText}
                                    onChange={() => { (lNameErrorText.length > 1 || lNameValue.current.value.length === 0) && validateLName() }}
                                    label="Last Name" variant="outlined" required focused placeholder='Doe' />
                            </div>
                            <div className='user-signup-input-container'>
                                <TextField sx={{
                                    "& label.Mui-focused": {
                                        color: emailErrorText.length > 1 ? "red" : "#0b5715"
                                    },
                                    "& .MuiOutlinedInput-root": {
                                        '&.Mui-focused fieldset': {
                                            borderColor: emailErrorText.length > 1 ? "red" : "#0b5715",
                                        },
                                        color: '#0b5715',
                                        margin: 0,
                                        padding: 0
                                    },
                                    "& .MuiFormHelperText-root": {
                                        color: "red",
                                    },
                                }}
                                    inputRef={emailValue}
                                    helperText={emailErrorText}
                                    onChange={() => { (emailErrorText.length > 1 || emailValue.current.value.length === 0) && validateEmail() }}
                                    label="Email" variant="outlined" required focused placeholder='example@mail.com' />
                            </div>
                            <div className='user-signup-input-container'>
                                <TextField sx={{
                                    "& label.Mui-focused": {
                                        color: passErrorText.length > 1 ? "red" : "#0b5715"
                                    },
                                    "& .MuiOutlinedInput-root": {
                                        '&.Mui-focused fieldset': {
                                            borderColor: passErrorText.length > 1 ? "red" : "#0b5715",
                                        },
                                        color: '#0b5715'
                                    },
                                    "& .MuiFormHelperText-root": {
                                        color: "red",
                                    }
                                }}
                                    inputRef={passValue}
                                    helperText={passErrorText}
                                    onChange={() => { (passErrorText.length > 1 || passValue.current.value.length === 0) && validatePass() }}
                                    label="Password" variant="outlined" required type="password" focused placeholder='****************' />
                            </div>
                            <div className='user-signup-input-container'>
                                <PhoneInput
                                    placeholder="Enter phone number"
                                    defaultCountry='PS'
                                    international={true}
                                    withCountryCallingCode={true}
                                    value={phnValue}
                                    onChange={setPhnValue} />
                                <div className='phn-error-text'>{phnErrorText}</div>
                            </div>
                            <div className="user-signup-input-container flex-row align-items-center justify-content-between">
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
                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center"
                            }}>
                                {(!processing &&
                                    <Button sx={{
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
                                        variant="contained" type='button' onClick={() => { handleSignUp() }}>Sign Up</Button>)}
                                {(processing && <Button disabled sx={{
                                    height: 40,
                                    color: "black",
                                    borderColor: "#0b5715",
                                    borderRadius: 3,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    bgcolor: '#0b5715',
                                    ':hover': {
                                        bgcolor: '#449933',
                                        color: 'black',
                                    },
                                }}
                                    variant="contained" type='submit'><span className="pe-2"><LoadingSpinner /></span>Creating ccount</Button>)}
                            </div>
                        </form>
                    </div>
                </div>
            </div >
        </>
    );
}