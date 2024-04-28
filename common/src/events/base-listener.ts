import {Message, Stan} from 'node-nats-streaming';
import { Subjects } from './subjects';

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Listener<T extends Event> {
  abstract subject: T['subject'];
  abstract queueGroupName: string;
  abstract onMessage(data: T['data'], msg: Message): void;
  protected client: Stan;
  protected ackWait = 5*1000;


  constructor(client: Stan){
    this.client = client;
  }

  /**
   * setDeliverAllAvailable, setDurableName and queue-group - are three options that mesh really well for our
   * requirement of taking care of duplicate events, processing events in correct order 
   * when services come up for the first time or when they die and resurrect 
   **/
  subscriptionOptions() {
    return this.client
    .subscriptionOptions()
    .setDeliverAllAvailable() // when service comes online for very first time it will get all the events by this command
    .setManualAckMode(true)
    .setAckWait(this.ackWait)
    .setDurableName(this.queueGroupName);  // marks events that are processed by this service, then if the service goes down and comes back up, it gets only the unprocessed events because of this command
  }

  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    );

    subscription.on('message', (msg: Message) => {
      console.log(
        `Message received: ${this.subject} / ${this.queueGroupName}`
      );

      const parsedData = this.parseMessage(msg);
      this.onMessage(parsedData, msg);
    });
  }

  parseMessage(msg: Message) {
    const data = msg.getData();
    return typeof data === 'string'? 
      JSON.parse(data): JSON.parse(data.toString('utf-8'));
  }
}