# Wimer

This is an application for my thesis in the spring of 2017.

## Build

To build the application you need to get the packages for the client as well as the server.


```
yarn
cd WimerReact
yarn
yarn upgrade gumija/rangy
cd ..
yarn build
```

The second yarn command is needed because for some reason the it sometimes gets a wrong version of the library.

## Running the application

To run the application you can write:
```
node dist
```
### Required ENVIRONMENTAL variables

`DATABASE_URL` - The connaction string

`GOOGLE_CLIENT_ID` - Google client id from dev console

`GOOGLE_CLIENT_SECRET` - Google client sercet from dev console

`PAGE_URL` - Used to create to google authentication callback url (`callbackURL: "http://"+ process.env.PAGE_URL +"/auth/google/callback"`)

### Required database

The application uses mysql database.