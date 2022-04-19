import Map, { Marker, Popup } from 'react-map-gl';
import { useState } from 'react';
import { Star, Room, LanguageTwoTone } from '@material-ui/icons';
import './app.css';
import axios from 'axios';
import { format } from 'timeago.js';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect } from 'react';
import Register from './components/Register';
import Login from './components/Login';

const MAPBOX_TOKEN =
  'pk.eyJ1IjoiYW51Ymhhdmc0IiwiYSI6ImNrczJ1dWVmOTBneHgybnBpaGxvcGttczIifQ.O7xpM1HCNWrPYSyBUujfYw'; // Set your mapbox token here

export default function App() {
  const myStorage = window.localStorage;

  const [currentUser, setCurrentUser] = useState(myStorage.getItem('user'));
  const [pins, setPins] = useState([]);
  const [currentPlaceId, setCurrentPlaceId] = useState(null);
  const [newPlace, setNewPlace] = useState(null);
  const [title, setTitle] = useState(null);
  const [desc, setDesc] = useState(null);
  const [rating, setRating] = useState(0);

  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const [viewport, setViewport] = useState({
    latitude: 37.6,
    longitude: -122.3,
    zoom: 10,
  });

  useEffect(() => {
    const getPins = async () => {
      try {
        const res = await axios.get('/pins');
        setPins(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getPins();
  }, []);

  const handleMarkerClick = (id, lat, long) => {
    setCurrentPlaceId(id);
    setViewport({ ...viewport, latitude: lat, longitude: long });
  };

  const handleAddClick = (e) => {
    // const [lat, long] = e.lngLat;
    const lat = e.lngLat.lat;
    const long = e.lngLat.lng;
    setNewPlace({
      long,
      lat,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPin = {
      username: currentUser,
      title,
      desc,
      rating,
      lat: newPlace.lat,
      long: newPlace.long,
    };

    try {
      const res = await axios.post('/pins', newPin);

      setPins([...pins, res.data]);

      setNewPlace(null);
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = () => {
    myStorage.removeItem('user');
    setCurrentUser(null);
  };
  return (
    <Map
      // initialViewState={{
      //   latitude: 37.6,
      //   longitude: -122.3,
      //   zoom: 10,
      // }}
      {...viewport}
      onMove={(evt) => setViewport(evt.viewState)}
      style={{ width: '100vw', height: '100vh', transition: 'all 0.5s ease' }}
      mapStyle='mapbox://styles/mapbox/streets-v9'
      mapboxAccessToken={MAPBOX_TOKEN}
      onDblClick={handleAddClick}
      transitionDuration='5s00'
    >
      {pins.map((p) => (
        <>
          <Marker
            longitude={p.long}
            latitude={p.lat}
            offsetLeft={viewport.zoom * 3.5}
            offsetTop={viewport.zoom * 7}
          >
            <Room
              style={{
                fontSize: viewport.zoom * 7,
                color: p.username === currentUser ? 'red' : 'slateblue',
                cursor: 'pointer',
              }}
              onClick={() => handleMarkerClick(p._id, p.lat, p.long)}
            />
          </Marker>
          {p._id === currentPlaceId && (
            <Popup
              longitude={p.long}
              latitude={p.lat}
              anchor='left'
              style={{ transition: 'all 0.5s ease' }}
            >
              <div className='card'>
                <label>Place</label>
                <h4 className='place'>{p.title}</h4>
                <label>Review</label>
                <p className='desc'>{p.desc}</p>
                <label>Rating</label>
                <div className='stars'>
                  {Array(p.rating).fill(<Star className='star' />)}
                </div>
                <label>Information</label>
                <span className='username'>
                  Created by <b>{p.username}</b>
                </span>
                <span className='date'>{format(p.createdAt)}</span>
              </div>
            </Popup>
          )}
        </>
      ))}
      {newPlace && (
        <Popup
          longitude={newPlace.long}
          latitude={newPlace.lat}
          anchor='left'
          onClose={() => setNewPlace(null)}
          style={{ transition: 'all 0.5s ease' }}
        >
          <div>
            <form onSubmit={handleSubmit}>
              <label>Title</label>
              <input
                placeholder='Enter a title'
                onChange={(e) => setTitle(e.target.value)}
              />
              <label>Review</label>
              <textarea
                placeholder='Tell us something about this place.'
                onChange={(e) => setDesc(e.target.value)}
              ></textarea>
              <label>Rating</label>
              <select onChange={(e) => setRating(e.target.value)}>
                <option value='1'>1</option>
                <option value='2'>2</option>
                <option value='3'>3</option>
                <option value='4'>4</option>
                <option value='5 '>5</option>
              </select>
              <button className='submitButton' type='submit'>
                Add Pin
              </button>
            </form>
          </div>
        </Popup>
      )}
      {currentUser ? (
        <button className='button logout' onClick={handleLogout}>
          Log out
        </button>
      ) : (
        <div className='buttons'>
          <button className='button login' onClick={() => setShowLogin(true)}>
            Login
          </button>
          <button
            className='button register'
            onClick={() => setShowRegister(true)}
          >
            Register
          </button>
        </div>
      )}
      {showRegister && <Register setShowRegister={setShowRegister} />}
      {showLogin && (
        <Login
          setShowLogin={setShowLogin}
          myStorage={myStorage}
          setCurrentUser={setCurrentUser}
        />
      )}
    </Map>
  );
}
