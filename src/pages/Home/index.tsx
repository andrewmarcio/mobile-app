import React, { useState, useEffect} from 'react';
import { Feather as Icon } from '@expo/vector-icons';
import { View, Text, Image, ImageBackground, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { RectButton } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';


import styles from './styles';



interface IBGEUF {
    sigla: string
}

interface IBGECITEIS {
    nome: string;
}

const Home = () => {

    const navigate = useNavigation();

    const [selectedUf, setSelectedUf] = useState<string>();
    const [selectedCity, setSelectedCity] = useState<string>();

    //teste
    const [ufs, setIUfs] = useState<string[]>([]); 
    const [cities, setCities] = useState<string[]>([]);

    useEffect(() => {
        axios.get<IBGEUF[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
        .then(response =>{
            const ufInitials = response.data.map(uf => uf.sigla);
            
            setIUfs(ufInitials);
        });
    }, []);

    useEffect(()=>{
        if(selectedUf === '0'){
            return;
        }

        axios.get<IBGECITEIS[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
        .then(response =>{
            const cityName = response.data.map(city => city.nome);
            
            setCities(cityName);
        });
    }, [selectedUf]);

    function handleNavigateButton() {
        navigate.navigate('Points', { city : selectedCity , uf: selectedUf });
    }

    function returnSelectItems(selectObject: string[]){
        const items = selectObject.map(item => ({ label: item, value: item }))

        return items;    
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? "padding" : undefined}>
            <ImageBackground
                source={require('../../assets/home-background.png')}
                style={styles.container}
                imageStyle={{ width: 274, height: 368 }}
            >
                <View style={styles.main}>
                    <Image source={require('../../assets/logo.png')}></Image>
                    <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
                    <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</Text>
                </View>

                <View style={styles.footer}>

                    <RNPickerSelect
                        style={styles}
                        placeholder={{
                            label: "Selecione sua UF."
                        }}
                        useNativeAndroidPickerStyle={false}
                        onValueChange={(uf) => setSelectedUf(uf)}
                        items={returnSelectItems(ufs)}
                    />

                    <RNPickerSelect
                        style={styles}
                        placeholder={{
                            label: "Selecione sua cidade."
                        }}
                        useNativeAndroidPickerStyle={false}
                        onValueChange={(city) => setSelectedCity(city)}
                        items={returnSelectItems(cities)}
                    />
                    
                    <RectButton style={styles.button} onPress={handleNavigateButton}>
                        <View style={styles.buttonIcon}>
                            <Icon name="arrow-right" color="#fff" size={24}> </Icon>
                        </View>
                        <Text style={styles.buttonText}> Entrar </Text>
                    </RectButton>
                </View>
            </ImageBackground>
        </KeyboardAvoidingView>
    );
}

export default Home;