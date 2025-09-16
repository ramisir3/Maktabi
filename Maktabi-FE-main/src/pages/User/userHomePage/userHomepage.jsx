import { useNavigate } from "react-router-dom";
import { useUser } from "../../../scripts/customHooks"
import logo from '../../../images/logo-no-background-white.png'
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { useEffect, useState } from "react";
import { Button, Tooltip } from "@mui/material";
import { getTokenFromLocalStorage, userLogout } from "../../../scripts/common";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getUserAvatarById, getUserBookings, getWorkspaceAvatarById, logoutUser, searchUserWorkspaces, unsubscribeUserFromWorkspace } from "../../../scripts/APIs";
import stock from '../../../images/moscow-russia-january-sdeskStock.jpg'
import './userHomepage.css'
import CustomSchedule from "../../../components/customSchedule/customShedule";
import ViewBookingsModal from "../../../components/modals/viewBookingsModal";
import { Input } from "reactstrap";


export default function UserHomepage(props) {
    const { user, authenticated } = useUser();
    const navigate = useNavigate();
    const [drawerState, setDrawerState] = useState(false);
    const [workspaceList, setWorkspaceList] = useState([])
    const [filteredWorkspacesList, setFilteredWorkspacesList] = useState([])
    const [modalView, setModalView] = useState(<></>)
    const [modalWorkspace, setModalWorkspace] = useState({});
    const [userAvatar, setUserAvatar] = useState(undefined)
    let bookings = []
    let searchText = ''


    useEffect(() => {
        if (user) {
            async function setUser() {
                await getUserAvatarById(user._id).then(async (avatar) => {
                    if (avatar.data.size != 0) {
                        setUserAvatar(avatar.data)
                    }
                    for (let i in user.workspaces) {
                        await getWorkspaceAvatarById(user.workspaces[i]._id).then((ws_avatar) => {
                            if (ws_avatar.data.size > 0) {
                                user.workspaces[i].avatar = ws_avatar.data
                            }
                        })
                    }
                    setFilteredWorkspacesList(user.workspaces)
                    setWorkspaceList(user.workspaces);
                })
            }
            setUser()
        }
    }, [user])

    useEffect(() => {
        console.log(user, workspaceList)
    }, [workspaceList.length])

    useEffect(() => {
        console.log('test')
        console.log(modalWorkspace)
        setModalView(<>
            {modalWorkspace.futureBookings && <ViewBookingsModal isOpen={modalWorkspace.futureBookings ? true : false} title="Upcoming Bookings"
                isPast={false} user={user} modalResult={bookingsModalClosed}
            ></ViewBookingsModal >}
            {modalWorkspace.pastBookings && <ViewBookingsModal isOpen={modalWorkspace.pastBookings ? true : false} title="Past Bookings"
                isPast={true} user={user} modalResult={bookingsModalClosed}
            ></ViewBookingsModal >}
        </>
        )

    }, [modalWorkspace])

    function bookingsModalClosed(res) {
        setModalWorkspace({})
    }

    async function search() {
        console.log(searchText)
        try {
            if (searchText == '') {
                setFilteredWorkspacesList(workspaceList)
            } else {
                await searchUserWorkspaces(user._id, searchText).then(async (res) => {
                    for (let i in res.data) {
                        await getWorkspaceAvatarById(res.data[i]._id).then((ws_avatar) => {
                            if (ws_avatar.data.size > 0) {
                                res.data[i].avatar = ws_avatar.data
                            }
                        })
                    }
                    setFilteredWorkspacesList(res.data)
                })
            }
        } catch (err) {
            console.log(err)
        }
    }

    function openModal(modalName) {
        console.log(modalName)
        switch (modalName) {
            case "past_bookings":
                setModalWorkspace({
                    pastBookings: true
                });
                return;
            case "future_bookings":
                setModalWorkspace({
                    futureBookings: true,
                });
                return;
        }
    }


    const toggleDrawer = (state) => (event) => {
        if (
            event &&
            event.type === 'keydown' &&
            (event.key === 'Tab' || event.key === 'Shift')
        ) {
            return;
        }
        setDrawerState(state);
    }

    async function getBookings() {
        return new Promise(async (res) => {
            await getUserBookings(user._id).then((books) => {
                books = books.data;
                for (let i in books) {
                    books[i].event_id = books[i]._id
                    books[i].color = '#449933';
                    books[i].start = new Date(books[i].start)
                    books[i].end = new Date(books[i].end)
                }
                bookings = books
                res(bookings);
            })
        });
    }

    async function logout() {
        let token = getTokenFromLocalStorage();
        try {
            await logoutUser(token);
            navigate('/login')
        } catch (err) {
            console.log(err)
        }
    }

    return (<>
        <ToastContainer />
        {user &&
            <>
                {modalView}
                <header>
                    <div className='admin-header-conntainer'>
                        <div className="ws-admin-header-sub">
                            <i class="fa-solid fa-bars ws-admin-bars" onClick={toggleDrawer(true)}></i>
                            <img src={logo} alt="maktabi" className='ws-admin-header-logo' />
                        </div>
                        <div className="ws-admin-user-chip">
                            <div className="ws-admin-user-image d-flex justify-content-center align-items-center flex-shrink-0">
                                {userAvatar && <img src={URL.createObjectURL(userAvatar)} className="admin-avatar" />}
                                {!userAvatar && <i className='fa fa-user' />}
                            </div>
                            <span className="ms-3 text-cut">{user ? user.firstName + " " + user.lastName : ""}</span>
                        </div>
                    </div>
                </header >
                <SwipeableDrawer
                    open={drawerState}
                    onClose={toggleDrawer(false)}
                    onOpen={toggleDrawer(true)}>
                    <div className="ws-admin-sidebar">
                        <section>
                            <h4>My Workspaces</h4>
                            <div className='ws-admin-sidebar-ws-list'>
                                {workspaceList && workspaceList.length > 0 &&
                                    <div>
                                        <Input type="search" placeholder="Search for workspace" onChange={(e) => { searchText = e.target.value; search() }}></Input>
                                    </div>}
                                {filteredWorkspacesList && filteredWorkspacesList.length > 0 && filteredWorkspacesList.map(ws => {
                                    return <div className="ws-admin-sidebar-ws justify-content-start" onClick={() => { navigate('/user/workspace/info', { state: { 'user': user, 'userAvatar': userAvatar, 'workspace': ws } }) }}>
                                        <img src={ws.avatar && URL.createObjectURL(ws.avatar) || stock} className="ws-image-sidebar" />
                                        <div className="text-cut">
                                            {ws.name}
                                        </div>
                                    </div>
                                })}

                                {(!workspaceList || workspaceList.length < 1) && <div>You have no workspaces. Subscribe to a workspace to start booking.</div>}
                            </div>
                        </section>
                        <section className="d-flex flex-column g-2">
                            <Button variant="contained" sx={{
                                color: "white",
                                borderColor: "#0b5715",
                                borderRadius: 3,
                                textTransform: 'none',
                                fontWeight: 600,
                                bgcolor: '#0b5715',
                                marginTop: 1,
                                ':hover': {
                                    bgcolor: '#449933',
                                    color: 'white',
                                },
                            }}
                                onClick={() => { toggleDrawer(false); navigate('/user/workspaces/browse', { state: { 'user': user, 'userAvatar': userAvatar } }) }}>Browse Workspaces</Button>
                            <Button variant="contained" sx={{
                                color: "white",
                                borderColor: "#0b5715",
                                borderRadius: 3,
                                textTransform: 'none',
                                fontWeight: 600,
                                bgcolor: '#0b5715',
                                marginTop: 1,
                                ':hover': {
                                    bgcolor: '#449933',
                                    color: 'white',
                                },
                            }}
                                onClick={() => { toggleDrawer(false); }}>
                                Settings</Button>
                            <Button variant="contained" sx={{
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
                                marginTop: 1,
                            }}
                                onClick={() => { logout() }}
                            >Log out</Button>
                        </section>
                    </div>
                </SwipeableDrawer>
                <div className="ms-5 mt-5 ps-5 pt-5 dark-green">
                    <h1 className='bold'>Welcome {user.firstName}</h1>
                    <h3>here is your schedule for the day. Have a great day!</h3>
                </div>
                <div className="d-flex justify-content-center gap-4 mt-5">
                    <Button variant="contained" sx={{
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
                        marginTop: 1,
                    }}
                        onClick={() => { openModal('past_bookings') }}
                    >Past Bookings</Button>

                    <Button variant="contained" sx={{
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
                        marginTop: 1,
                    }}
                        onClick={() => { openModal('future_bookings') }}
                    >Future Bookings</Button>
                </div>
                <div className="mx-5 px-5">
                    <CustomSchedule viewOnly={true} userId={user._id} fetchEvents={getBookings}></CustomSchedule>
                </div>
            </>}
    </>)
}


