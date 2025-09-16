import { useNavigate } from "react-router-dom";
import { useUser } from "../../../scripts/customHooks"
import logo from '../../../images/logo-no-background-white.png'
import './adminDashboard.css'
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { Fragment, useEffect, useState } from "react";
import { Button } from "@mui/material";
import stock from '../../../images/moscow-russia-january-sdeskStock.jpg'
import { Stage, Layer, Image } from 'react-konva';
import useImage from "use-image";
import singleDesk from '../../../images/single-desk.svg';
import multiDesk from '../../../images/multi-desk.svg';
import meetingRoom from '../../../images/meeting-room.svg';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { getTokenFromLocalStorage, userLogout } from "../../../scripts/common";
import { getDesksByWorkspaceId, getFloorImage, getUserAvatarById, getWorkspaceAvatarById, getWorkspaceById, logoutUser } from "../../../scripts/APIs";
import { Input } from "reactstrap";
import ManageWorkspaceModal from "../../../components/modals/manageWorkspaceModal";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ManageWSUsersModal from "../../../components/modals/manageWSUsersModal";
import ManageUserWSModal from "../../../components/modals/unmanageWorkspacesModal";
import ManageWSAdminsModal from "../../../components/modals/manageWSAdminsModal";
import ManageUserModal from "../../../components/modals/manageUserModal";
import DeskInfoModal from "../../../components/modals/deskModals/deskInfoModal";
import ViewWSBookingsModal from "../../../components/modals/workspaceBookingsModal";



const canvasWidth = 1280;
const canvasHeight = 720;


const desksImagesMap = {
    'FIXED_SINGLE_DESK': singleDesk,
    'FLEXIBLE_SINGLE_DESK': singleDesk,
    'MEETING_ROOM': meetingRoom
}

const CanvasBackground = (props) => {
    const image = new window.Image();
    image.src = props.img;
    return <Image width={canvasWidth} height={canvasHeight} image={image} />;
};

const DeskImage = (props) => {
    const desk = props.desk;
    let width = props.width ? props.width : (desk.type == 'MULTI_DESK' ? 110 : 70);
    let height = props.width ? props.width : (desk.type == 'MEETING_ROOM' ? 90 : 70);
    const image = new window.Image();
    image.src = props.image;
    return <>
        <Fragment>
            <Image width={width} height={height} onClick={props.onClick}
                image={image} x={desk.x} y={desk.y} scaleX={desk.scaleX ? desk.scaleX : 1}
                scaleY={desk.scaleY ? desk.scaleY : 1} rotation={desk.rotation ? desk.rotation : 0} />
        </Fragment>
    </>
}

