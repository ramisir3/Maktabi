import { Button, TextField } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../../images/logo-no-background.png'
import '../../login/login.css'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import LoadingSpinner from '../../../components/loadingSpinner/spinner';
import { adminSignIn } from '../../../scripts/APIs';
import { storeAdminTokenInLocalStorage } from '../../../scripts/common';

export default function AdminLogin(props) {
    const navigate = useNavigate();

    const [emailErrorText, setEmailErrorText] = useState(" ");
    const [passErrorText, setPassErrorText] = useState(" ");
    const [wrongCredentialsErrorMsg, setWrongCredentialsErrorMsg] = useState(" ");
    const [processing, setProcessing] = useState(false);

    const emailValue = useRef('');
    const passValue = useRef('');

    let passError = false;
    let emailError = false;

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
    async function handleLogin() {
        setProcessing(true);
        validateEmail();
        validatePass();
        if (!passError && !emailError) {
            try {
                const response = await adminSignIn(emailValue.current.value, passValue.current.value);
                if (!response?.data?.token) {
                    console.log(response.response.status)
                    setWrongCredentialsErrorMsg('Server error. Try again later.');
                    return;
                }
                storeAdminTokenInLocalStorage(response.data.token);
                emailValue.current.value = "";
                passValue.current.value = "";
                setWrongCredentialsErrorMsg(" ");
                navigate('/maktabi-admin')
            }
            catch (err) {
                console.log('Some error occured during signing in: ', err);
                if (err.response?.status) {
                    switch (err.response.status) {
                        case 400:
                            setWrongCredentialsErrorMsg('Wrong email or password');
                            break;
                        default:
                            setWrongCredentialsErrorMsg('Server error. Try again later.');
                    }
                } else {
                    setWrongCredentialsErrorMsg('Server error. Try again later.');
                }
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
                handleLogin();
            }
        };

        document.addEventListener('keydown', keyDownHandler);

        return () => {
            document.removeEventListener('keydown', keyDownHandler);
        };
    }, []);
    return (
        <>
            <div className="full-page-bg login-fill">
                <div className='login-box d-flex flex-column justify-content-center h-100'>
                    <img className="login-logo" src={Logo} alt="Logo" />
                    <h3 className='dark-green pt-5'>Admin Login</h3>
                    <div className="login-form">
                        <form>
                            <div className='login-input-container'>
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
                            <div className='login-input-container'>
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
                                <span className='cred-error'>{wrongCredentialsErrorMsg}</span>
                            </div>
                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center"
                            }}>
                                {(!processing && <Button sx={{
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
                                    variant="contained" type='submit' onClick={() => { handleLogin() }}>Log in</Button>)}
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
                                    variant="contained" type='submit'><span className="pe-2"><LoadingSpinner /></span>Logging in</Button>)}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}