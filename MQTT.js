const clientId = 'mqttjs_' + Math.random().toString(16).substr(2, 8);
const host = 'ws://broker.hivemq.com:8000/mqtt'; // Broker publique où sont stockées les données -> ws : protocole websocket
const options = {
  keepalive: 60,
  clientId: clientId,
  protocolId: 'MQTT',
  protocolVersion: 4,
  clean: true,
  reconnectPeriod: 1000,
  connectTimeout: 30 * 1000,
  will: {
    topic: 'WillMsg',
    payload: 'Connection Closed abnormally..!',
    qos: 0,
    retain: false
  }
};

console.log('Connecting mqtt client');
const client = mqtt.connect(host, options); // Connexion au broker avec les différents paramètres établis plus haut

// Topics auxquels s'abonner
// On leur associe une variable pour pouvoir ensuite les faire afficher dans les fichiers HTML
const topics = {
  'ensem/salle206/ordinateur02': 'puissance-ordinateur',
  'ensem/salle206/temperature': 'temperature-salle',
  'ensem/mixEnergetiqueGrandEstEnsem': 'puissance-ecran'
};

client.on('connect', () => { // Subscribe des différents topic
  console.log('Connected');
  client.subscribe(Object.keys(topics), (err) => {
    if (!err) {
      console.log('Subscribed to topics:', Object.keys(topics).join(', '));
    }
  });
});

client.on('message', (topic, message) => { // Fonction qui permet de recevoir les message
  const elementId = topics[topic]; // message stockées dans une forme de dictionnaire JS
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message.toString();
  }
});

client.on('error', (err) => { // En cas d'erreur renvoyer dans la console l'information que la connection n'a pas pu être réalisé 
  console.error('Connection error: ', err);
});

client.on('close', () => { // Fermeture de la liaison avec le broker
  console.log('Connection closed');
});
