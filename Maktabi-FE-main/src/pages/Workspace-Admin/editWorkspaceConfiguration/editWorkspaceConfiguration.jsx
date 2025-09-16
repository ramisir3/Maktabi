import { Fragment, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { getDesksByWorkspaceId, getFloorImage, getWorkspaceById, updateFloorImageByWrokspaceId, updateWorkspaceDesksByWorkspaceId } from "../../../scripts/APIs";
import { Input } from "reactstrap";
import { Button } from "@mui/material";
import logo from '../../../images/logo-no-background-white.png'
import floorPlanSample from '../../../images/floor-plan.png'
import useImage from "use-image";
import singleDesk from '../../../images/single-desk.svg';
import multiDesk from '../../../images/multi-desk.svg';
import meetingRoom from '../../../images/meeting-room.svg';
import './editWorkspaceConfiguration.css'
import { Image, Layer, Stage, Transformer } from "react-konva";
import MultiDeskModal from "../../../components/modals/deskModals/multiDeskModal";
import SingleDeskModal from "../../../components/modals/deskModals/singleDeskModal";
import DeskInfoModal from "../../../components/modals/deskModals/deskInfoModal";
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
    const shapeRef = useRef();
    const trRef = useRef();
    useEffect(() => {
        if (props.isSelected) {
            // we need to attach transformer manually
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [props.isSelected]);



    const desk = props.desk;
    let width = props.width ? props.width : (desk.type == 'MULTI_DESK' ? 110 : 70);
    let height = props.width ? props.width : (desk.type == 'MEETING_ROOM' ? 90 : 70);
    const image = new window.Image();
    image.src = props.image;
    return <>
        <Fragment>
            <Image width={width} height={height} draggable
                onClick={props.onSelect}
                onTap={props.onSelect}
                ref={shapeRef}
                {...props.shapeProps}
                onDragEnd={(e) => {
                    props.onChange({
                        x: e.target.x(),
                        y: e.target.y(),
                        scaleX: e.target.scaleX(),
                        scaleY: e.target.scaleY(),
                        rotation: e.target.rotation(),
                    });
                }}
                onTransformEnd={(e) => {
                    // transformer is changing scale of the node
                    // and NOT its width or height
                    // but in the store we have only width and height
                    // to match the data better we will reset scale on transform end
                    const node = shapeRef.current;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();

                    props.onChange({
                        x: e.target.x(),
                        y: e.target.y(),
                        scaleX: scaleX,
                        scaleY: scaleY,
                        rotation: node.rotation(),
                    });
                }}
                // onDragStart={props.onDragStart}
                image={image} x={desk.x} y={desk.y} scaleX={desk.scaleX ? desk.scaleX : 1}
                scaleY={desk.scaleY ? desk.scaleY : 1} rotation={desk.rotation ? desk.rotation : 0} />
            {props.isSelected && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        // limit resize
                        if (newBox.width < 5 || newBox.height < 5) {
                            return oldBox;
                        }
                        return newBox;
                    }}
                />
            )}
        </Fragment>
    </>
}

