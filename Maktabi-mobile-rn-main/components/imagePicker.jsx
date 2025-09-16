import React, { useState, useEffect } from 'react';
import { Button, Image, View, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../Colors/colors';

export default function MyImagePicker(props) {
    const [image, setImage] = useState(null);

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            props.setImage(result.assets[0])
        }
    };

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Button title="Upload Image" onPress={pickImage} color={Colors.darkGreen} />
        </View>
    );
}