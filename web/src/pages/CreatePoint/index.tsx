import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import {Link, useHistory} from 'react-router-dom';
import { FiArrowLeft} from 'react-icons/fi';
import { Map, TileLayer, Marker} from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';

import Dropzone from '../../components/Dropzone';

import axios from 'axios';
import api from '../../services/api';


import './styles.css';

import logo from '../../assets/logo.svg';


interface Item {
  id: number,
  title: string,
  image_url: string;
}

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}
const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]); 
  const [cities, setCities] = useState<string[]>([]);

  const [selectedUf, setSelectedUf] = useState('0'); //armazena uf selecionada pelo usuario
  const [selectedCity, setSelectedCity] = useState('0');

  //armazena os itens de cada point
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  });
  // carrega o mapa na geo localizacao do computador que abriu
  const [initialPosition, setInicialPosition] = useState<[number,number]>([0, 0]);

  //seleciona uma posicao do marcador no mapa
  const [selectedPosition, setSelectedPosition] = useState<[number,number]>([0, 0]);

  const [selectedFile, setSelectedFile] = useState<File>();

  const history=useHistory();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;

      setInicialPosition([latitude, longitude]);
    });
  })

  useEffect(() => {
    api.get('items').then(response=>{
      setItems(response.data);
    });
  
  }, []);

  useEffect(() => {
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome').then(response => {
      //console.log(response.data);
      const ufInitials = response.data.map(uf=> uf.sigla);
      setUfs(ufInitials);
    });

  },[]);

   useEffect(() => {
     axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
          .then(response =>{
      const cities = response.data.map(city => city.nome);
      setCities(cities);
     });
   }, [selectedUf]);
  
   //funcao chamada pelo select da UF
  function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>){
    const uf = event.target.value;
  
    setSelectedUf(uf);
  }

  //funcao que trata a cidade selecionada
   function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>){
    const city = event.target.value;
  
    setSelectedCity(city);
  }
  
  //Funcao usada para adicionar local utilizando o mapa.
  function handleMapClick(event: LeafletMouseEvent){
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ])
  }


  //armazena os inputs do usuario
  function handleInputChange(event: ChangeEvent<HTMLInputElement>){
    const {name, value} = event.target;
    //Altera cada propriedade do formulario correspondente a id sendo editada no form
    setFormData({ ...formData, [name]: value});
  }

  //seleciona ou remove a seleção dos itens
  function handleSelectItem(id: number){
    const alreadySelected = selectedItems.findIndex(item => item === id);

    if (alreadySelected >= 0 ){
      const filteredItems = selectedItems.filter(item => item !== id);
      setSelectedItems(filteredItems);
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  }

  //funcao disparada pelo form
  async function handleSubmit(event: FormEvent) {
    event.preventDefault(); //impede da pagina recarregar

    
    const { name, email, whatsapp } = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [ latitude, longitude ] = selectedPosition;
    const items = selectedItems;

    const data = new FormData();

      data.append('name', name);
      data.append('email', email);
      data.append('whatsapp', whatsapp);
      data.append('uf', uf);
      data.append('city', city);
      data.append('latitude', String(latitude));
      data.append('longitude', String(longitude));
      data.append('items', items.join(','));
      if (selectedFile){
        data.append('image', selectedFile);
      }

    await api.post('points', data);

    alert('Ponto de coleta cadastrado');

    history.push('/');
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta"/>
        <Link to="/">
          <FiArrowLeft />
          Voltar para a Home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br /> Ponto de Coleta</h1>

        <Dropzone onFileUploaded={setSelectedFile}/>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input 
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>

          <div className="field-group">
            <div className="field">
            <label htmlFor="email">E-mail</label>
            <input 
              type="text"
              name="email"
              id="email"
              onChange={handleInputChange}
            />
          </div>
          <div className="field">
            <label htmlFor="whatsapp">Whatsapp</label>
            <input 
              type="text"
              name="whatsapp"
              id="whatsapp"
              onChange={handleInputChange}
            />
          </div>
          </div>

        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>
          <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer 
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition}/>

          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select name="uf" id="uf" value={selectedUf} onChange={handleSelectedUf}>
                <option value="0">Selecione uma UF</option>
                {ufs.map(uf => (
                  <option key={uf} value={uf}> {uf} </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select name="city" id="city" value={selectedCity} onChange={handleSelectedCity}>
                <option value="0">Selecione uma cidade</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais ítens abaixo</span>
          </legend>
          <ul className="items-grid">
            {items.map(item=>{
              return (
                <li key={item.id} 
                    onClick={() => handleSelectItem(item.id)}
                    className={selectedItems.includes(item.id) ? 'selected': ''} 
                >
                  <img src={item.image_url} alt="Teste"/>
                  <span>{item.title}</span>
                </li>
              );
            })}
          </ul>
        </fieldset>

        <button type="submit">
          Cadastrar ponto de coleta
        </button>
      </form>
    </div>
  );
};

export default CreatePoint;