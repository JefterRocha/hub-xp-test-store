import { APIGatewayProxyHandler } from 'aws-lambda';
import { connect } from 'mongoose';
import { SNS } from 'aws-sdk';
import { orderSchema } from './order.schema.js'; // Ajuste o caminho ou copie o schema

const sns = new SNS();

export const provideReport: APIGatewayProxyHandler = async () => {
  const mongoUri = process.env.MONGODB_URI || 'none';
  
  const conn = await connect(mongoUri);
  const orderModel = conn.model('Order', orderSchema);

  const report = await orderModel.aggregate([
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalValue: { $sum: '$total' },
      },
    },
  ]);

  console.log('Report generated:', report);
  await conn.disconnect();

  return {
    statusCode: 200,
    body: (report[0] || { totalOrders: 0, avgTotal: 0 }),
  };
};

interface SNSEventRecord {
  Sns: {
    Message: string;
  };
}

interface SNSEvent {
  Records: SNSEventRecord[];
}

interface SNSPublishParams {
  Message: string;
  TopicArn: string | undefined;
}

export const notifyNewOrder = async (event: SNSEvent): Promise<{ statusCode: number; body: string }> => {
  try {
    // Extrai os dados do evento SNS
    const message: { orderId: string } = JSON.parse(event.Records[0].Sns.Message);
    const { orderId } = message;

    // Mensagem de notificação
    const notificationMessage = `New Order! ID: ${orderId}`;

    // Configura os parâmetros para publicar no SNS
    const params: SNSPublishParams = {
      Message: notificationMessage,
      TopicArn: process.env.SNS_TOPIC_ARN,
    };

    // Publica a mensagem no SNS
    await sns.publish(params).promise();

    console.log('Notify sent with success:', notificationMessage);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: notificationMessage }),
    };
  } catch (error) {
    console.error('Error when try send notification:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error when try send notification' }),
    };
  }
};