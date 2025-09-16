import { useLocation, useNavigate } from "react-router-dom";
import logo from '../../../images/logo-no-background-white.png'
import { Button } from "@mui/material"
import stock from '../../../images/moscow-russia-january-sdeskStock.jpg'
import { Input } from "reactstrap";
import { useEffect, useRef, useState } from "react";
import { getAllPublicWorkspaces, getWorkspaceAvatarById, searchPublicWorkspacesByNameAndCity } from "../../../scripts/APIs";
import './browseWorkspaces.css'

export default function BrowseWorkspaces(props) {
    const navigate = useNavigate()
    const state = useLocation();
    let searchText = ""
    const [allWorkspaces, setAllWorkspaces] = useState([])
    const [searchResult, setSearchResult] = useState([])
    const { user, userAvatar } = state.state

    useEffect(() => {
        async function getPublicWS() {
            await getAllPublicWorkspaces().then(async (res) => {
                let wsList = res.data;
                for (let i in wsList) {
                    await getWorkspaceAvatarById(wsList[i]._id).then((avatar) => {
                        wsList[i].avatar = avatar.data.size > 0 ? avatar.data : null
                    })
                }
                setAllWorkspaces(wsList)
                setSearchResult(wsList)
            })
        }

        getPublicWS()
    }, [])

    async function search() {
        console.log(searchText)
        try {
            if (searchText == '') {
                setSearchResult(allWorkspaces)
            } else {
                await searchPublicWorkspacesByNameAndCity(searchText).then((res) => {
                    setSearchResult(res.data)
                })
            }
        } catch (err) {
            console.log(err)
        }
    }

    return (<>
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
        {allWorkspaces && allWorkspaces.length > 0 &&
            <div className="mx-5 px-5 mt-5">
                <div className="mx-5">
                    <Input type="search" placeholder="Search for workspace" onChange={(e) => { searchText = e.target.value; search() }}></Input>
                </div>
                <div className="mt-3">
                    {searchResult.map((ws) => {
                        return <div className="d-flex justify-content-between align-items-center mx-5 ws-list-tile-item"
                            onClick={() => {
                                navigate('/user/workspace/info', {
                                    state: {
                                        'user': user, 'userAvatar': userAvatar, 'workspace': ws
                                    }
                                })
                            }}
                        >
                            <div>
                                <h3 className="dark-green">{ws.name}</h3>
                                <h5 className="dark-green">{ws.location.address + ', ' + ws.location.city}</h5>
                            </div>
                            <div className="workspace-list-ws-image-container">
                                <img src={ws.avatar && URL.createObjectURL(ws.avatar) || stock} className="workspaces-list-ws-image" />
                            </div>
                        </div>
                    })}
                </div>
            </div >
        }
    </>)
}