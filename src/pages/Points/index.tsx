import React, { useState, useEffect } from 'react';
import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { SvgUri } from 'react-native-svg';
import * as Location from 'expo-location';

import styles from './styles';
import api from '../../services/api';

interface Item {
    id: number;
    title: string;
    img_url: string;
}

interface Point {
    id: number;
    image: string;
    name: string;
    latitude: number;
    longitude: number;
    city: string;
    uf: string;
}

interface Params {
    city : string;
    uf : string;
}

const Points = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const routeParams = route.params as Params;

    const [initialMapArea, setInitialMapArea] = useState<[number, number]>([0, 0]);
    const [points, setPoints] = useState<Point[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    useEffect(() => {
        async function locationUserPsition() {
            const { status } = await Location.requestPermissionsAsync();

            if (status != 'granted') {
                Alert.alert('Vish!!', 'Precisamos da sua localização para mostrar-lhe pontos de colata próximos.');
                return;
            }

            const location = await Location.getCurrentPositionAsync();

            const { latitude, longitude } = location.coords;

            setInitialMapArea([latitude, longitude]);
        }

        locationUserPsition();
    }, [selectedItems]);

    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data);
        });
    }, []);

    useEffect(() => {
        api.get('points', {
            params: {
                city: routeParams.city,
                uf: routeParams.uf,
                items: selectedItems
            }
        }).then(response => {
            setPoints(response.data);
        });
    }, [selectedItems]);

    function handleNavigation() {
        navigation.goBack();
    }

    function handleDetailPoint(id: number) {
        navigation.navigate('Detail', { point_id: id });
    }

    function handleSelectedItem(itemId: number) {

        const alreadySelected = selectedItems.findIndex(item => item == itemId);

        if (alreadySelected >= 0) {
            const itemFilter = selectedItems.filter(item => item !== itemId);

            setSelectedItems(itemFilter);
        } else {
            setSelectedItems([...selectedItems, itemId]);
        }
    }

    return (
        <>
            <View style={styles.container}>
                <TouchableOpacity onPress={handleNavigation}>
                    <Icon name="arrow-left" size={20} color="#34cb79"></Icon>
                </TouchableOpacity>

                <Text style={styles.title}>
                    Bem vindo.
            </Text>

                <Text style={styles.description}>
                    Encontre no mapa pontos para a coleta.
            </Text>

                <View style={styles.mapContainer}>
                    {initialMapArea[0] !== 0 && (
                        <MapView
                            style={styles.map}
                            loadingEnabled={initialMapArea[0] === 0}
                            initialRegion={{
                                latitude: initialMapArea[0],
                                longitude: initialMapArea[1],
                                latitudeDelta: 0.014,
                                longitudeDelta: 0.014,
                            }}
                        >
                            {points.map(point => (
                                <Marker
                                    key={String(point.id)}
                                    style={styles.mapMarker}
                                    coordinate={{
                                        latitude: point.latitude,
                                        longitude: point.longitude
                                    }}
                                    onPress={() => handleDetailPoint(point.id)}
                                >
                                    <View style={styles.mapMarkerContainer}>
                                        <Image style={styles.mapMarkerImage} source={{ uri: point.image }} />
                                        <Text style={styles.mapMarkerTitle}>
                                            {point.name}
                                        </Text>
                                    </View>
                                </Marker>
                            ))}
                        </MapView>
                    )}
                </View>
            </View>

            <View style={styles.itemsContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 5 }}
                >
                    {items.map(item => (
                        <TouchableOpacity
                            key={String(item.id)}
                            style={[
                                styles.item,
                                selectedItems.includes(item.id) ? styles.selectedItem : {}
                            ]}
                            activeOpacity={0.6}
                            onPress={() => handleSelectedItem(item.id)}>
                            <SvgUri height={42} width={42} uri={item.img_url} />
                            <Text style={styles.itemTitle}>{item.title}</Text>
                        </TouchableOpacity>
                    ))}

                </ScrollView>
            </View>
        </>
    );
}

export default Points;