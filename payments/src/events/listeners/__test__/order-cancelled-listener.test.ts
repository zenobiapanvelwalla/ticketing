import { natsWrapper } from "../../../nats-wrapper"
import { OrderCancelledListener } from "../order-cancelled-listener";
import { OrderCancelledEvent, OrderStatus } from "@zenobiapanvelwala/common";
import mongoose from 'mongoose';
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";

const setup = async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: 'sdsdfs',
    status: OrderStatus.Created,
    version: 0,
    price: 10
  });
  await order.save();

  const listener = new OrderCancelledListener(natsWrapper.client);
  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 0, //1
    ticket: {
      id: 'sdsdf'
    }
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return {listener, data, msg, order};
}

it('updates the status of the order', async () => {
  const {listener, data, msg, order} = await setup();

  await listener.onMessage(data, msg);
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
  const {listener, data, msg, order} = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});