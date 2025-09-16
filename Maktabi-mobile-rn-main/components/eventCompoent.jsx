import { FlatList, Modal, Pressable, StyleSheet, Text, Touchable, TouchableOpacity, View } from "react-native";
import { Colors } from "../Colors/colors";
import { useState } from "react";
import moment from "moment";
import { deleteBookingsById } from "../APIs/API";
import { Toast } from "react-native-toast-message/lib/src/Toast"
import { Entypo, FontAwesome, Fontisto } from "@expo/vector-icons";


/**
 * Example item component
 * @param style Object with pre-calculated values, looks like {position: 'absolute', zIndex: 3, width: Number, height: Number, top: Number, left: Number}
 * @param item One of items supplied to Timetable through 'items' property
 * @param dayIndex For multiday items inicates current day index
 * @param daysTotal For multiday items indicates total amount of days
 */
export default function EventComponent({ style, item, onDelete, viewOnly }) {

    const [modalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState(<></>)

    async function deleteBooking(item) {
        try {
            await deleteBookingsById(item._id).then((res) => {
                onDelete(item)
                setModalVisible(false); setModalContent(<></>);
                Toast.show({
                    type: 'success',
                    text1: 'deleted booking'
                })
            })
        } catch (err) {
            console.log(err)
            setModalVisible(false); setModalContent(<></>);
            Toast.show({
                type: 'error',
                text1: '' + err
            })
        }
    }

    function generateModal() {
        setModalContent(
            <View style={styles.modalView}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                    <Text style={styles.modalTextTitle}>{item.title}</Text>
                    {!viewOnly && <TouchableOpacity onPress={() => { deleteBooking(item) }}>
                        <Entypo name="trash" size={24} color='red' />
                    </TouchableOpacity>}
                </View >
                <Text style={styles.modalTextKey}>At: </Text><Text>{item.workspace.name}</Text>
                <Text style={styles.modalTextKey}>Floor: </Text><Text>{item.desk.floor}</Text>
                <Text style={styles.modalTextKey}>Desk: </Text><Text>{item.desk.name}</Text>
                <Text style={styles.modalTextKey}>Start: </Text><Text>{moment(item.startDate).format('MMM DD, YYYY hh:mm A')}</Text>
                <Text style={styles.modalTextKey}>End: </Text><Text>{moment(item.endDate).format('MMM DD, YYYY hh:mm A')}</Text>
                <Text style={styles.modalTextKey}>Other members: </Text>
                <FlatList
                    data={item.users}
                    renderItem={({ user }) => <View>
                        <Text>{user.email}</Text>
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
        <View style={{
            ...style, // apply calculated styles, be careful not to override these accidentally (unless you know what you are doing)
            backgroundColor: Colors.lightGreen,
            paddingTop: 5,
            paddingLeft: 10,
            borderRadius: 10,
            elevation: 5,
        }}>
            <Modal
                animationType="slide"
                transparent={true}
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
            <TouchableOpacity onPress={() => { if (!viewOnly) { generateModal(); setModalVisible(true); } }}>
                <Text style={styles.Text}>{item.title}</Text>
                <Text style={styles.Text}> {item.workspace.name}</Text >
            </TouchableOpacity>
        </View >
    );
}

const styles = StyleSheet.create({
    'Text': {
        color: 'white',
        marginBottom: 5
    },
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
})