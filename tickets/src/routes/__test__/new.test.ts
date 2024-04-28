import request from 'supertest';

import {app} from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('has a route handler listening to /api/tickets for post requests', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .send(({}));

  expect(response.status).not.toEqual(404);
    
});

it('it can only be accessed if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .send(({}));
  
  expect(response.status).toEqual(401);
});

it('return a status other that 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send(({}));
  
  expect(response.status).not.toEqual(401);
});

it('returns and error if an invalid title is provided', async () => {
  await request(app)
  .post('/api/tickets')
  .set('Cookie', global.signin())
  .send({
    title: '',
    price: 10
  })
  .expect(400);

  await request(app)
  .post('/api/tickets')
  .set('Cookie', global.signin())
  .send({
    price: 10
  })
  .expect(400);
});

it('returns an error if an invalid price is provided', async () => {
  await request(app)
  .post('/api/tickets')
  .set('Cookie', global.signin())
  .send({
    title: '',
    price: -10
  })
  .expect(400);

  await request(app)
  .post('/api/tickets')
  .set('Cookie', global.signin())
  .send({
    title: 'New title',
  })
  .expect(400);
});

it('creates a ticket with valid inputs', async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  await request(app)
  .post('/api/tickets')
  .set('Cookie', global.signin())
  .send({
    title: "asdsd",
    price: 20
  })
  .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(20);
  expect(tickets[0].title).toEqual('asdsd');
});

it('publishes an event', async () => {
  await request(app)
  .post('/api/tickets')
  .set('Cookie', global.signin())
  .send({
    title: "Event Management",
    price: 20
  })
  .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});