import React, { useState } from 'react';
import { Button, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '../Colors/colors';
import PhoneInput from 'react-phone-number-input/react-native-input'
import { Toast } from "react-native-toast-message/lib/src/Toast";
import ImagePicker from '../components/imagePicker';
import MyImagePicker from '../components/imagePicker';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { updateAvatar, userSignUp } from '../APIs/API';



export const SignUp = ({ navigation }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phn, setPhn] = useState('');
    const [selectedFile, setSelectedFile] = useState(undefined);
    const [emailErrorText, setEmailErrorText] = useState(" ");
    const [passErrorText, setPassErrorText] = useState(" ");
    const [fNameErrorText, setFNameErrorText] = useState(" ");
    const [lNameErrorText, setLNameErrorText] = useState(" ");
    const [phnErrorText, setPhnErrorText] = useState(" ");

    let passError = false;
    let emailError = false;
    let fNameError = false;
    let lNameError = false;
    let phnError = false;


    function validateEmail() {
        let re = /[^\s@]+@[^\s@]+\.[^\s@]+/;
        if (email === "") {
            emailError = true;
            setEmailErrorText("Email is required")
            return;
        }
        if (!email.match(re)) {
            emailError = true;
            setEmailErrorText("Email is the wrong format")
            return;
        }
        emailError = false;
        setEmailErrorText(" ");
        return true;
    }

    function validatePass() {
        if (password === "") {
            passError = true;
            setPassErrorText("Password is required")
            return;
        }
        if (password.length < 7 || password.length > 64) {
            passError = true;
            setPassErrorText("Password should be between 7 and 64 characters")
            return;
        }
        passError = false;
        setPassErrorText(" ");
        return true;
    }

    function validateFName() {
        if (firstName === "") {
            setFNameErrorText("First name is required")
            fNameError = true;
            return;
        }
        fNameError = false;
        setFNameErrorText("");
        return true;
    }

    function validateLName() {
        if (lastName === "") {
            setLNameErrorText("Last name is required")
            lNameError = true;
            return;
        }
        lNameError = false;
        setLNameErrorText("");
        return true;
    }

    function validatePhoneNumer() {
        if (phn == '' || phn == undefined) {
            setPhnErrorText("Phone number is required")
            phnError = true;
            return;
        } else if (!isValidPhoneNumber(phn)) {
            setPhnErrorText("Invalid phone number")
            phnError = true;
            return;
        }
        phnError = false;
        setPhnErrorText("")
        return true;
    }

    async function handleSignUp() {
        validateEmail();
        validatePass();
        validateFName();
        validateLName();
        validatePhoneNumer();
        if (!passError && !emailError && !fNameError && !lNameError && !phnError) {
            try {
                await userSignUp(firstName, lastName, email, password, phn)
                    .then(async (response) => {
                        if (selectedFile) {
                            let data = new FormData();
                            data.append('avatar', { uri: selectedFile.uri, name: selectedFile.name });
                            await updateAvatar(response.data.token, data);
                        }
                        navigate('/login');
                    })
            }
            catch (err) {
                console.log('Some error occured during signing in: ', err);
            }
        }
    }

    return (
        <>
            <View style={{ flex: 1, paddingHorizontal: 20, justifyContent: 'center' }}>
                <View style={{ elevation: 10, shadowColor: Colors.darkGreen }}>
                    <View style={{ padding: 20, backgroundColor: Colors.background, borderRadius: 10 }}>
                        <Image source={require('../images/logo-no-background.png')} style={{ width: 300, height: 100, resizeMode: 'contain' }} />
                        <Text style={{ color: Colors.darkGreen, marginBottom: 30 }}>Create Your User Account Now And Start Booking</Text>
                        <TextInput
                            style={styles.input}
                            value={firstName}
                            onChangeText={setFirstName}
                            placeholder="First Name"
                        />
                        <TextInput
                            style={styles.input}
                            value={lastName}
                            onChangeText={setLastName}
                            placeholder="Last Name"
                        />
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Email"
                        />
                        <TextInput
                            style={styles.input}
                            value={password}
                            placeholder="Password"
                            onChangeText={setPassword}
                            secureTextEntry={true}
                        />
                        <PhoneInput
                            style={styles.input}
                            defaultCountry="PS"
                            value={phn}
                            placeholder="Phone Number"
                            onChange={setPhn} />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 }}>
                            <View style={{
                                marginVertical: 50, borderColor: Colors.darkGreen, borderWidth: 2, borderRadius: 45,
                                width: 90, height: 90, justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
                            }}>
                                {!selectedFile && <Image source={require('../images/user-stock.png')} style={{ width: 60, height: 60, resizeMode: 'cover' }} />}
                                {selectedFile && <Image source={selectedFile} style={{ width: 90, height: 90, resizeMode: 'cover' }} />}
                            </View>
                            <MyImagePicker setImage={setSelectedFile} />
                        </View>
                        <Button
                            title="Sign Up"
                            onPress={() => handleSignUp()}
                            color={Colors.darkGreen}
                        />
                        <Pressable onPress={() => {
                            navigation.navigate("login");
                        }}
                            style={{ marginTop: 10, alignItems: 'center' }}
                        >
                            <Text style={{ color: Colors.darkGreen, fontSize: 13 }}>Already have an account? Log in.</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    input: {
        height: 40,
        borderWidth: 1,
        padding: 10,
        borderRadius: 6,
        borderColor: Colors.darkGreen,
        color: Colors.darkGreen,
        marginTop: 10
    },
});