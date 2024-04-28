import request from 'supertest';
import {app} from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

it('Returns a 404 if the provided id does no exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
  .put(`/api/tickets/${id}`)
  .set('Cookie', global.signin())
  .send({
    title: "title",
    price: 23
  }).expect(404);
});

it('Returns a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
  .put(`/api/tickets/${id}`)
  .send({
    title: "title",
    price: 23
  }).expect(401);
});

it('Returns a 401 if the user does not own the ticket', async () => {
  const response = await request(app)
  .post('/api/tickets')
  .set('Cookie', global.signin())
  .send({
    title: 'some title',
    price: 34
  });

  await request(app)
  .put(`/api/tickets/${response.body.id}`)
  .set('Cookie', global.signin())
  .send({
    title: 'update title',
    price: 1000
  })
  .expect(401);
});

it('Returns a 400 if the user provides an invalid title or price', async () => {
  const cookie = global.signin();

  const response = await request(app)
  .post('/api/tickets')
  .set('Cookie', cookie)
  .send({
    title: 'ddfsdf',
    price: 23
  });

  await request(app)
  .put(`/api/tickets/${response.body.id}`)
  .set('Cookie', cookie)
  .send({
    title: '',
    price: 30
  })
  .expect(400);

  await request(app)
  .put(`/api/tickets/${response.body.id}`)
  .set('Cookie', cookie)
  .send({
    title: 'jdshsjd',
    price: -30
  })
  .expect(400);

});

it('Updates the ticket provided valid input', async () => {
  const cookie = global.signin();

  const response = await request(app)
  .post('/api/tickets')
  .set('Cookie', cookie)
  .send({
    title: 'ddfsdf',
    price: 23
  });

  await request(app)
  .put(`/api/tickets/${response.body.id}`)
  .set('Cookie', cookie)
  .send({
    title: 'new title',
    price: 100
  })
  .expect(200);

  const ticketResponse = await request(app)
  .get(`/api/tickets/${response.body.id}`)
  .send();

  expect(ticketResponse.body.title).toEqual('new title');
  expect(ticketResponse.body.price).toEqual(100);
});

it('should publish ticket:updated event', async () => {
  const cookie = global.signin();

  const response = await request(app)
  .post('/api/tickets')
  .set('Cookie', cookie)
  .send({
    title: 'ddfsdf',
    price: 23
  });

  await request(app)
  .put(`/api/tickets/${response.body.id}`)
  .set('Cookie', cookie)
  .send({
    title: 'new title',
    price: 100
  })
  .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects updates it the ticket is reserved', async () => {
  const cookie = global.signin();

  // create ticket
  const response = await request(app)
  .post('/api/tickets')
  .set('Cookie', cookie)
  .send({
    title: 'ddfsdf',
    price: 23
  });

  // update the ticket's orderId
  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({orderId: new mongoose.Types.ObjectId().toHexString()});
  await ticket!.save();

  await request(app)
  .put(`/api/tickets/${response.body.id}`)
  .set('Cookie', cookie)
  .send({
    title: 'new title',
    price: 100
  })
  .expect(400);
});


