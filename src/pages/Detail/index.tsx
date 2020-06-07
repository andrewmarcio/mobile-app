import React, { useEffect, useState } from 'react';
import { Feather as Icon, FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, TouchableOpacity, Image, SafeAreaView, Linking } from 'react-native';
import * as MailComposer from 'expo-mail-composer';
import { RectButton } from 'react-native-gesture-handler';

import api from '../../services/api';
import styles from './styles';

interface Params {
    point_id: number;
}

interface Detail {
    point: {
        image: string;
        name: string;
        whatsapp: string;
        email: string;
        city: string;
        uf: string;
        img_url:string
    },
    items: {
        title: string;
    }[];
}

const Detail = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const [detailPoint, setDetailPoint] = useState<Detail>({} as Detail);
    const routeParam = route.params as Params;

    useEffect(() => {
        api.get(`points/${routeParam.point_id}`)
            .then(response => {
                setDetailPoint(response.data);
            });
    }, []);

    function handleNavigationBack() {
        navigation.goBack();
    }

    function sendEmail() {
        MailComposer.composeAsync({
            subject: "Interesse em coleta de residuos",
            recipients: [detailPoint.point.email]
        });
    }
    function sendMessageWhatsapp() {
        Linking.openURL(`whatsapp://send?phone=${detailPoint.point.whatsapp}`);
    }

    if (!detailPoint.point) {
        return null;
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                <TouchableOpacity onPress={handleNavigationBack}>
                    <Icon name="arrow-left" size={24} color="#34cb79"></Icon>
                </TouchableOpacity>

                <Image style={styles.pointImage} source={{ uri: detailPoint.point.img_url }} />
                <Text style={styles.pointName}>{detailPoint.point.name}</Text>
                <Text style={styles.pointItems}>{detailPoint.items.map(item => item.title).join(', ')}</Text>

                <View style={styles.address}>
                    <Text style={styles.addressTitle}>Endereço</Text>
                    <Text style={styles.addressContent}>{detailPoint.point.city}, {detailPoint.point.uf}</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <RectButton style={styles.button} onPress={sendMessageWhatsapp}>
                    <FontAwesome name="whatsapp" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Whatsapp</Text>
                </RectButton>

                <RectButton style={styles.button} onPress={sendEmail}>
                    <Icon name="mail" size={20} color="#fff" />
                    <Text style={styles.buttonText}>E-mail</Text>
                </RectButton>
            </View>
        </SafeAreaView>
    );
}

export default Detail;