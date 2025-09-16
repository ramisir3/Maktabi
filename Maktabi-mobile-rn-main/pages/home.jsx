import React, { useState } from "react"
import { Button, Image, Pressable, ScrollView, Switch, Text, View } from "react-native"
import Timetable from "react-native-calendar-timetable";
import moment from "moment";
import EventComponent from "../components/eventCompoent";
import { Colors } from "../Colors/colors";
import { MyText } from "../components/myText";
import { useNavigation } from "@react-navigation/native";
import { Header } from "../components/header";
import { useEffect } from "react";
import { useUser } from "../APIs/customHooks";
import { getUser, getUserBookings } from "../APIs/API";
import { getTokenFromLocalStorage } from "../APIs/common";




export const Home = ({ navigation }) => {
    const { user, authenticated } = useUser()
    const [fullDay, setFullDay] = useState(false)
    const [items, setItems] = useState([]);
    const [date] = React.useState(new Date());


    useEffect(() => {
        const focusHandler = navigation.addListener('focus', () => {
            console.log('refresehed')
            setItems([])
            if (user) {
                getTodaysEvents()
            }
        });
        return focusHandler;
    }, [navigation]);

    useEffect(() => {
        if (user) {
            getTodaysEvents()
        }
    }, [])

    async function getTodaysEvents() {
        await getUserBookings(user._id).then((res) => {
            let bookings = res.data.filter((booking) => {
                let day = moment(booking.start).day()
                if (day == moment().day()) {
                    return true
                }
            })
            for (let i in bookings) {
                bookings[i].startDate = moment(bookings[i].start);
                bookings[i].endDate = moment(bookings[i].end)
            }
            setItems(bookings)
        })
    }

    function handleDelete(booking) {
        setItems([])
        getTodaysEvents()
    }

    return (
        user &&
        <View>
            < Header ></Header >
            <ScrollView style={{ padding: 20 }}>
                <View style={{ alignItems: 'center' }}>
                    <MyText style={{ color: Colors.darkGreen, fontSize: 30, textAlign: 'center', fontWeight: 'bold' }}>
                        Welcome {user.firstName}
                    </MyText>
                    <MyText style={{ color: Colors.darkGreen, fontSize: 18, textAlign: 'center' }}>
                        here is your schedule for the day. Have a great day!
                    </MyText>
                </View>
                <View style={{ alignItems: 'center', justifyContent: 'space-evenly', flexDirection: 'row', marginTop: 30 }}>
                    <Button
                        title="Past Bookings"
                        onPress={() => { navigation.navigate('pastBookings') }}
                        color={Colors.darkGreen}>
                    </Button>
                    <Button
                        title="Future Bookings"
                        onPress={() => { navigation.navigate('futureBookings') }}
                        color={Colors.darkGreen}>
                    </Button>
                </View>
                <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 30, flexDirection: 'row', }}>
                    <MyText style={{ fontWeight: 'bold', marginRight: 5 }}>Rest of day</MyText>
                    <Switch
                        trackColor={{ 'true': '#afafaf', 'false': '#767577' }}
                        thumbColor={fullDay ? Colors.darkGreen : '#f4f3f4'}
                        onValueChange={setFullDay}
                        value={fullDay}
                    />
                    <MyText style={{ fontWeight: 'bold', marginLeft: 5 }}>Full Day          </MyText>
                </View>
                <View style={{ padding: 20, borderWidth: 5, borderColor: Colors.darkGreen, borderRadius: 10, marginTop: 40, marginBottom: 200 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{moment().format('ddd MMM DD, YYYY')}</Text>
                    <Timetable
                        // these two are required
                        items={items}
                        renderItem={props => <EventComponent {...props} onDelete={handleDelete} />}
                        date={date}
                        fromHour={fullDay ? 0 : moment().hour()}
                        toHour={24}
                    />
                </View>
            </ScrollView>
        </View >
    )
}