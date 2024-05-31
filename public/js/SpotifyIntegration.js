
  // Authorization token obtained previously
  const token = 'BQD5c9p5eLZEadcf3LFGYVHRVXFfIInx3_f5tUiDePAit9BKr57LKqfMytVfktgeDp2l05x0WShd3pkvqgthCSfkNqhWyp9N2krXcy2l4WygnoQczGNbP_1qOUjphCfRoPL-73nLAt4WACkBI2CPql4QuCWyY0Gu423kwo8zh2oHh3oX2uxOZVXFYfLm1Eszr_vg92s0YydVHsoXmXMHlIlPUTN4I4j1bOKsabvpK0mBO-eg99YWvMRoJEy4v9Vg4doJOA';
  
  /*
  console.log(token);
  // Function to fetch data from the Spotify Web API
  async function fetchWebApi(endpoint, method, body) {
    const res = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    return await res.json();
  }

  // Function definitions...

  // Function to get the list of playlists for the authenticated user
  async function getUserPlaylists() {
    const data = await fetchWebApi('me/playlists', 'GET');
    const playlists = data.items.map(playlist => ({ id: playlist.id, name: playlist.name }));
    return playlists;
  }

  // Function to get all songs and their URIs from a playlist
  async function getPlaylistTracks(playlistId) {
    const data = await fetchWebApi(`playlists/${playlistId}/tracks`, 'GET');
    const tracks = data.items.map(item => ({ name: item.track.name, uri: item.track.uri }));
    return tracks;
  }

  // Function to get all songs and their URIs from all playlists
  async function getAllPlaylistTracks(playlists) {
    const promises = playlists.map(playlist => getPlaylistTracks(playlist.id));
    const results = await Promise.all(promises);
    const allTracks = results.reduce((acc, curr) => acc.concat(curr), []);
    return allTracks;
  }


  async function getTopTracks() {
    // Updated endpoint reference: https://developer.spotify.com/documentation/web-api/reference/top-lists/get-users-top-artists-and-tracks/
    return (await fetchWebApi(
      'me/top/tracks?time_range=long_term&limit=5', 'GET' // Updated endpoint
    )).items;
  }

  async function printTopTracks() {
    try {
      const topTracks = await getTopTracks();
      console.log(
        topTracks?.map(
          ({ name, artists }) =>
            `${name} by ${artists.map(artist => artist.name).join(', ')}`
        )
      );
    } catch (error) {
      console.error('Error:', error);
    }
  }

  

  // Example usage
  (async () => {
    try {
      const playlists = await getUserPlaylists();
      const allTracks = await getAllPlaylistTracks(playlists);
      console.log('All playlist tracks:', allTracks);
      printTopTracks();
    } catch (error) {
      console.error('Error:', error);
    }
  })();

  
  /*

// Include the fetch library for making HTTP requests
const fetch = require('node-fetch');


// Authorization token obtained previously
const token = process.env.AUTH_TOKEN;

// Function to fetch data from the Spotify Web API
async function fetchWebApi(endpoint, method, body) {
  const res = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  return await res.json();
}

// Function to get the list of playlists for the authenticated user
async function getUserPlaylists() {
  const data = await fetchWebApi('me/playlists', 'GET');
  const playlists = data.items.map(playlist => ({ id: playlist.id, name: playlist.name }));
  return playlists;
}

// Function to get all songs and their URIs from a playlist
async function getPlaylistTracks(playlistId) {
  const data = await fetchWebApi(`playlists/${playlistId}/tracks`, 'GET');
  const tracks = data.items.map(item => ({ name: item.track.name, uri: item.track.uri }));
  return tracks;
}

// Function to get all songs and their URIs from all playlists
async function getAllPlaylistTracks(playlists) {
  const promises = playlists.map(playlist => getPlaylistTracks(playlist.id));
  const results = await Promise.all(promises);
  const allTracks = results.reduce((acc, curr) => acc.concat(curr), []);
  return allTracks;
}


async function getTopTracks() {
  // Updated endpoint reference: https://developer.spotify.com/documentation/web-api/reference/top-lists/get-users-top-artists-and-tracks/
  return (await fetchWebApi(
    'me/top/tracks?time_range=long_term&limit=5', 'GET' // Updated endpoint
  )).items;
}

async function printTopTracks() {
  try {
    const topTracks = await getTopTracks();
    console.log(
      topTracks?.map(
        ({ name, artists }) =>
          `${name} by ${artists.map(artist => artist.name).join(', ')}`
      )
    );
  } catch (error) {
    console.error('Error:', error);
  }
}



// Example usage
(async () => {
  try {
    const playlists = await getUserPlaylists();
    const allTracks = await getAllPlaylistTracks(playlists);
    console.log('All playlist tracks:', allTracks);
	printTopTracks();
  } catch (error) {
    console.error('Error:', error);
  }
})();

*/