#include "mbed.h"
#include "MQTTClient.h"
#include "MQTTEthernet.h"
#include "rtos.h"
#include "k64f.h"
#include <string.h>

// connect options for MQTT broker
#define BROKER "192.168.2.3"   // MQTT broker URL
#define PORT 1883
//#define PORT 8080                           // MQTT broker port number
#define CLIENTID "76428c2b87c4"                         // use K64F MAC address without colons
#define USERNAME ""                         // not required for MQTT Dashboard public broker 
#define PASSWORD ""                         // not required for MQTT Dashboard public broker
#define TOPIC "ZONE_4"                            // MQTT topic

Queue<uint32_t, 6> messageQ;

DigitalOut myled1(LED1);
DigitalOut myled2(LED2);
DigitalOut myled3(LED3);

bool sw2Flag = false;
bool sw3Flag = false;


// Switch 2 interrupt handler
void sw2_ISR(void) {
    //messageQ.put((uint32_t*)22);
    //myledRed = 0;
    sw2Flag = true;
}

// Switch3 interrupt handler
void sw3_ISR(void) {
    //messageQ.put((uint32_t*)33);
    //myLedBlue = 0;
    sw3Flag = true;
}
 
// MQTT message arrived callback function
void messageArrived(MQTT::MessageData& md) {
    MQTT::Message &message = md.message;
   // pc.printf("Receiving MQTT message:  %d %s\r\n", message.payloadlen, (char*)message.payload);
    pc.printf("Message Received\n");
    //int temp = atoi((char*)message.payload);
    if (message.payloadlen == 1)
    {        
        pc.printf("DEBUG - Sent message received\n");
    }
    else
    {
        //thresholdValue = temp;
        //pc.printf("Threshold value changed to %d \n",thresholdValue);
        pc.printf("Threshold reached\n");
        myled1 = 0;        
    }    
}

int main() {
    
    myled1 = 1;
    myled2 = 1;
    myled3 = 1;
    //myledRed = 1;
    //myledGreen = 1;
    // set SW2 and SW3 to generate interrupt on falling edge 
    switch2.fall(&sw2_ISR);
    switch3.fall(&sw3_ISR);
    
    pc.printf("\r\nAttempting connect to local network...\r\n");
        
    // initialize ethernet interface
    MQTTEthernet ipstack = MQTTEthernet();
    
    // get and display client network info
    EthernetInterface& eth = ipstack.getEth();
    pc.printf("IP address is %s\r\n", eth.getIPAddress());
    pc.printf("MAC address is %s\r\n", eth.getMACAddress());
    pc.printf("Gateway address is %s\r\n", eth.getGateway());
    
    // construct the MQTT client
    MQTT::Client<MQTTEthernet, Countdown> client = MQTT::Client<MQTTEthernet, Countdown>(ipstack);
    
    char* hostname = BROKER;
    int port = PORT;
    int rc;
    
    pc.printf("\r\nAttempting TCP connect to %s:%d:  ", hostname, port);
    
    // connect to TCP socket and check return code
    if ((rc = ipstack.connect(hostname, port)) != 0)
        pc.printf("failed: rc= %d\r\n", rc);
        
    else
        pc.printf("success\r\n");
    
    MQTTPacket_connectData data = MQTTPacket_connectData_initializer;       
    data.MQTTVersion = 3;
    data.clientID.cstring = CLIENTID;
//    data.username.cstring = USERNAME;
//    data.password.cstring = PASSWORD;
    
    // send MQTT connect packet and check return code
    pc.printf("Attempting MQTT connect to %s:%d: ", hostname, port);
    if ((rc = client.connect(data)) != 0)
        pc.printf("failed: rc= %d\r\n", rc);
        
    else
        pc.printf("success\r\n");
        
    char* topic = TOPIC;
    
    // subscribe to MQTT topic
   /* pc.printf("Subscribing to MQTT topic %s: ", topic);
    if ((rc = client.subscribe(topic, MQTT::QOS0, messageArrived)) != 0)
        pc.printf("failed: rc= %d\r\n", rc);
        
    else
        pc.printf("success\r\n");*/
    
    // subscribe to Threshold topic
    pc.printf("Subscribing to MQTT topic T_ZONE_4 ");
    if ((rc = client.subscribe("T_ZONE_4", MQTT::QOS0, messageArrived)) != 0)
        pc.printf("failed: rc= %d\r\n", rc);
        
    else
        pc.printf("success\r\n");
    
    
    while(true)
    {
        
        if (sw2Flag || sw3Flag)
        {
            MQTT::Message message;
            char buf[1];
            sprintf(buf, "1");
            message.qos = MQTT::QOS0;
            message.retained = false;
            message.dup = false;            
            message.payload = (void*)"1";     
            message.payloadlen = strlen(buf);
            pc.printf("Publishing MQTT message: %d %s\r\n", message.payloadlen, (char*)message.payload);
            rc = client.publish(topic, message);
            client.yield(1000);
            sw2Flag = false;
            sw3Flag = false;
            //client.live();
            //client.publish("keepalive","keepalive");
        }
        
       /* else if (sw3Flag)
        {
            MQTT::Message message;
            char buf[1];
            sprintf(buf, "1");
            message.qos = MQTT::QOS0;
            message.retained = false;
            message.dup = false;            
            message.payload = (void*)buf;     
            message.payloadlen = strlen(buf);
            pc.printf("Publishing MQTT message: %d %s\r\n", message.payloadlen, (char*)message.payload);
            rc = client.publish(topic, message);
            client.yield(100);            
            sw3Flag = false;
        }*/
        
        MQTT::Message message;
            char buf[1];
            sprintf(buf, "1");
            message.qos = MQTT::QOS0;
            message.retained = false;
            message.dup = false;            
            message.payload = (void*)"1";     
            message.payloadlen = strlen(buf);
        rc = client.publish("keepalive",message);
        client.yield(100);
    }
}


