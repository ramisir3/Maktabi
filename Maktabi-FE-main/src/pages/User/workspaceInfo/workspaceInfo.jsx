import { useEffect, useState } from "react"
import { getWorkspaceAvatarById, getWorkspaceById, subscribeUserFromWorkspace, unsubscribeUserFromWorkspace } from "../../../scripts/APIs"
import { useLocation, useNavigate } from "react-router-dom"
import logo from '../../../images/logo-no-background-white.png'
import { Button } from "@mui/material"
import stock from '../../../images/moscow-russia-january-sdeskStock.jpg'
import './workspaceInfo.css'
import Carousel from 'react-bootstrap/Carousel';
import stockImage1 from '../../../images/stock-ws-image-1.jpg'
import stockImage2 from '../../../images/stock-ws-image-2.jpg'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function WorkspaceInfo(props) {
    const navigate = useNavigate()
    const [workspaceFullInfo, setWorkspaceFullInfo] = useState(undefined)
    const state = useLocation();
    const { user, userAvatar, workspace } = state.state
    const [isUserSubscribed, setUserSubscribed] = useState(false)

    useEffect(() => {
        async function getWorkspaceInfo() {
            await getWorkspaceAvatarById(workspace._id).then((avatar) => {
                let ws = workspace
                if (avatar.data.size > 0) {
                    ws['avatar'] = avatar.data
                }
                for (let i in ws.users) {
                    if (ws.users[i] == user._id) {
                        setUserSubscribed(true)
                    }
                }
                setWorkspaceFullInfo(ws)
            })
        }

        getWorkspaceInfo()
    }, [])

    async function unSubscribe() {
        try {
            await unsubscribeUserFromWorkspace(user._id, workspace._id).then((res) => {
                toast.success('unsubscribed from workspace')
                setUserSubscribed((prev) => !prev)
            })
        } catch (err) {
            console.log(err);
            toast.error('error while unsubscribing')
        }
    }

    async function subscribe() {
        try {
            await subscribeUserFromWorkspace(user._id, workspace._id).then((res) => {
                toast.success('subscribed to workspace')
                setUserSubscribed((prev) => !prev)
            })
        } catch (err) {
            console.log(err);
            toast.error('error while subscribing')
        }
    }

    return (<>
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
        {workspaceFullInfo &&
            <>
                <div className="d-flex justify-content-between mx-5 mt-5 px-5 align-items-center">
                    <div>
                        <h1 className="dark-green">{workspaceFullInfo.name}</h1>
                        <h4 className="dark-green">{workspaceFullInfo.location.address}, {workspaceFullInfo.location.city}</h4>
                        <div className="d-flex gap-2 mt-3">
                            {isUserSubscribed && <>
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
                                    onClick={() => { unSubscribe() }}
                                >Unsubscribe</Button>
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
                                    onClick={() => { navigate('/user/workspace/book/' + workspace._id, { state: { 'user': user, 'userAvatar': userAvatar, 'workspace': workspace } }) }}
                                >Book</Button>
                            </>}
                            {!isUserSubscribed && <Button variant="contained" sx={{
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
                                onClick={() => { subscribe() }}
                            >Subscribe</Button>}
                        </div>
                    </div>
                    <div>
                        <img src={workspaceFullInfo.avatar && URL.createObjectURL(workspaceFullInfo.avatar) || stock} className="ws-info-image" />
                    </div>
                </div>
                <hr />
                <div className="d-flex justify-content-between mx-5 mt-5 px-5 align-items-center">
                    Lorem ipsum dolor sit amet consectetur adipiscing elit, arcu aliquam primis varius eget aliquet, nostra condimentum blandit porta pellentesque orci. Eros cum natoque imperdiet ante nunc aliquam egestas, elementum rhoncus suspendisse etiam ut habitasse odio, sodales per ultrices scelerisque augue sagittis. Varius dui phasellus morbi ultricies fringilla fermentum velit non, lobortis est porttitor at orci massa dictumst fames molestie, rhoncus tempus nascetur class lectus rutrum nunc.

                    Semper arcu facilisis quam velit litora primis, maecenas condimentum lacinia penatibus suscipit parturient, morbi faucibus sed turpis dapibus. Varius auctor torquent cubilia curabitur ut pellentesque donec interdum inceptos euismod bibendum, viverra venenatis mi volutpat conubia est quis condimentum ante turpis, porta gravida nisi enim eu phasellus pulvinar proin velit augue. Feugiat sed rhoncus dapibus ad class vivamus donec orci sodales, enim malesuada mus aenean magna magnis laoreet vel, sollicitudin rutrum lacus dignissim interdum habitasse mattis commodo.

                    Malesuada magnis pharetra tortor aliquam vivamus dapibus imperdiet ante eu conubia, aliquet primis id eget ridiculus diam libero facilisi faucibus, erat tellus est gravida curae sed integer enim bibendum. Odio montes ullamcorper aliquam, senectus mi litora consequat, himenaeos malesuada. Dictumst sociosqu hac vehicula blandit tortor gravida class lacinia, sed suspendisse suscipit quisque praesent eros justo, vulputate parturient vestibulum posuere quis aenean nulla.
                </div>
                <div className="d-flex justify-content-center mx-5 mt-5 px-5 align-items-center">
                    <Carousel slide={false}>
                        <Carousel.Item>
                            <img
                                className="carosel-image"
                                src={stockImage1}
                                alt="First slide"
                            />
                            <Carousel.Caption>

                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item>
                            <img
                                className="carosel-image"
                                src={stockImage2}
                                alt="Second slide"
                            />

                            <Carousel.Caption>

                            </Carousel.Caption>
                        </Carousel.Item>
                    </Carousel>
                </div>
            </>
        }
    </>)
}