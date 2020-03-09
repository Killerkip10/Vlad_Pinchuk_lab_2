const mongodb = require('mongodb')
const readline = require('readline');

const url = 'mongodb://localhost:27017/';
const mongoClient = new mongodb.MongoClient(url, { useNewUrlParser: true });

let collection;
let name;
let messageAmount = 0;

const trackMessages = () => {
  setInterval(async () => {
    const count = await collection.find().count();

    if (count === messageAmount) {
      return;
    }

    collection.find().skip(messageAmount).toArray((error, doc) => {
      messageAmount = count;
      doc.forEach(({ name, message }) => console.log(`${name}: ${message}`));
    });
  }, 2000);
};

const sendMessage = message => collection.insertOne({ name, message });

const readMessage = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('', (answer) => {
    rl.close();
    sendMessage(answer);
    readMessage();
  });
};

const startChat = () => {
  mongoClient.connect((error, client) => {
    const db = client.db('chat');
    collection = db.collection('messages');
  
    if (error) {
      console.log(`Bad connection ${error}`);
    }
  
    collection.find().toArray((error, doc) => {
      messageAmount = doc.length;
      doc.forEach(({ name, message }) => console.log(`${name}: ${message}`));
    });
  
    trackMessages(collection);
    readMessage();
  });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Name: ', (answer) => {
  rl.close();
  name = answer;
  startChat();
});
