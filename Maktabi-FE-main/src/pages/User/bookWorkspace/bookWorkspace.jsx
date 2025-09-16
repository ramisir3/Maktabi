import { useLocation, useNavigate } from "react-router-dom";
import logo from '../../../images/logo-no-background-white.png'
import { Button } from "@mui/material"
import stock from '../../../images/moscow-russia-january-sdeskStock.jpg'
import { Input } from "reactstrap";
import { Fragment, useEffect, useState } from "react";
import { Stage, Layer, Image } from 'react-konva';

import singleDesk from '../../../images/single-desk.svg';
import meetingRoom from '../../../images/meeting-room.svg';
import { getDesksByWorkspaceId, getFloorImage } from "../../../scripts/APIs";
import BookWorkspaceDeskModal from "../../../components/modals/bookWorkspaceDeskModal";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


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


export default function BookWorkspace(props) {
    const navigate = useNavigate()
    const state = useLocation();
    const { user, userAvatar, workspace } = state.state
    const [currentFloor, setCurrentFloor] = useState({})
    const [desks, setDesks] = useState([])
    const [modalWorkspace, setModalWorkspace] = useState({});
    const [modalView, setModalView] = useState();

    useEffect(() => {
        async function getWSFullInfo() {
            let floors = workspace.floors;
            for (let f in floors) {
                let image = await getFloorImage(workspace._id, f);
                console.log(image)
                if (image.data.size > 0) {
                    floors[f].image = image.data
                } else {
                    floors[f].image = null;
                }
            }
            await getDesksByWorkspaceId(workspace._id).then(async (DESKS) => {
                DESKS = DESKS.data
                for (let i in DESKS) {
                    DESKS[i].id = i;
                    DESKS[i].type = DESKS[i].deskType;
                }
                setDesks(DESKS)
            })
            setCurrentFloor(floors && floors.length > 0 && floors[0] || null)
            workspace.floors = floors;
        }
        console.log(workspace)
        getWSFullInfo()
    }, [])

    useEffect(() => {
        console.log(currentFloor)
    }, [currentFloor])

    useEffect(() => {
        console.log(modalWorkspace)
        setModalView(<>
            {modalWorkspace.bookDesk && <BookWorkspaceDeskModal isOpen={modalWorkspace.bookDesk ? true : false} title="Book Desk"
                desk={modalWorkspace.desk} user={modalWorkspace.user} modalResult={confirmBooking}></BookWorkspaceDeskModal>}
        </>
        )

    }, [modalWorkspace])

    function confirmBooking(result) {
        if (result) {
            toast.success('Booked successfully.')
        }
        setModalWorkspace({})
    }

    async function changeFloor(floor) {
        setCurrentFloor(workspace.floors[floor - 1])
    }

    function openModal(modalName, desk, user) {
        switch (modalName) {
            case 'book_desk_modal':
                setModalWorkspace({
                    bookDesk: true,
                    desk: desk,
                    user: user
                })
                return;
        }
    }

    return (<>
        {modalView}
        < ToastContainer />
        <header>
            <div className='admin-header-conntainer'>
                <div className="ws-admin-header-sub">
                    <img src={logo} alt="maktabi" className='ws-admin-header-logo' />
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
                        onClick={() => { navigate(-1) }}
                    >Go Back</Button>
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
        <div className="d-flex justify-content-between align-items-center mb-5 mx-5 mt-5 pt-2 px-5">
            <div className="dark-green">
                <h1>
                    {workspace && workspace.name}
                </h1>
                <h3>
                    {workspace.location.address + ", " + workspace.location.city}
                </h3>
            </div>
            <div>
                <img src={workspace.avatar && URL.createObjectURL(workspace.avatar) || stock} className="ws-info-image" />
            </div>
        </div>
        <div className="d-flex justify-content-center">
            <Input
                id="floorSelect"
                name="floorSelect"
                type="select"
                className="w-25"
                onChange={(e) => { changeFloor(e.target.value) }}
            >
                {workspace && workspace.floors &&
                    workspace.floors.map((floor) => {
                        return <option value={floor.floorNumber}>
                            floor {floor.floorNumber}
                        </option>
                    })
                }
            </Input>
        </div>
        <div className="d-flex justify-content-center align-items-center mt-4">
            {currentFloor && currentFloor.image && <Stage width={canvasWidth} height={canvasHeight}>
                <Layer>
                    {currentFloor.image && <CanvasBackground img={URL.createObjectURL(currentFloor.image)}></CanvasBackground>}
                </Layer>
                <Layer>
                    {desks.map((desk, i) => {
                        if (desk.floor == currentFloor.floorNumber && desk.deskType != 'FIXED_SINGLE_DESK') {
                            let image = desksImagesMap[desk.type]
                            return <DeskImage desk={desk}
                                image={image}
                                key={i}
                                onClick={() => { openModal('book_desk_modal', desk, user) }} />
                        }
                        return null
                    })}
                </Layer>
            </Stage>}
            {!currentFloor.image && <h4 className="dark-green">The workspace has not set up this floor yet.</h4>}
        </div>
    </>)
}