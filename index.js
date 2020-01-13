//Notes here:
//Ray can't play music for some reason. Error message: TypeError [ERR_INVALID_ARG_TYPE]: The "file" argument must be of type string. Received type object
//To do list: add dice roll game, add name-color changer, add leaving messages, fix greetings, fix music

require('dotenv/config');
const http = require('http');
const port = process.env.PORT || 3000;
http.createServer().listen(port);
const token = process.env.token;
const Discord = require('discord.js');
const{ prefix, giphyToken } = require('./config.json');
const client = new Discord.Client();
var GphApiClient = require('giphy-js-sdk-core')
giphy = GphApiClient(giphyToken)

//uno
const cheerio = require('cheerio');
const request = require('request');

var servers = {};

//Greetings
var greetings = ["Hello", "Hi", "Hey"];
var greetingsResponse = greetings[Math.floor(Math.random()*greetings.length)];

//Welcome
client.on('guildMemberAdd', member => {
    const channel = member.guild.channels.find(channel => channel.name == "welcome")
    if(!channel) return;

    channel.send(`Welcome to the server, ${member}! It's great to meet you! I am a bot. To see what I can do type: ray help`)
});

//Music
const ytdl = require("ytdl-core");
client.on('message', message => {
    let args = message.content.substring(prefix.length).split(" ");
    switch (args[0]){
        case 'play':

            function play(connection, message){
                var server = servers[message.guild.id];
                server.dispatcher = connection.playStream(ytdl(server.queue[0], {filter: "audioonly"}));
                server.queue.shift();
                server.dispatcher.on("end", function(){
                    if(server.queue[0]){
                        play(connection, message);
                    }else{
                        connection.disconnect();
                    }
                    });
            }

            if(!args[1]){
                message.channel.send("Sorry, you need to provide a link");
                return;
            }
            if(!message.member.voiceChannel){
                message.channel.send("You must be in a voice channel")
                return;
            }
            if(!servers[message.guild.id]) servers[message.guild.id]={
                queue: []
            }
            var server = servers[message.guild.id];
            server.queue.push(args[1]);
            if(!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection){
                play(connection, message);
            })
            break;
            
            case 'skip':
                var server = servers[message.guild.id];
                if(server.dispatcher) server.dispatcher.end();
                message.channel.send("Skipping the song");
                break;

            case 'stop':
                    var server = servers[message.guild.id];
                    if(message.guild.voiceConnection){
                        for(var i = server.queue.length -1; i >=0; i--){
                            server.queue.splice(i, 1);
                        }
                        server.dispatcher.end();
                        message.channel.send("Ending the queue, leaving the voice channel")
                        console.log('stopped the gueue')
                    }
                    if(message.guild.connection) message.guild.voiceConnection.disconnect();
                    break;
    }
})

//Greeting
client.on('message', message => {

    if(message.content.startsWith(`${prefix}hi`)){
       message.channel.send(greetingsResponse)
    }

    if(message.content.startsWith(`${prefix}gif`)){
            giphy.search('gifs', {"q": "gif"})
                .then((response) => {
                    var totalResponses = response.data.length;
                    var responseIndex = Math.floor((Math.random() * 10) + 1) % totalResponses;
                    var responseFinal = response.data[responseIndex];

                    message.channel.send("As you wish", {
                        files: [responseFinal.images.fixed_height.url]
                    })
                }).catch(() => {
                    message.channel.send('Error...damn');
                })
    }
    
    //Pat
    if(message.content.startsWith(`${prefix}pat`)){

        let member = message.mentions.members.first();
            giphy.search('gifs', {"q": "anime head pat"})
                .then((response) => {
                    var totalResponses = response.data.length;
                    var responseIndex = Math.floor((Math.random() * 10) + 1) % totalResponses;
                    var responseFinal = response.data[responseIndex];

                    message.channel.send("There, there...", {
                        files: [responseFinal.images.fixed_height.url]
                    })
                }).catch(() => {
                    message.channel.send('Error...damn');
                })
        
    }

    //Slap
    if(message.content.startsWith(`${prefix}slap`)){

        let member = message.mentions.members.first();
            giphy.search('gifs', {"q": "slap"})
                .then((response) => {
                    var totalResponses = response.data.length;
                    var responseIndex = Math.floor((Math.random() * 10) + 1) % totalResponses;
                    var responseFinal = response.data[responseIndex];

                    message.channel.send("*slap* Smol brain smh", {
                        files: [responseFinal.images.fixed_height.url]
                    })
                }).catch(() => {
                    message.channel.send('Error...damn');
                })
        
    }

    //Hug
    if(message.content.startsWith(`${prefix}hug`)){

        let member = message.mentions.members.first();
            giphy.search('gifs', {"q": "anime hug"})
                .then((response) => {
                    var totalResponses = response.data.length;
                    var responseIndex = Math.floor((Math.random() * 10) + 1) % totalResponses;
                    var responseFinal = response.data[responseIndex];

                    message.channel.send("*hugs* It's going to be ok", {
                        files: [responseFinal.images.fixed_height.url]
                    })
                }).catch(() => {
                    message.channel.send('Error...damn');
                })
        
    }

    //Poll
    let args = message.content.substring(prefix.length).split(" ");
    switch(args[0]){
        case "poll":
            let msgArgs = args.slice(1).join(" ");
            message.channel.send("📋" + "**" + msgArgs + "**").then(messageReaction => {
                messageReaction.react("👍");
                messageReaction.react("👎");
                message.delete(100).catch(console.error);
            });
        break;
        }




    //UNO
    switch (args[0]) {
        case 'uno':
        image(message);

        break;
    }

})

//RPS
const { Client, Collection } = require("discord.js");
const { config } = require("dotenv");
const fs = require("fs");

client.commands = new Collection();
client.aliases = new Collection();

client.categories = fs.readdirSync("./commands/");

config({
    path: __dirname + "/.env"
});

["command"].forEach(handler => {
    require(`./handlers/${handler}`)(client);
});

client.on("ready", () => {
    console.log(`Hi, ${client.user.username} is now online!`);

    client.user.setPresence({
        status: "online",
        game: {
            name: "me getting developed",
            type: "STREAMING"
        }
    }); 
});

client.on("message", async message => {
    const prefix = "ray ";

    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.content.startsWith(prefix)) return;
    if (!message.member) message.member = await message.guild.fetchMember(message);

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    
    if (cmd.length === 0) return;
    
    let command = client.commands.get(cmd);
    if (!command) command = client.commands.get(client.aliases.get(cmd));

    if (command) 
        command.run(client, message, args);
});

//Uno
function image(message){

    var options = {
        url: "http://results.dogpile.com/serp?qc=images&q=" + "uno reverse card",
        method: "GET",
        headers: {
            "Accept": "text/html",
            "User-Agent": "Chrome"
        }
    };

    request(options, function(error, response, responseBody) {
        if (error) {
            return;
        }
  
 
        $ = cheerio.load(responseBody); 
 

        var links = $(".image a.link");
 
        var urls = new Array(links.length).fill(0).map((v, i) => links.eq(i).attr("href"));
        
        console.log(urls);

        if (!urls.length) {
           
            return;
        }
 
        // Send result
        message.channel.send( urls[Math.floor(Math.random() * urls.length)]);
    });
}

client.login(token);

client.on('error', err => {
    console.log(err);
});



exports.handler = async function() {
    return {
      headers: {
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST',
        'Access-Control-Allow-Origin': 'http://localhost:8000',
      },
      statusCode: 201,
      body: 'someBody',
    }
  };

  
client.once('ready',() => {
    console.log('Ready!')
})