import request from 'supertest';
import {app} from '../../app';
import mongoose from 'mongoose';


it('Returns a 404 if the ticket is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it('Returns the ticket if the ticket is found', async () => {
  const response = await request(app).post('/api/tickets').set('Cookie', global.signin()).send({
    title: 'Concert', price: 20
  }).expect(201);

  const ticketRes = await request(app).get(`/api/tickets/${response.body.id}`).send().expect(200);

  expect(ticketRes.body.title).toEqual('Concert');
  expect(ticketRes.body.price).toEqual(20);
});
