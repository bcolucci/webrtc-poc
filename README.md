# WebRTC - POC with Twilio

This POC is about testing peer-to-peer audio/video in a room (N people).

## How to run it

First, clone the project:

    $ git clone git@github.com:bcolucci/webrtc-poc.git

### Run the server

    $ cd webrtc-pos/server

Create the `.env` file:

    $ cp env.example .env

and **set the `TWILIO_API_KEY_SECRET` value**.

Then, run with Docker:

    $ sh start.sh

Or without Docker:

    $ nvm use `cat ../.nvmrc`
    $ npm start 

### Run the client

    $ cd webrtc-pos/server

Then, run with Docker:

    $ sh start.sh

Or without Docker:

    $ nvm use `cat ../.nvmrc`
    $ npm run serve

### Open client

Go to https://localhost:8080/.

Users can be found here: `server/users.json`.

Once connected, you can create or join an existing room.
