import { Button, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../images/logo-no-background.png'
import './header.css'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export default function Header(props) {
    const navigate = useNavigate()
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    function signUpRedirect(role) {
        handleClose();
        if (role == 'user') {
            navigate('/signup/user')
        } else {
            navigate('/signup/user?type=admin')
        }
    };

    return (
        <div className="header">
            <span className='header-container'>
                <img src={logo} alt="maktabi" className='header-logo' onClick={() => props.onTabChange("Home")} />
            </span>
            <span className='tabs'>
                <button className='tab-button' onClick={() => { props.onTabChange("Home") }}>
                    Home
                </button>
                <button className='tab-button' onClick={() => { props.onTabChange("Features") }}>
                    Features
                </button>
                <button className='tab-button' onClick={() => { props.onTabChange("Pricing") }}>
                    Pricing
                </button>
                <button className='tab-button' onClick={() => { props.onTabChange("About") }}>
                    About Us
                </button>
            </span>
            <span className='button-group'>
                <Button sx={{
                    height: 40,
                    color: "#0b5715",
                    borderColor: "#0b5715",
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 600,
                    ':hover': {
                        bgcolor: '#449933',
                        color: 'white',
                    },
                }}
                    variant="outlined" color='primary' onClick={() => { navigate('/login') }}>Log in</Button>
                <Button sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    height: 40,
                    width: 125,
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
                    aria-controls={open ? 'basic-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    endIcon={<KeyboardArrowDownIcon />}
                    variant="contained" onClick={handleClick}>Sign up</Button>
                <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                    }}
                    sx={{
                        '& .MuiPaper-root': {
                            borderRadius: 3,
                        },
                    }}
                >
                    <MenuItem sx={{ color: '#0b5715' }} onClick={() => { signUpRedirect('user') }}>as user</MenuItem>
                    <MenuItem sx={{ color: '#0b5715' }} onClick={() => { signUpRedirect('workspace') }}>as workspace admin</MenuItem>
                </Menu>
            </span>
        </div>
    );
}