var EVENTS = [
    {
        event_id: 1,
        title: "Event 1",
        start: new Date(new Date(new Date().setHours(9)).setMinutes(0)),
        end: new Date(new Date(new Date().setHours(10)).setMinutes(0)),
        disabled: true,
        admin_id: [1, 2, 3, 4]
    },
    {
        event_id: 2,
        title: "Event 2",
        start: new Date(new Date(new Date().setHours(10)).setMinutes(0)),
        end: new Date(new Date(new Date().setHours(12)).setMinutes(0)),
        admin_id: 2,
        color: "#50b500"
    },
    {
        event_id: 3,
        title: "Event 3",
        start: new Date(new Date(new Date().setHours(11)).setMinutes(0)),
        end: new Date(new Date(new Date().setHours(12)).setMinutes(0)),
        admin_id: 1,
        editable: false,
        deletable: false
    },
    {
        event_id: 4,
        title: "Event 4",
        start: new Date(
            new Date(new Date(new Date().setHours(9)).setMinutes(30)).setDate(
                new Date().getDate() - 2
            )
        ),
        end: new Date(
            new Date(new Date(new Date().setHours(11)).setMinutes(0)).setDate(
                new Date().getDate() - 2
            )
        ),
        admin_id: 2,
        color: "#900000"
    },
    {
        event_id: 5,
        title: "Event 5",
        start: new Date(
            new Date(new Date(new Date().setHours(10)).setMinutes(30)).setDate(
                new Date().getDate() - 2
            )
        ),
        end: new Date(
            new Date(new Date(new Date().setHours(14)).setMinutes(0)).setDate(
                new Date().getDate() - 2
            )
        ),
        admin_id: 2,
        editable: true
    },
    {
        event_id: 6,
        title: "Event 6",
        start: new Date(
            new Date(new Date(new Date().setHours(10)).setMinutes(30)).setDate(
                new Date().getDate() - 4
            )
        ),
        end: new Date(new Date(new Date().setHours(14)).setMinutes(0)),
        admin_id: 2
    }
];

