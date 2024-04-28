import { Subjects, Publisher, OrderCancelledEvent } from "@zenobiapanvelwala/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}