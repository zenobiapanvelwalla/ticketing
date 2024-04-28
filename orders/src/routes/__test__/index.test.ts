import request from 'supertest';
import {app} from '../../app';
import mongoose from 'mongoose';
import {Order} from '../../models/order';
import { Ticket } from '../../models/ticket';

const buildTicket = async (title: string, price: number) => {
  const ticketId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    id: ticketId,
    title,
    price
  });
  await ticket.save();
  return ticket;
};

it('fetches orders for a particular user',  async () => {
  // Create 2 users
  const userOne = global.signin();
  const userTwo = global.signin();

  // Create 3 tickets
  const ticket1 = await buildTicket('Taylor Swift Concert', 250);
  const ticket2 = await buildTicket('Software Engineering 101', 123);
  const ticket3 = await buildTicket('Magic Show', 30);

  // Create one order as User #1
  await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({
      ticketId: ticket1.id
    });

  // Create two orders as User #2
  const {body: orderOne} = await request(app)
  .post('/api/orders')
  .set('Cookie', userTwo)
  .send({
    ticketId: ticket2.id
  })
  .expect(201);
  const {body: orderTwo} = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({
      ticketId: ticket3.id
    }).expect(201);

  // Make request to get orders for User #2
    const response = await request(app)
    .get('/api/orders')
    .set('Cookie', userTwo)
    .expect(200);

  // Make sure we only got the orders for user #2
  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(orderOne.id);
  expect(response.body[1].id).toEqual(orderTwo.id);
  expect(response.body[0].ticket.id).toEqual(ticket2.id);
  expect(response.body[1].ticket.id).toEqual(ticket3.id);

});




