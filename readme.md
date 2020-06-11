## Getting started

Install dependencies
```
npm install
```

Create a database in Postgres for the default user.
```
psql --user postgres

postgres=# CREATE DATABASE yomoji_dev;
postgres=# CREATE USER myuser;
postgres=# grant all privileges on database yomoji_dev to myuser;
```

Run migrations
```
npx knex migrate:latest
```

Copy and fill out `.env` file
```
cp .env.sample .env
```

Run development server
```
npm start
```

## Configuring with a Slack workspace
### Tunnel to localhost

This will make your local Slack bot available to the web, including Slack.

```
npx ngrok http 8080
```

### Creating a Slack app within a sample workspace

The easiest method of testing is to make a sample Slack workspace and link it to your ngrok-tunnelled bot application

First, create a new Slack app [here](https://api.slack.com/apps?new_app=1).

### OAuth & Permissions
Go to the **OAuth & Permissions** section to determine what permissions your Bot User should have.
In order for Yomoji to work, enable the following:

#### Bot Token Scopes
```
 app_mentions:read
 View messages that directly mention @yomoji_test in conversations that the app is in

 channels:history
 View messages and other content in public channels that Yomoji Test has been added to

 chat:write
 Send messages as @yomoji_test

 groups:history
 View messages and other content in private channels that Yomoji Test has been added to

 im:history
 View messages and other content in direct messages that Yomoji Test has been added to

 im:write
 Start direct messages with people

 users:read
 Read info about a user
```

#### User Token Scopes
```
 identify
 View information about the user’s identity
```


### Event Subscriptions
Go to the **Event Subscriptions** section to determine when Yomoji bot should be invoked.

Subscribe to the following Bot Events:
```
 app_mention
 message.im
 message.channels
 message.groups
```

Use ngrok link as the Request URL. When any of the following events occur, Slack will post to this URL.

### Install the App
Go to the **Install App** section to make the Bot App accessible within your Slack workspace.

Then, Slack will have generated the Bot User OAuth Access Token, which you should set as `BOT_TOKEN` within the `.env` file.

### Verifying everything works

Send a message to your bot once they are in the channel!

> You: @Yomoji whaddup
>
> Yomoji: I am a bot

### Slash commands

Add slash commands into slack app.

Supported commands are:

`/add_emoji`

`/list_emojis`
