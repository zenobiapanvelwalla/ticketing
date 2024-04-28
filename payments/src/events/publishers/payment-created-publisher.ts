import { Subjects, Publisher, PaymentCreatedEvent } from "@zenobiapanvelwala/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  

}