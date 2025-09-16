import React, { useEffect, useState } from 'react';
import { Button, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '../Colors/colors';
import PhoneInput from 'react-phone-number-input/react-native-input'
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { useNavigation } from '@react-navigation/native';
import { login } from '../APIs/API';
import { storeTokenInLocalStorage } from '../APIs/common';
import { useUser } from '../APIs/customHooks';



export const Login = () => {
    const { user, authenticated } = useUser()
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailErrorText, setEmailErrorText] = useState(" ");
    const [passErrorText, setPassErrorText] = useState(" ");
    const [wrongCredentialsErrorMsg, setWrongCredentialsErrorMsg] = useState(" ");

    const navigation = useNavigation();

    useEffect(() => {
        if (user) {
            if (authenticated) {
                navigation.navigate('drawer')
            }
        }
    }, [user, authenticated])


    let passError = false;
    let emailError = false;

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

    async function handleLogin() {
        validateEmail();
        validatePass();
        if (!passError && !emailError) {
            try {
                const response = await login(email, password);
                if (!response?.data?.token) {
                    console.log(response.response.status)
                    setWrongCredentialsErrorMsg('Server error. Try again later.');
                    return;
                }
                storeTokenInLocalStorage(response.data.token);
                setEmail("")
                setPassword("")
                setWrongCredentialsErrorMsg(" ");
                navigation.navigate('drawer')
            }
            catch (err) {
                console.log('Some error occured during signing in: ', err);
                if (err.response?.status) {
                    switch (err.response.status) {
                        case 400:
                            setWrongCredentialsErrorMsg('Wrong email or password');
                            break;
                        default:
                            setWrongCredentialsErrorMsg('Server error. Try again later.');
                    }
                } else {
                    setWrongCredentialsErrorMsg('Server error. Try again later.');
                }
            }
        }
    }

    return (
        <>
            <View style={{ flex: 1, paddingHorizontal: 20, justifyContent: 'center' }}>
                <View style={{ elevation: 10, shadowColor: Colors.darkGreen }}>
                    <View style={{ padding: 20, backgroundColor: Colors.background, borderRadius: 10 }}>
                        <Image source={require('../images/logo-no-background.png')} style={{ width: 300, height: 100, resizeMode: 'contain', marginBottom: 50 }} />
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Email"
                        />
                        <Text style={{ color: 'red', fontSize: 10 }}>
                            {emailErrorText}
                        </Text>
                        <TextInput
                            style={styles.input}
                            value={password}
                            placeholder="Password"
                            onChangeText={setPassword}
                            secureTextEntry={true}
                        />
                        <Text style={{ color: 'red', fontSize: 10 }}>
                            {passErrorText}
                        </Text>
                        <Pressable onPress={() => {
                            Toast.show({
                                type: 'success',
                                text1: 'forgot password'
                            })
                        }}>
                            <Text style={{ color: Colors.darkGreen, fontSize: 13 }}>Forgot password?</Text>
                        </Pressable>
                        <View style={{ marginTop: 60 }}>
                            <Button
                                title="Log in"
                                onPress={() => handleLogin()}
                                color={Colors.darkGreen}
                            />
                            <Pressable onPress={() => {
                                navigation.navigate("signup");
                            }}
                                style={{ marginTop: 10, alignItems: 'center' }}
                            >
                                <Text style={{ color: Colors.darkGreen, fontSize: 13 }}>Don't have an account? Sign up.</Text>
                            </Pressable>
                        </View>
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
        marginVertical: 5
    },
});