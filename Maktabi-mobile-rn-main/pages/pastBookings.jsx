import { useNavigation } from "@react-navigation/native";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { FlatList, Modal, Pressable, ScrollView, Text } from "react-native";
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Table, Row, Rows } from "react-native-reanimated-table";
import { Colors } from "../Colors/colors";
import { Header } from "../components/header";
import moment from "moment";
import { useUser } from "../APIs/customHooks";
import { getDeskInfo, getUserBookings, getUser } from "../APIs/API"
import { getTokenFromLocalStorage } from "../APIs/common";

export default function PastBookings({ navigation }) {
    const [user, setUser] = useState(null)
    const [tableData, setTableData] = useState(undefined)
    const [bookings, setBookings] = useState([])
    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState(<></>)



    useEffect(() => {
        async function updateUser() {
            let token = await getTokenFromLocalStorage()
            await getUser(token).then((res) => {
                setUser(res.data)
            })
        }
        const focusHandler = navigation.addListener('focus', () => {
            console.log('refresehed')
            setTableData(null)
            updateUser()
        });
        return focusHandler;
    }, [navigation]);

    useEffect(() => {
        if (user) {
            getTableData();
        }
    }, [user])

    async function getTableData() {
        let bookingList = []
        let table_data = []
        await getUserBookings(user._id).then(async (res) => {
            bookingList = res.data;
            bookingList = bookingList.sort((item1, item2) => {
                return moment(item1.start).isBefore(moment(item2.start)) ? 1 : -1
            })
            for (let i in bookingList) {
                if (moment(bookingList[i].start).isBefore(moment())) {
                    let deskInfo = await getDeskInfo(bookingList[i].desk._id);
                    bookingList[i]['deskInfo'] = deskInfo.data
                    let startDate = moment(bookingList[i].start)
                    let endDate = moment(bookingList[i].end)
                    table_data.push([startDate.format('MMM DD, YYYY hh:mm A'), endDate.format('MMM DD, YYYY hh:mm A'), bookingList[i].title,
                    <TouchableOpacity onPress={() => { generateModal(bookingList[i]); setModalVisible(true); }}>
                        <Text style={{ textAlign: 'center' }}>More Info</Text>
                    </TouchableOpacity>])
                }
            }
            setTableData(table_data);
        })
    }

    function generateModal(booking) {
        setModalContent(
            <View style={styles.modalView}>
                <Text style={styles.modalTextTitle}>{booking.title}</Text>
                <Text style={styles.modalTextKey}>At: </Text><Text>{booking.workspace.name}</Text>
                <Text style={styles.modalTextKey}>Floor: </Text><Text>{booking.deskInfo.floor}</Text>
                <Text style={styles.modalTextKey}>Desk: </Text><Text>{booking.deskInfo.name}</Text>
                <Text style={styles.modalTextKey}>Start: </Text><Text>{moment(booking.start).format('MMM DD, YYYY hh:mm A')}</Text>
                <Text style={styles.modalTextKey}>End: </Text><Text>{moment(booking.end).format('MMM DD, YYYY hh:mm A')}</Text>
                <Text style={styles.modalTextKey}>Description: </Text><Text>{booking.description}</Text>
                <Text style={styles.modalTextKey}>Other members: </Text>
                <FlatList
                    data={booking.users}
                    renderItem={({ item }) => <View>
                        <Text>{item.email}</Text>
                    </View>}
                    keyExtractor={item => item.email}
                />
                <Pressable
                    style={[styles.buttonClose]}
                    onPress={() => { setModalVisible(false); setModalContent(<></>); }}>
                    <Text style={{ color: 'white' }}>Close</Text>
                </Pressable>
            </View >
        )
    }

    return (
        <>
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
            <View style={{ padding: 20, marginTop: 20, alignItems: 'center' }}>
                <Text style={{ textAlign: 'center', color: Colors.darkGreen, fontSize: 20, fontWeight: 'bold' }}>Your past bookings</Text>
            </View>
            {tableData && tableData.length > 0 && <ScrollView style={styles.container}>
                <ScrollView horizontal={true}>
                    <Table borderStyle={{ borderWidth: 2, borderColor: Colors.darkGreen }}>
                        <Row data={['Start Time', 'End Time', 'Title', 'Actions']} widthArr={[200, 200, 200, 120]} style={styles.head} textStyle={styles.text} />
                        <Rows data={tableData} textStyle={styles.textCell} widthArr={[200, 200, 200, 120]} />
                    </Table>
                </ScrollView>
            </ScrollView>
            }
            {tableData && tableData.length == 0 && <Text style={{ textAlign: 'center', fontSize: 20, color: Colors.darkGreen }}>You have no past bookings</Text>}
            {!tableData && <Text style={{ textAlign: 'center', fontSize: 20, color: Colors.darkGreen }}>Loading...</Text>}
        </>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', marginHorizontal: 20 },
    head: { height: 40, backgroundColor: Colors.lightGreen },
    text: { margin: 6, color: 'white', textAlign: 'center' },
    textCell: { margin: 6 },
    modalView: {
        width: 400,
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        borderColor: Colors.darkGreen,
        borderWidth: 4,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTextTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.darkGreen
    },
    modalTextKey: {
        fontWeight: 'bold',
        marginTop: 20
    },
    buttonClose: {
        backgroundColor: Colors.darkGreen,
        borderRadius: 15,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginTop: 20
    }
});

