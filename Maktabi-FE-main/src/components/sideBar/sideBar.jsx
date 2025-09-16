import { Button, Divider } from "@mui/material";
import { Nav, NavItem } from "reactstrap"
import logo from '../../images/logo-no-background-white.png'
import "./sideBar.css"
import { adminLogout, getAdminTokenFromLocalStorage } from "../../scripts/common";
import { useNavigate } from "react-router-dom";

export default function SideBar(props) {
    const navigate = useNavigate();

    async function logout() {
        try {
            let token = getAdminTokenFromLocalStorage();
            await adminLogout(token);
            navigate('/admin/login')
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <span>
                    <img src={logo} alt="maktabi" className='admin-header-logo' />
                </span>
            </div>
            <Divider className="w-100" />
            <div className="sidebar-menu w-100">
                <Nav vertical className="pb-3">
                    <NavItem>
                        <Button variant="contained" className="w-100"
                            sx={{
                                backgroundColor: props.content == "workspaces" ? "#0b5715" : "#449933",
                                boxShadow: "none",
                                borderRadius: 0,
                                '&:hover': {
                                    boxShadow: "none",
                                    backgroundColor: "#0b5715",
                                    borderRadius: 0
                                }
                            }}
                            onClick={() => { props.changeContentType("workspaces") }}
                        >Workspaces</Button>
                    </NavItem>
                    <NavItem>
                        <Button variant="contained" className="w-100"
                            sx={{
                                backgroundColor: props.content == "users" ? "#0b5715" : "#449933",
                                boxShadow: "none",
                                borderRadius: 0,
                                '&:hover': {
                                    boxShadow: "none",
                                    backgroundColor: "#0b5715",
                                    borderRadius: 0
                                }
                            }}
                            onClick={() => { props.changeContentType("users") }}
                        >Users</Button>
                    </NavItem>
                </Nav>
            </div>
            <Divider className="w-100" />
            <div className="admin-logout">
                <Button variant="contained"
                    sx={{
                        backgroundColor: "#0b5715",
                        '&:hover': {
                            backgroundColor: "#0b5715",
                        }
                    }}
                    onClick={() => { logout() }}>Logout</Button>
            </div>
        </div>
    );
}