import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';
import {app} from '../app';
import request from 'supertest';

declare global {
  var signin: () => Promise<string[]>;
}

global.signin = async () => {
  const email = 'test@test.com';
  const password = 'password';

  const response = await request(app)
  .post('/api/users/signup')
  .send({ email, password})
  .expect(201);

  const cookie = response.get('Set-Cookie');

  return cookie;
}
let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = 'asdfasd'; // not the best way

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  
  for(let col of collections){
    await col.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});