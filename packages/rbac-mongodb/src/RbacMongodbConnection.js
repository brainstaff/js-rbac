import mongoose from 'mongoose';

export default class RbacMongodbConnection{
  constructor({mongodbConfiguration, logger}) {
    this.mongodbConfiguration = mongodbConfiguration;
    this.logger = logger;
    mongoose.connect(mongodbConfiguration.uri, mongodbConfiguration.options);

    mongoose.connection.on('reconnectFailed', () => {
      logger.info('Mongoose reconnection failed.');
    });
    mongoose.connection.on('connected', () => {
      logger.info('Established connection to Mongodb');
    });
    mongoose.connection.on('error', () => {
      logger.info('Error connecting to Mongodb');
      mongoose.disconnect();
    });
    mongoose.connection.on('disconnected', () => {
      logger.info('Disconnected from Mongodb');
    });
  }

  get dependencies() {
    return ['mongodbConfiguration', 'logger'];
  }

  disconnect(){
    mongoose.disconnect();
  }
}