export default function WorkspaceAdmin() {
    const { user, authenticated } = useUser();
    const navigate = useNavigate();
    const [drawerState, setDrawerState] = useState(false);
    const [workspaceList, setWorkspaceList] = useState([])
    const [currentWorkspace, setCurrentWorkspace] = useState({});
    const [loading, setLoading] = useState(true)
    const [modalWorkspace, setModalWorkspace] = useState({});
    const [modalView, setModalView] = useState();
    const [reload, setReload] = useState(false)
    const [currentFloor, setCurrentFloor] = useState({})
    const [userAvatar, setUserAvatar] = useState(null)
    const [desks, setDesks] = useState([])


    useEffect(() => {
        setLoading(true)
    }, [])

    useEffect(() => {
        if (user) {
            async function getAvatar() {
                await getUserAvatarById(user._id).then((avatar) => {
                    if (avatar.data.size != 0) {
                        setUserAvatar(avatar.data)
                    }
                })
            }
            async function filterWs(list) {
                let filtered = [];
                for (let i in list) {
                    let ws = list[i];
                    await getWorkspaceById(ws._id).then(async (res) => {
                        await getWorkspaceAvatarById(ws._id).then((avatar) => {
                            console.log(avatar)
                            if (avatar.data.size > 0) {
                                res.data.avatar = avatar.data
                            }
                            if (res.data.active) {
                                filtered.push(res.data)
                            }
                        })
                    })
                }
                setWorkspaceList(filtered);
                if (filtered.length > 0) {
                    let cachedWS = localStorage.getItem('ws_' + user._id);
                    let selectedWorkspace = cachedWS ? filtered[filtered.findIndex((filterWS) => { return filterWS._id == cachedWS })] : filtered[0];
                    localStorage.setItem('ws_' + user._id, selectedWorkspace._id)
                    let floors = selectedWorkspace.floors;
                    for (let f in floors) {
                        let image = await getFloorImage(selectedWorkspace._id, f);
                        console.log(image)
                        if (image.data.size > 0) {
                            floors[f].image = image.data
                        } else {
                            floors[f].image = null;
                        }
                    }
                    await getDesksByWorkspaceId(selectedWorkspace._id).then(async (DESKS) => {
                        DESKS = DESKS.data
                        for (let i in DESKS) {
                            DESKS[i].id = i;
                            DESKS[i].type = DESKS[i].deskType;
                        }
                        setDesks(DESKS)
                    })
                    setCurrentFloor(floors && floors.length > 0 && floors[0] || null)
                    selectedWorkspace.floors = floors;
                    setCurrentWorkspace(selectedWorkspace)
                } else {
                    setCurrentWorkspace(null)
                    setCurrentFloor(null)
                }
                setLoading(false)
            }
            getAvatar();
            filterWs(user.workspaces)
        }
    }, [user])


    useEffect(() => {
        console.log('test')
        console.log(modalWorkspace)
        setModalView(<>
            {modalWorkspace.create && <ManageWorkspaceModal isOpen={modalWorkspace.create ? true : false} title="Create Workspace"
                modalResult={confirmCreation} mode={"create"} active={false} primaryAdmin={user}
            ></ManageWorkspaceModal >}
            {modalWorkspace.editWorkspace && <ManageWorkspaceModal isOpen={modalWorkspace.editWorkspace ? true : false} title="Edit Workspace Info"
                modalResult={confirmWorkspaceEdit} mode={"edit"} workspaceId={modalWorkspace.workspaceID}
                workspaceName={modalWorkspace.workspaceName} isAdmin={false}
            ></ManageWorkspaceModal >}
            {modalWorkspace.manageUsers && <ManageWSUsersModal isOpen={modalWorkspace.manageUsers ? true : false} title="Manage Workspace Users"
                modalResult={confirmUsersEdits} workspaceId={modalWorkspace.workspaceID}
            ></ManageWSUsersModal>}
            {modalWorkspace.manageAdmins && <ManageWSAdminsModal isOpen={modalWorkspace.manageAdmins ? true : false} title="Manage Workspace Admins"
                modalResult={confirmAdminsEdits} workspaceId={modalWorkspace.workspaceID}
            ></ManageWSAdminsModal>}
            {modalWorkspace.unmanage && <ManageUserWSModal isOpen={modalWorkspace.unmanage ? true : false} title="Manage Workspace Users"
                modalResult={confirmWorkspacesEdits} userId={modalWorkspace.userId}
            ></ManageUserWSModal>}
            {modalWorkspace.editProfile && <ManageUserModal isOpen={modalWorkspace.editProfile ? true : false} title="Edit Profile"
                modalResult={confirmProfileEdits} userID={modalWorkspace.userId} mode={"edit"} isAdmin={false}
            ></ManageUserModal>}
            {modalWorkspace.deskInfo && <DeskInfoModal isOpen={modalWorkspace.deskInfo ? true : false} title="Desk Info"
                desk={modalWorkspace.desk} view={true} modalResult={closeInfoModal}></DeskInfoModal>}
            {modalWorkspace.bookings && <ViewWSBookingsModal isOpen={modalWorkspace.bookings ? true : false} title="View Bookings"
                workspace={modalWorkspace.workspace} modalResult={closeInfoModal}></ViewWSBookingsModal>}
        </>
        )

    }, [modalWorkspace])

    function closeInfoModal(result) {
        setModalWorkspace({})
    }

    function confirmCreation(result) {
        if (result) {
            toast.success("Created " + result.workspace.name + " Workspace, wait for an admin activation");
        }
        setModalWorkspace({});
    }

    function confirmUsersEdits(result) {
        if (result) {
            toast.success("Edited users list successfully");
        }
        setModalWorkspace({});
    }

    function confirmAdminsEdits(result) {
        if (result) {
            toast.success("Edited admins list successfully");
        }
        setModalWorkspace({});
    }

    function confirmWorkspaceEdit(result) {
        if (result) {
            toast.success("Work space edited successfully");
        }
        setModalWorkspace({});
    }

    function confirmProfileEdits(result) {
        if (result) {
            toast.success("Edited settings successfully");
        }
        setModalWorkspace({});
    }

    function confirmWorkspacesEdits(result) {
        if (result) {
            toast.success("Edited workspaces list successfully");
        }
        setModalWorkspace({});
        setReload((prev) => !prev)
    }

    // if (!user || !authenticated) {
    //     navigate('/login');
    //     return;
    // } else if (user.role == 'basic') {
    //     navigate('/');
    //     return;
    // }

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

    async function changeWorkspace(ws) {
        setLoading(true)
        await getWorkspaceById(ws._id).then(async (res) => {
            res.data.id = res.data._id;
            localStorage.setItem('ws_' + user._id, res.data._id)
            let floors = res.data.floors;
            for (let f in floors) {
                let image = await getFloorImage(ws._id, f);
                console.log(image)
                if (image.data.size > 0) {
                    floors[f].image = image.data
                } else {
                    floors[f].image = null;
                }
            }
            setCurrentFloor(floors[0])
            res.data.floors = floors;
            setCurrentWorkspace(res.data);
            setDrawerState(false);
            setLoading(false)
        })
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

    async function changeFloor(floor) {
        console.log(floor, currentWorkspace.floors)
        setCurrentFloor(currentWorkspace.floors[floor - 1])
    }

    function openModal(modalName, workspaceId, workspaceName) {
        console.log(modalName)
        switch (modalName) {
            case "create_workspace":
                setModalWorkspace({
                    create: true
                });
                return;
            case "manage_ws_users":
                setModalWorkspace({
                    manageUsers: true,
                    workspaceID: workspaceId
                });
                return;
            case "manage_ws_admins":
                setModalWorkspace({
                    manageAdmins: true,
                    workspaceID: workspaceId
                });
                return;
            case 'unmanage_workspaces':
                setModalWorkspace({
                    unmanage: true,
                    userId: user._id
                });
                return;
            case 'edit_user_settings':
                setModalWorkspace({
                    editProfile: true,
                    userId: user._id
                });
                return;
            case 'edit_ws_info':
                setModalWorkspace({
                    editWorkspace: true,
                    workspaceID: workspaceId,
                    workspaceName: workspaceName,
                })
                return;
            case 'desk_info_modal':
                let desk = desks.find((d) => {
                    return workspaceId == d._id
                })
                setModalWorkspace({
                    deskInfo: true,
                    desk: desk
                })
                return;
            case 'booking_modal':
                setModalWorkspace({
                    bookings: true,
                    workspace: currentWorkspace
                })
                return;
        }

    }

    return (
        <>
            {!loading && (
                <>
                    {modalView}
                    < ToastContainer />
                    <header>
                        <div className='admin-header-conntainer'>
                            <div className="ws-admin-header-sub">
                                <i class="fa-solid fa-bars ws-admin-bars" onClick={toggleDrawer(true)}></i>
                                <img src={logo} alt="maktabi" className='ws-admin-header-logo' />
                            </div>
                            <div className="ws-admin-user-chip gap-2">
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
                                    {workspaceList && workspaceList.length > 0 && workspaceList.map(ws => {
                                        return <div className="ws-admin-sidebar-ws text-cut" onClick={() => { changeWorkspace(ws) }}>
                                            <img src={ws.avatar && URL.createObjectURL(ws.avatar) || stock} className="ws-image-sidebar" />
                                            {ws.name}
                                        </div>
                                    })}

                                    {(!workspaceList || workspaceList.length < 1) && <div>You have no active workspaces. Create a workspace to start managing.</div>}
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
                                    ':hover': {
                                        bgcolor: '#449933',
                                        color: 'white',
                                    },
                                }}
                                    onClick={() => { toggleDrawer(false); openModal('create_workspace'); }}
                                    endIcon={<AddCircleIcon />}>Create Workspace</Button>
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
                                    onClick={() => { toggleDrawer(false); openModal('unmanage_workspaces'); }}>Unmanage Workspaces</Button>
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
                                    onClick={() => { toggleDrawer(false); openModal('edit_user_settings'); }}>
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
                    <main className="p-5">
                        {currentWorkspace &&
                            <>
                                <div className="d-flex justify-content-between align-items-center mb-5 mx-5">
                                    <div className="dark-green">
                                        <h1>
                                            {currentWorkspace && currentWorkspace.name}
                                        </h1>
                                        <h3>
                                            {currentWorkspace.location.address + ", " + currentWorkspace.location.city}
                                        </h3>
                                    </div>
                                    <div>
                                        <img src={currentWorkspace.avatar && URL.createObjectURL(currentWorkspace.avatar) || stock} className="ws-info-image" />
                                    </div>
                                </div>
                                <section className="ws-admin-options">
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
                                    }}
                                        onClick={() => { openModal('edit_ws_info', currentWorkspace._id); }}
                                    >Edit workspace info</Button>
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
                                    }}
                                        onClick={() => { openModal('manage_ws_users', currentWorkspace._id); }}
                                    >Manage workspace users</Button>
                                    {(user._id == currentWorkspace.primaryAdmin._id) &&
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
                                        }}
                                            onClick={() => { openModal('manage_ws_admins', currentWorkspace._id); }}
                                        >Manage workspace admins</Button>}
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
                                    }}
                                        onClick={() => { navigate('/configure?id=' + currentWorkspace._id); window.location.reload(false); }}
                                    >Edit workspace configuration</Button>
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
                                    }} onClick={() => { openModal('booking_modal') }}>See all workspace bookings</Button>
                                    <div>
                                        <Input
                                            id="floorSelect"
                                            name="floorSelect"
                                            type="select"
                                            onChange={(e) => { changeFloor(e.target.value) }}
                                        >
                                            {currentWorkspace && currentWorkspace.floors &&
                                                currentWorkspace.floors.map((floor) => {
                                                    return <option value={floor.floorNumber}>
                                                        floor {floor.floorNumber}
                                                    </option>
                                                })
                                            }
                                        </Input>
                                    </div>
                                </section>
                                <section className="d-flex justify-content-center align-items-center">

                                    {currentFloor && currentFloor.image && <Stage width={canvasWidth} height={canvasHeight}>
                                        <Layer>
                                            {currentFloor.image && <CanvasBackground img={URL.createObjectURL(currentFloor.image)}></CanvasBackground>}
                                        </Layer>
                                        <Layer>
                                            {desks.map((desk, i) => {
                                                if (desk.floor == currentFloor.floorNumber) {
                                                    let image = desksImagesMap[desk.type]
                                                    return <DeskImage desk={desk}
                                                        image={image}
                                                        key={i}
                                                        onClick={() => openModal('desk_info_modal', desk._id)} />
                                                }
                                                return null
                                            })}
                                        </Layer>
                                    </Stage>}
                                    {(!currentFloor || !currentFloor.image) && <h1 className="mt-5 pt-5 dark-green">Go to edit workspace configuration to upload a floor plan and start working!</h1>}
                                </section>
                            </>
                        }
                        {!currentWorkspace &&
                            <>
                                <h1 className="dark-green">You don't manage any workspaces. Create a workspace to start managing.</h1>
                            </>}
                    </main>
                </>
            )}
        </>
    )
}
