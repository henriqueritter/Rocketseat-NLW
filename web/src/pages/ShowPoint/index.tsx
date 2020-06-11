import React, {useEffect, useState} from 'react';
import {Link, useHistory } from 'react-router-dom';

import {FiArrowLeft, FiTrash2} from 'react-icons/fi';
import { Map, TileLayer, Marker} from 'react-leaflet';

import api from '../../services/api';

import './styles.css';

import logo from '../../assets/logo.svg';


interface Point {
  id: number;
  image: string;
  name: string;
  email: string;
  whatsapp: number;
  latitude: number;
  longitude: number;
  city: string;
  uf: string;
  image_url: string;
}

const ShowPoint = () => {
  const [points, setPoints] = useState<Point[]>([]);
  const [initialPosition, setInicialPosition] = useState<[number,number]>([0, 0]);
  
  const history = useHistory();
  
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;

      setInicialPosition([latitude, longitude]);
    });
  }, []);

  useEffect(()=>{
    api.get('points').then(response => {
      setPoints(response.data);
      //console.log(response.data);
    });
  }, []);

  async function handleDeletePoint(id: number){
    await api.delete(`/points/${id}`).then(response => {
      alert('Ponto de coleta excluído');
      history.push('/');
    })
  }

  return (
    <div id="page-show-point">
      <header>
        <img src={logo} alt="Ecoleta"/>
        <Link to="/">
          <FiArrowLeft />
          Voltar para a Home
        </Link>
      </header>

      <form>
        <h1>Pontos de Coleta <br/> Cadastrados</h1>

        <fieldset>
          <Map center={initialPosition} zoom={15}>
            <TileLayer 
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {points.map(point=>{
              return (
              <Marker 
                key={point.id} 
                position={[point.latitude, point.longitude]}
              >
                <p>{point.name}</p>
              </Marker>                  
              );
            })}

          </Map>       
        </fieldset>
        
        <div id="field-group">
        <table>
          {points.map(point=>{
          return(
            <tr>
              <td>
                <img src={point.image_url} width="120" height="64" alt={point.name}/>
              </td>
              <td>
                <p><strong>Nome: </strong>{point.name}</p>
                
                <p>
                  <strong>E-mail: </strong> {point.email}    <strong>Whatsapp: </strong> {point.whatsapp}
                </p>

                <p><strong>Cidade: </strong>{point.city}-{point.uf}</p>
              </td>
              <td>
              <FiTrash2 onClick={() => handleDeletePoint(point.id)}/>
              </td>
            </tr>
          );
          })}
          </table>
        </div>
      </form>
    </div>
  )
}

export default ShowPoint;