export default function EditWorkspaceConfiguration(props) {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams();
    const [workspace, setWorkspace] = useState({})
    const [currentFloor, setCurrentFloor] = useState({})
    const [imageUploaded, setImageUploaded] = useState(false);
    const [selectedFile, setSelectedFile] = useState(undefined);
    const [desks, setDesks] = useState([])
    const [wsDesks, setWsDesks] = useState([])
    const [currentFloorDesks, setCurrentFloorDesks] = useState([])
    const [selectedId, selectShape] = useState(null);
    const [modalWorkspace, setModalWorkspace] = useState({});
    const [modalView, setModalView] = useState();


    useEffect(() => {
        async function getWSInfo() {
            try {
                await getWorkspaceById(searchParams.get('id')).then(async (res) => {
                    await getDesksByWorkspaceId(searchParams.get('id')).then(async (DESKS) => {
                        DESKS = DESKS.data
                        console.log(DESKS)
                        let floors = res.data.floors;
                        for (let f in floors) {
                            let image = await getFloorImage(searchParams.get('id'), f);
                            console.log(image)
                            if (image.data.size > 0) {
                                floors[f].image = image.data
                            } else {
                                floors[f].image = null;
                            }
                        }
                        setCurrentFloor(floors[0])
                        if (DESKS.length > 0) {
                            for (var i in DESKS) {
                                console.log(DESKS[i])
                                DESKS[i].id = i;
                                DESKS[i].type = DESKS[i].deskType;
                            }
                        } else {
                            DESKS = []
                        }
                        let floorDesks = DESKS.filter((d) => {
                            return d.floor == floors[0].floorNumber
                        })
                        res.data.floors = floors;
                        setWorkspace(res.data)
                        setDesks(DESKS)
                        setWsDesks(DESKS)
                        setCurrentFloorDesks(floorDesks)
                        console.log(res.data, floorDesks)
                    })
                })
            } catch (err) {
                console.log(err)
                navigate('/workspace-admin')
            }
        }
        getWSInfo();
    }, [])

    useEffect(() => {
        console.log(selectedFile)
    }, [imageUploaded])


    useEffect(() => {
        setModalView(<>
            {modalWorkspace.singleDesk && <SingleDeskModal isOpen={modalWorkspace.singleDesk ? true : false} title="Add single desk"
                modalResult={confirmCreationSingle} workspaceId={workspace._id} deskType={modalWorkspace.deskType}
            ></SingleDeskModal>}
            {modalWorkspace.meetingRoom && <MultiDeskModal isOpen={modalWorkspace.meetingRoom ? true : false} title="Add meeting room"
                modalResult={confirmCreationMeeting} type={'meeting'}
            ></MultiDeskModal>}
            {modalWorkspace.deskInfo && <DeskInfoModal isOpen={modalWorkspace.deskInfo ? true : false} title="Desk Info" modalResult={editDeskInfo} desk={modalWorkspace.desk}></DeskInfoModal>}

        </>
        )

    }, [modalWorkspace])

    function editDeskInfo(desk) {
        if (desk) {
            let deskArr = desks;
            deskArr[desk.id] = desk;
            setDesks(deskArr)
        }
        setModalWorkspace({})
    }

    function deleteDesk() {
        let deskArr = desks;
        deskArr.splice(selectedId, 1);
        for (let i in deskArr) {
            deskArr[i].id = i
        }
        selectShape(null)
        setDesks(deskArr)
        let floorDesks = deskArr.filter((d) => {
            return d.floor == currentFloor.floorNumber
        })
        setCurrentFloorDesks(floorDesks)
        setModalWorkspace({})
    }

    function confirmCreationSingle(result) {
        if (result) {
            console.log(result)
            let deskType = result.desk.type == 'fixed' ? 'FIXED_SINGLE_DESK' : 'FLEXIBLE_SINGLE_DESK';
            let deskimage = desksImagesMap[deskType];
            let desk = {
                _id: null,
                id: desks.length,
                workspace: workspace._id,
                floor: currentFloor.floorNumber,
                type: deskType,
                deskType: deskType,
                schedule: {},
                x: 0,
                y: 0,
                scaleX: 1,
                scaleY: 1,
                name: result.desk.name
            }
            if (deskType == 'FIXED_SINGLE_DESK') {
                desk['user'] = result.desk.users
            }
            let deskArr = desks;
            deskArr.push(desk)
            setDesks(deskArr)
            let floorDesks = deskArr.filter((d) => {
                return d.floor == currentFloor.floorNumber
            })
            setCurrentFloorDesks(floorDesks)
        }
        setModalWorkspace({});
    }

    function confirmCreationMeeting(result) {
        if (result) {
            let deskType = 'MEETING_ROOM';
            let deskimage = desksImagesMap[deskType];
            let desk = {
                _id: null,
                id: desks.length,
                workspace: workspace._id,
                floor: currentFloor.floorNumber,
                type: deskType,
                deskType: deskType,
                schedule: {},
                x: 0,
                y: 0,
                scaleX: 1,
                scaleY: 1,
                capacity: result.desk.capacity,
                name: result.desk.name
            }
            let deskArr = desks;
            deskArr.push(desk)
            setDesks(deskArr)
            let floorDesks = deskArr.filter((d) => {
                return d.floor == currentFloor.floorNumber
            })
            setCurrentFloorDesks(floorDesks)
        }
        setModalWorkspace({});
    }

    const checkDeselect = (e) => {
        // deselect when clicked on empty area
        const clickedOnEmpty = e.target._id != e.target.getParent().getStage();
        console.log(e.target)
        if (clickedOnEmpty) {
            console.log("empty")
            selectShape(null);
        }
    };

    function openModal(modalName) {
        if (!currentFloor || (!currentFloor.image && !imageUploaded)) {
            return;
        }
        switch (modalName) {
            case "fixed_single_desk":
                setModalWorkspace({
                    singleDesk: true,
                    deskType: 'fixed'
                });
                return;
            case "flexible_single_desk":
                setModalWorkspace({
                    singleDesk: true,
                    deskType: 'flexible'
                });
                return;
            case "meeting_room":
                setModalWorkspace({
                    meetingRoom: true
                });
                return;
        }
    }

    function showDeskInfoModal() {
        let desk = desks.find((d) => {
            return selectedId == d.id
        })
        setModalWorkspace({
            deskInfo: true,
            desk: desk
        })
    }

    async function changeFloor(floorIndex) {
        floorIndex = parseInt(floorIndex)
        let ws = workspace;
        ws.floors[currentFloor.floorNumber - 1] = currentFloor;
        setWorkspace(ws)
        setCurrentFloor(ws.floors[floorIndex])
        let floorDesks = desks.filter((d) => {
            return d.floor == floorIndex + 1
        })
        console.log(floorDesks, floorIndex)
        setCurrentFloorDesks(floorDesks)
        setSelectedFile(undefined)
        selectShape(null)
    }

    function handleImageUpload(e) {
        if (e.target.files.length !== 0) {
            setSelectedFile(e.target.files[0]);
            let fl = currentFloor;
            fl.image = e.target.files[0];
            let ws = workspace;
            ws.floors[currentFloor.floorNumber - 1] = fl;
            console.log(ws)
            setWorkspace(ws)
            setCurrentFloor(fl)
            let floorDesks = desks.filter((d) => {
                return d.floor == currentFloor.floorNumber
            })
            setCurrentFloorDesks(floorDesks)
        }
    }

    const save = async () => {
        try {
            for (var i in workspace.floors) {
                if (workspace.floors[i].image) {
                    console.log(workspace.floors[i].image)
                    let data = new FormData();
                    data.append('avatar', workspace.floors[i].image, 'floorImage' + i + '.png');
                    await updateFloorImageByWrokspaceId(workspace._id, i, data)
                }
            }
            console.log(desks, currentFloorDesks)
            await updateWorkspaceDesksByWorkspaceId(workspace._id, { desks: desks }).then(() => {
                toast.success("Saved")
            })
        } catch (err) {
            console.log(err)
            toast.error('Error while saving')
        }
    }


    return (
        <div>
            {modalView}
            < ToastContainer />
            {workspace && currentFloor &&
                <>
                    <header>
                        <div className='admin-header-conntainer'>
                            <div className="ws-admin-header-sub">
                                <img src={logo} alt="maktabi" className='ws-admin-header-logo' />
                            </div>
                            <Button onClick={() => navigate('/workspace-admin')}
                                variant="contained" sx={{
                                    backgroundColor: '#0b5715',
                                    color: 'white',
                                    width: 500,
                                    ':hover': {
                                        bgcolor: '#449933',
                                        color: 'white',
                                    },
                                }}> Back to dashboard</Button>
                        </div>
                    </header >
                    <div className="d-flex mx-4 mt-5 px-4 gap-3 align-items-center w-75">
                        <Input
                            id="floorSelect"
                            name="floorSelect"
                            type="select"
                            className="configure-floor-select"
                            onChange={(e) => { changeFloor(e.target.value) }}
                        >
                            {workspace && workspace.floors &&
                                workspace.floors.map((floor, i) => {
                                    return <option value={i}>
                                        floor {floor.floorNumber}
                                    </option>
                                })
                            }
                        </Input>
                        <Button variant="contained" component="label" sx={{
                            height: 40,
                            color: "white",
                            borderColor: "#0b5715",
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 600,
                            bgcolor: '#0b5715',
                            width: '15%',
                            ':hover': {
                                bgcolor: '#449933',
                                color: 'white',
                            },
                        }}>
                            Upload floor plan
                            <input hidden accept="image/*" type="file"
                                onChange={(e) => handleImageUpload(e)} />
                        </Button>
                        <div className="desk-options-container d-flex justify-content-center align-items-center gap-3">
                            <div className="text-center desk-option" onClick={() => { openModal('fixed_single_desk') }}>
                                <img src={singleDesk} width='70' height='70'></img>
                                <div className="f20">Fixed Single Desk</div>
                            </div>
                            <div className="text-center desk-option" onClick={() => { openModal('flexible_single_desk') }}>
                                <img src={singleDesk} width='70' height='70'></img>
                                <div className="f20">Flexible Single Desk</div>
                            </div>
                            {workspace.type == 'private' &&
                                <div className="text-center desk-option" onClick={() => { openModal('meeting_room') }}>
                                    <img src={meetingRoom} width='150' height='110'></img>
                                    <div className="f20">Meeting Room</div>
                                </div>}
                        </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-center">
                        {currentFloor && (currentFloor.image) &&
                            <div className="mt-4">
                                <div className="d-flex">
                                    <Button variant="contained" component="label" sx={{
                                        height: 40,
                                        color: "white",
                                        borderColor: "#0b5715",
                                        borderRadius: 3,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        bgcolor: '#0b5715',
                                        width: '20%',
                                        marginRight: 5,
                                        ':hover': {
                                            bgcolor: '#449933',
                                            color: 'white',
                                        },
                                    }}
                                        onClick={() => { deleteDesk() }}
                                    >Delete selected desk</Button>
                                    <Button variant="contained" component="label" sx={{
                                        height: 40,
                                        color: "white",
                                        borderColor: "#0b5715",
                                        borderRadius: 3,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        bgcolor: '#0b5715',
                                        width: '20%',
                                        ':hover': {
                                            bgcolor: '#449933',
                                            color: 'white',
                                        },
                                    }}
                                        onClick={() => { showDeskInfoModal() }}
                                    >Show selected desk info</Button>
                                </div>
                                <Stage width={canvasWidth} height={canvasHeight}
                                >
                                    <Layer>
                                        {currentFloor.image && <CanvasBackground img={URL.createObjectURL(currentFloor.image)}></CanvasBackground>}
                                    </Layer>
                                    <Layer>

                                        {currentFloorDesks && currentFloorDesks.map((desk, i) => {
                                            let image = desksImagesMap[desk.type]
                                            return <DeskImage
                                                desk={desk}
                                                image={image}
                                                draggable
                                                key={i}
                                                shapeProps={desk}
                                                isSelected={desk.id === selectedId}
                                                onSelect={() => {
                                                    selectShape(desk.id);
                                                }}
                                                onChange={(newAttrs) => {
                                                    let deskArr = desks;
                                                    console.log(deskArr, desk.id)
                                                    deskArr[desk.id].x = newAttrs.x;
                                                    deskArr[desk.id].y = newAttrs.y;
                                                    deskArr[desk.id].scaleX = newAttrs.scaleX;
                                                    deskArr[desk.id].scaleY = newAttrs.scaleY;
                                                    deskArr[desk.id].rotation = newAttrs.rotation;
                                                    setDesks(deskArr)
                                                    let floorDesks = deskArr.filter((d) => {
                                                        return d.floor == currentFloor.floorNumber
                                                    })
                                                    console.log('edit', floorDesks)
                                                    setCurrentFloorDesks(floorDesks)
                                                }}
                                            />
                                        })}
                                    </Layer>
                                </Stage>
                                <div className="d-flex justify-content-center gap-3">
                                    <Button onClick={() => { save() }}
                                        variant="contained" sx={{
                                            backgroundColor: '#0b5715',
                                            color: 'white',
                                            ':hover': {
                                                bgcolor: '#449933',
                                                color: 'white',
                                            },
                                        }}>Save</Button>
                                </div>
                            </div>
                        }
                        {currentFloor && !(currentFloor.image) && <h1 className="dark-green pt-5 mt-5">Upload your floor plan image to start planning you layout!</h1>}
                    </div>

                </>
            }
        </div >
    )
}