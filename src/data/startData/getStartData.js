const config = require("config");

const clientId = config.get("spotify.clientId");
const clientSecret = config.get("spotify.clientSecret");

const { getLogger } = require("../../core/logging");

const playlistId = "5ABHKGoOzxkaa28ttQV9sE";

async function getStartData() {
    try {
        const accessToken = await getAccessToken(clientId, clientSecret);

        const playlistTracksResponse = await fetch(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
            {
                headers: {
                    Authorization: "Bearer " + accessToken,
                },
            }
        );

        const playlistTracksData = await playlistTracksResponse.json();
        const artists = [];
        const songs = [];
        const albums = [];
        let artistId = 1;
        let albumId = 1;
        let songId = 1;

        for (const song of playlistTracksData.items) {
            const artistName = song.track.artists[0].name;
            const isAlbum = song.track.album.album_type === "album";
            const albumName = song.track.album.name;
            const songName = song.track.name;
            const songToAdd = {
                id: songId++,
                title: songName,
            };
            const albumToAdd = {
                id: albumId,
                title: albumName,
            };

            const artist = artists.find((artist) => artist.name === artistName);
            if (!artist) {
                artists.push({
                    id: artistId,
                    name: artistName,
                });
                songToAdd.artist_id = artistId;
                albumToAdd.artist_id = artistId++;
            } else {
                songToAdd.artist_id = artist.id;
                albumToAdd.artist_id = artist.id;
            }

            if (isAlbum && !albums.find((album) => album.title === albumName)) {
                albums.push(albumToAdd);
                songToAdd.album_id = albumId++;
            }

            songs.push(songToAdd);
        }

        return { artists, albums, songs };
    } catch (error) {
        getLogger().error("Error:", error);
    }
}

async function getAccessToken(clientId, clientSecret) {
    const tokenUrl = "https://accounts.spotify.com/api/token";

    const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Basic " + btoa(`${clientId}:${clientSecret}`),
        },
        body: new URLSearchParams({
            grant_type: "client_credentials",
        }),
    });

    const data = await response.json();
    return data.access_token;
}

module.exports = { getStartData };
