import React, {useState, useEffect } from "react";
import { useAdminContext } from "../../pages/AdminPage";
import '../../styles/adminPage/PlaylistsList.css';
import PlaylistBlock from "../adminPage/PlaylistBlock";

function PlaylistsList({setCreatedQR, setSelectedPlaylist}) {
    const {baseUrl, createdQR} = useAdminContext();
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllPlaylists();
    }, [baseUrl]);

    
    useEffect(() => {
            const newEventSource = new EventSource(process.env.REACT_APP_SERVER + '/api/sse/playlistsupdates');
            newEventSource.addEventListener('message', event => {
                console.log('SSE Message received:', event);
                const data = JSON.parse(event.data);
                if (data.type === 'update') {
                        setPlaylists(current => [...current, data.playlistData]);
                        if (createdQR && data.playlistData._id === createdQR.id) {
                            console.log('New playlist: ', data.playlistData._id, 'My playlist: ', createdQR.id);
                            setCreatedQR(null);
                        }                    
                }
            });

            return () => {
                newEventSource.close();
            };
    }, [createdQR, setCreatedQR])

    const fetchAllPlaylists = () => {
        fetch(`${baseUrl}/showplaylists`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            setPlaylists(data);
            setLoading(false);
            console.log("the playlists: ", data);
        })
        .catch(error => {
            console.log('Error fetching all playlists: ', error);
            setLoading(false);
        });
    }

    return (
        <div className="list-container">
            <h2>Playlists</h2>
            <ul className="list">
                {loading ?<p>Loading...</p>: (playlists.map((playlist, index) => (
                    <PlaylistBlock 
                    key={index} 
                    playlistInfo={playlist} 
                    setSelectedPlaylist={setSelectedPlaylist}
                    />
                )))}
            </ul>
        </div>
    );
}


export default PlaylistsList;