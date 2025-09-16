import React, { useEffect } from "react";
import { Header } from "../components/header";

import DateTimePicker from '@react-native-community/datetimepicker';
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import moment from "moment";
import { Colors } from "../Colors/colors";
import Dropdown from 'react-native-input-select';
import { bookDesk, getDeskBookings, getUsersById, getWSDesks } from "../APIs/API";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import Timetable from "react-native-calendar-timetable";
import EventComponent from "../components/eventCompoent";


export default function BookPage({ route }) {
    const [isStartDateShown, setIsStartDateShown] = useState(false);
    const [isEndDateShown, setIsEndDateShown] = useState(false);
    const [startDate, setStartDate] = useState(new Date())
    const [endDate, setEndDate] = useState(new Date())
    const [isStartTimeShown, setIsStartTimeShown] = useState(false);
    const [startTime, setStartTime] = useState(new Date())
    const [isEndTimeShown, setIsEndTimeShown] = useState(false);
    const [endTime, setEndTime] = useState(new Date())
    const [desks, setDesks] = useState([])
    const [floorDesks, setFloorDesks] = useState([])
    const [floor, setFloor] = useState(null);
    const [desk, setDesk] = useState(null);
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [users, setUsers] = useState(null)
    const [usersList, setUsersList] = useState([])
    const [currentDeskType, setCurrentDeskType] = useState(null)
    const [roomCapacity, setRoomCapacity] = useState(1)
    const { workspace, user } = route.params
    const [floors, setFloors] = useState([])
    const [floorError, setFloorError] = useState(false)
    const [deskError, setDeskError] = useState(false)
    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState(<></>)


    useEffect(() => {
        async function getWorkspaceDeskList() {
            await getWSDesks(workspace._id).then((res) => {
                console.log(workspace.floors)
                let floorsList = workspace.floors.filter((fl) => {
                    return fl.floorImage
                })
                console.log(floorsList)
                setFloors(floorsList)
                if (floorsList.length > 0) {
                    setFloor(1)
                    setFloorError(false)
                } else {
                    setFloorError(true)
                }
                let deskList = res.data
                deskList = deskList.filter((d) => {
                    return d.deskType != 'FIXED_SINGLE_DESK'
                })
                setDesks(deskList)
                let floorDeskList = deskList.filter((d) => {
                    return floorsList.length > 0 && d.floor == 1
                })
                setFloorDesks(floorDeskList)
                setDesk(floorDeskList && floorDeskList[0] && floorDeskList[0]._id)
                setCurrentDeskType(floorDeskList[0] && floorDeskList[0].deskType)
                if (floorDeskList[0] && floorDeskList[0].deskType == 'MEETING_ROOM') {
                    setRoomCapacity(floorDeskList[0].capacity)
                }
            })
            let usersArr = []
            for (let i in workspace.users) {
                await getUsersById(workspace.users[i]).then((res) => {
                    usersArr.push(res.data)
                })
            }
            setUsersList(usersArr)
        }
        if (user && workspace) {
            getWorkspaceDeskList()
        }
    }, [workspace, user])

    useEffect(() => {
        async function getWorkspaceDeskList() {
            let floorDeskList = desks.filter((d) => {
                return d.floor == floor
            })
            setFloorDesks(floorDeskList)
            setDesk(floorDeskList && floorDeskList[0] && floorDeskList[0]._id)
            setCurrentDeskType(floorDeskList[0] && floorDeskList[0].deskType)
            if (floorDeskList[0] && floorDeskList[0].deskType == 'MEETING_ROOM') {
                setRoomCapacity(floorDeskList[0].capacity)
            }
        }
        if (user && workspace && desks && floor) {
            getWorkspaceDeskList()
        }
    }, [floor])

    function onStartDateChange(event, selectedDate) {
        const currentDate = selectedDate;
        setIsStartDateShown(false);
        setStartDate(currentDate);
    }

    function onEndDateChange(event, selectedDate) {
        const currentDate = selectedDate;
        setIsEndDateShown(false);
        setEndDate(currentDate);
    }

    function onStartTimeChange(event, selectedTime) {
        const currentStartTime = selectedTime;
        setIsStartTimeShown(false);
        setStartTime(currentStartTime);
    }

    function onEndTimeChange(event, selectedTime) {
        const currentEndTime = selectedTime;
        setIsEndTimeShown(false);
        setEndTime(currentEndTime);
    }

    async function book() {
        let start = moment(moment(startDate).format('MMM DD, YYYY') + ' ' + moment(startTime).format('hh:mm A'))
        let end = moment(moment(endDate).format('MMM DD, YYYY') + ' ' + moment(endTime).format('hh:mm A'))
        if (start.isAfter(end) || start.isBefore(moment()) || end.isBefore(moment())) {
            console.log("fail")
            Toast.show({
                type: 'error',
                text1: 'invalid times'
            })
        } else if (title == '') {
            Toast.show({
                type: 'error',
                text1: 'title is required'
            })
        }
        else {
            try {
                let data = {
                    workspace: workspace._id,
                    user: user._id,
                    desk: desk,
                    title: title,
                    start: start,
                    end: end,
                }
                if (description != '') {
                    data['description'] = description
                }
                if (currentDeskType == 'MEETING_ROOM') {
                    data['users'] = users
                }
                await bookDesk(data).then((res) => {
                    if (res.data == 'cannot post') {
                        Toast.show({
                            type: 'error',
                            text1: 'conflicting times, please choose another time'
                        })
                    } else {
                        setTitle('')
                        setDescription('')
                        setStartDate(new Date())
                        setStartTime(new Date())
                        setEndDate(new Date())
                        setEndTime(new Date())
                        setUsers([])
                        Toast.show({
                            type: 'success',
                            text1: 'Booked successfully'
                        })
                    }
                })
            } catch (err) {
                Toast.show({
                    type: 'error',
                    text1: 'server error, please try again later'
                })
            }
        }
    }

    function handleSelectUsers(addedUsers) {
        if (addedUsers.length <= roomCapacity) {
            setUsers(addedUsers)
        } else {
            setUsers([...users])
            Toast.show({
                type: 'error',
                text1: 'Room Capacity Reached'
            })
        }
    }

    async function showBookingsModal() {
        try {
            await getDeskBookings(desk).then((res) => {
                let bookingsList = res.data;
                for (let i in bookingsList) {
                    bookingsList[i].startDate = moment(bookingsList[i].start);
                    bookingsList[i].endDate = moment(bookingsList[i].end)
                }
                setModalContent(<>
                    <View style={{ margin: 20 }}>
                        <ScrollView>
                            <Timetable
                                // these two are required
                                items={bookingsList}
                                renderItem={props => <EventComponent {...props} viewOnly={true} />}
                                date={new Date(startDate)}
                                fromHour={0}
                                toHour={24}
                            />
                            <TouchableOpacity onPress={() => { setModalContent(<></>); setModalVisible(false) }}
                                style={{ padding: 20, backgroundColor: Colors.lightGreen, borderRadius: 10, alignItems: 'center', marginVertical: 10, marginHorizontal: 10 }}>
                                <Text style={{ color: 'white' }}>Close</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </>)
                setModalVisible(true)
            })
        } catch (err) {
            console.error(err)
        }
    }

    return (<>
        <Header></Header>
        <Modal
            animationType="slide"
            transparent={false}
            visible={modalVisible}
            onRequestClose={() => {
                setModalContent(<></>)
                setModalVisible(false);
            }}>
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 22,
            }}>
                {modalContent}
            </View>
        </Modal>
        {workspace && <>
            <ScrollView>
                <View style={{ padding: 20, flexDirection: 'row', justifyContent: 'center' }}>
                    <View style={{ padding: 10, backgroundColor: Colors.lightGreen, borderRadius: 10, marginRight: 10 }}>
                        <TouchableOpacity onPress={() => { setIsStartDateShown(true) }}>
                            <Text style={{ color: 'white', fontSize: 12 }}>Select Start Date</Text>
                            <TextInput style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }} editable={false} selectTextOnFocus={false}>{moment(startDate).format('MMM DD, YYYY')}</TextInput>
                        </TouchableOpacity>
                        {isStartDateShown && <DateTimePicker
                            value={startDate}
                            mode={'date'}
                            onChange={onStartDateChange}
                        ></DateTimePicker>}
                    </View>
                    <View style={{ padding: 10, backgroundColor: Colors.lightGreen, borderRadius: 10, marginRight: 10 }}>
                        <TouchableOpacity onPress={() => { setIsStartTimeShown(true) }}>
                            <Text style={{ color: 'white', fontSize: 12 }}>Select Start Time</Text>
                            <TextInput style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }} editable={false} selectTextOnFocus={false}>{moment(startTime).format('hh:mm a')}</TextInput>
                        </TouchableOpacity>
                        {isStartTimeShown && <DateTimePicker
                            value={startTime}
                            mode={'time'}
                            is24Hour={false}
                            onChange={onStartTimeChange}
                        ></DateTimePicker>}
                    </View>
                </View>
                <View style={{ padding: 20, flexDirection: 'row', justifyContent: 'center' }}>
                    <View style={{ padding: 10, backgroundColor: Colors.lightGreen, borderRadius: 10, marginRight: 10 }}>
                        <TouchableOpacity onPress={() => { setIsEndDateShown(true) }}>
                            <Text style={{ color: 'white', fontSize: 12 }}>Select End Date</Text>
                            <TextInput style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }} editable={false} selectTextOnFocus={false}>{moment(endDate).format('MMM DD, YYYY')}</TextInput>
                        </TouchableOpacity>
                        {isEndDateShown && <DateTimePicker
                            value={endDate}
                            mode={'date'}
                            onChange={onEndDateChange}
                        ></DateTimePicker>}
                    </View>
                    <View style={{ padding: 10, backgroundColor: Colors.lightGreen, borderRadius: 10, marginRight: 10 }}>
                        <TouchableOpacity onPress={() => { setIsEndTimeShown(true) }}>
                            <Text style={{ color: 'white', fontSize: 12 }}>Select End Time</Text>
                            <TextInput style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }} editable={false} selectTextOnFocus={false}>{moment(endTime).format('hh:mm a')}</TextInput>
                        </TouchableOpacity>
                        {isEndTimeShown && <DateTimePicker
                            value={endTime}
                            mode={'time'}
                            is24Hour={false}
                            onChange={onEndTimeChange}
                        ></DateTimePicker>}
                    </View>
                </View>
                <View style={{ marginHorizontal: 20 }}>
                    <Text style={{ fontSize: 12, marginBottom: 10, color: 'grey' }}>title</Text>
                    <TextInput style={{ padding: 10, borderWidth: 1, marginBottom: 10, borderRadius: 10, color: Colors.darkGreen }}
                        value={title}
                        onChangeText={setTitle}
                    ></TextInput>
                </View>
                <View style={{ marginHorizontal: 20 }}>
                    <Text style={{ fontSize: 12, marginBottom: 10, color: 'grey' }}>description</Text>
                    <TextInput style={{ padding: 10, borderWidth: 1, marginBottom: 10, borderRadius: 10, color: Colors.darkGreen }}
                        value={description}
                        onChangeText={setDescription}
                    ></TextInput>
                </View>
                <View style={{ paddingHorizontal: 20 }}>
                    <Dropdown
                        label="floor"
                        placeholder="Select a floor..."
                        options={floors}
                        optionLabel={'floorNumber'}
                        optionValue={'floorNumber'}
                        selectedValue={floor}
                        onValueChange={(value) => setFloor(value)}
                        primaryColor={'green'}
                    />
                </View>
                {!floorError && <View style={{ paddingHorizontal: 20 }}>
                    <Dropdown
                        label="desk"
                        placeholder="Select a desk..."
                        options={floorDesks}
                        optionLabel={'name'}
                        optionValue={'_id'}
                        selectedValue={desk}
                        onValueChange={(value) => setDesk(value)}
                        primaryColor={'green'}
                    />
                    <TouchableOpacity style={{ padding: 20, backgroundColor: Colors.lightGreen, borderRadius: 10, alignItems: 'center', marginBottom: 10 }}
                        onPress={() => { showBookingsModal() }}>
                        <Text style={{ color: 'white' }}>View Desk Bookings for Selected Start Date</Text>
                    </TouchableOpacity>
                </View>
                }
                {workspace.type == 'private' && usersList.length > 0 && currentDeskType == 'MEETING_ROOM' &&
                    !deskError &&
                    <View style={{ paddingHorizontal: 20 }}>
                        <Dropdown
                            label="members"
                            placeholder="select members"
                            options={usersList}
                            optionLabel={'email'}
                            optionValue={'_id'}
                            selectedValue={users}
                            isMultiple={true}
                            onValueChange={(value) => handleSelectUsers(value)}
                            primaryColor={'green'}
                            isSearchable={true}
                        />
                    </View>}
                <View style={{ justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
                    <View style={{}}>
                        <TouchableOpacity disabled={deskError || floorError} onPress={() => { book() }} style={{ padding: 10, backgroundColor: deskError || floorError ? 'grey' : Colors.lightGreen, borderRadius: 10, marginHorizontal: 20, width: 150, alignItems: 'center', marginBottom: 10 }}>
                            <Text style={{ color: 'white' }}>Book</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </>
        }
    </>
    )
}

