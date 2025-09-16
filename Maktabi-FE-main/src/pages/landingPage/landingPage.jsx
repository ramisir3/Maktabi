import Header from "../../components/header/header";
import landingPageBackImage from '../../images/home-background.jpg'
import './landingPage.css'
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@mui/material";
import { useUser } from "../../scripts/customHooks";

function LandingPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedTab, setSelectedTab] = useState(searchParams.get('activeTab') ? searchParams.get('activeTab') : 'Home');
    const [selectedTabContent, setSelectedTabContent] = useState();

    const { user, authenticated } = useUser();

    useEffect(() => {
        let pageContent = [];
        if (selectedTab === 'Home') {
            pageContent.push(<>
                <img src={landingPageBackImage} alt="maktabi background" className="backImage" />
                <div className="title" >
                    <div className="title-text">
                        Arrange booking and scheduling easily with
                    </div>
                    <div className="brand-title">
                        MAKTABI
                    </div>
                </div>
            </>);
        } else if (selectedTab === 'Features') {
            pageContent.push(<>
                <div className="full-page-bg">

                </div>
            </>);
        } else if (selectedTab === 'Pricing') {
            pageContent.push(<>
                <div className="full-page-bg price-page">
                    <div className="price-box special-price">
                        <div className="tier-title">Free Tier</div>
                        <hr className="solid"></hr>
                        <div className="tier-text">
                            A <strong style={{ fontSize: 22 }}>free</strong> user account gives you the ability to browse available workspaces,
                            enroll into workplaces. <br /> You can book as much as you want!
                        </div>
                        <Button sx={{
                            height: 40,
                            width: 'fit-content',
                            color: "#white",
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
                            variant="contained" onClick={() => { navigate('/signup') }}>Sign up</Button>
                    </div>
                    <div className="price-box special-price">
                        <div className="tier-title">Workspace Tier</div>
                        <hr className="solid"></hr>
                        <div className="tier-text">
                            All features of free tier. In addition, you can enable the cafe feature and enable users to browse your menu from the app
                        </div>
                        <Button sx={{
                            height: 40,
                            width: 'fit-content',
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
                            variant="contained" onClick={() => { setSelectedTab('About') }}>Contact Us</Button>
                    </div>
                    <div className="price-box special-price">
                        <div className="tier-title">Enterprise Tier</div>
                        <hr className="solid"></hr>
                        <div className="tier-text">
                            All features of free tier. In addition, you can enable room mode on a mobile device.
                        </div>
                        <Button sx={{
                            height: 40,
                            width: 'fit-content',
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
                            variant="contained" onClick={() => { setSelectedTab('About') }}>Contact Us</Button>
                    </div>
                </div>
            </>);
        } else if (selectedTab === 'About') {
            pageContent.push(<>
                <div className="full-page-bg">

                </div>
            </>);
        }
        setSelectedTabContent(pageContent);
        if (!searchParams.get('activeTab') || searchParams.get('activeTab') != selectedTab) {
            setSearchParams({ 'activeTab': selectedTab })
        }
    }, [selectedTab]);

    function onTabChanged(tabName) {
        setSelectedTab(tabName);
    }

    if (user && authenticated) {
        console.log(user, authenticated)
        if (user.role == 'basic') {
            navigate('/user/home');
        } else {
            navigate('/workspace-admin');
        }
        return;
    }

    return (
        <>
            <Header onTabChange={onTabChanged} />
            <div className="page-content">
                {selectedTabContent}
            </div>
        </>
    );
}

export default LandingPage;