import { Publisher, OrderCreatedEvent, Subjects } from "@zenobiapanvelwala/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}