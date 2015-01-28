using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Configuration;
using RabbitMQ.Client;


namespace PrintReduction.Rabbit
{
    public class RabbitProducer
    {
        //will be putting some of the shared stuff here, currently in the method

        public bool createMessage(string key, string payload)
        {
            try
            {
                //we are going to create a rabbit mq message, and return true if it was created
                //payload is the json that we are sending up - use same as post to eduardo's system
                //Connect to RabbitMQ broker with your credentials
                ConnectionFactory factory = new ConnectionFactory() { HostName = "x0202tnythnetpd.aa.ad.epa.gov", Password = "r2devmess!", UserName = "r2dev" };

                //Use and create your connection and channel
                using (IConnection connection = factory.CreateConnection())
                {

                    using (var channel = connection.CreateModel())
                    {
                        bool exchangeIsDurable = true; //saved if server restarts
                        //Create or connect to existing exchange
                        //channel.ExchangeDeclare("testx.topic", ExchangeType.Topic, exchangeIsDurable);
                        //get this from application title (in config)
                        string exchangeName = "printReduction";
                        channel.ExchangeDeclare(exchangeName, ExchangeType.Topic, exchangeIsDurable);

                        //set properties of the message you will send to the exchange
                        IBasicProperties props = channel.CreateBasicProperties();
                        props.ContentType = "application/json";
                        props.DeliveryMode = 2; //persistent message

                        //route key for your message - i.e. id the topic of your message so people can listem for them.
                        //do we really need to have "parkingPass" as part of the route key - if it is already going into the parkingPass exchange?
                        string routeKey = "printReduction." + key;

                        var body = Encoding.UTF8.GetBytes(payload);
                        channel.BasicPublish(exchangeName, routeKey, props, body);
                    }

                }

                return true;
            }
            catch
            {
                return false;
            }

        }

    }
}
