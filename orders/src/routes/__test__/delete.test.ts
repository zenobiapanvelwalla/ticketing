import request from 'supertest';
import {app} from '../../app';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';

it('marks an order as cancelled', async () => {
  const ticketId = new mongoose.Types.ObjectId().toHexString();
  // create a ticket with Ticket Model
  const ticket = Ticket.build({
    id: ticketId,
    title: 'Concert',
    price: 30
  });
  await ticket.save();

  // Create a user
  const user = global.signin();

  // make a request to create an order 
  const {body: order} = await request(app)
  .post('/api/orders')
  .set('Cookie', user)
  .send({
    ticketId: ticket.id
  })
  .expect(201);

  // make a request to cancel the order
  await request(app)
  .delete(`/api/orders/${order.id}`)
  .set('Cookie', user)
  .send()
  .expect(204);

  // expectation to make sure the order is cancelled
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits a order cancelled event', async () => {
  const ticketId = new mongoose.Types.ObjectId().toHexString();
  // create a ticket with Ticket Model
  const ticket = Ticket.build({
    id: ticketId,
    title: 'Concert',
    price: 30
  });
  await ticket.save();

  // Create a user
  const user = global.signin();

  // make a request to create an order 
  const {body: order} = await request(app)
  .post('/api/orders')
  .set('Cookie', user)
  .send({
    ticketId: ticket.id
  })
  .expect(201);

  // make a request to cancel the order
  await request(app)
  .delete(`/api/orders/${order.id}`)
  .set('Cookie', user)
  .send()
  .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});