import { Ticket } from "../ticket";

it('implements optimistic concurrency control', async () => {
  
  // create an instance of a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: '123'
  });
 
  // save the ticket to db
  await ticket.save();

  // fetch the ticket twice
  const t1 = await Ticket.findById(ticket.id);
  const t2 = await Ticket.findById(ticket.id);

  // make two separate changes to the tickets we fetched
  t1!.set({price: 10});
  t2!.set({price: 15});

  // save the first fetch ticket
  await t1!.save();
 
  // save the second fetched ticket and expect an error
  try {
    await t2!.save();
  } catch (err) {
    return;
  }

  const t = await Ticket.findById(ticket.id);
  console.log(t);
});

it('updates the version of ticket', async () => {
   // create an instance of a ticket
   const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: '123'
  });
 
  // save the ticket to db
  await ticket.save();
  console.log(ticket);
  await ticket.save();
  console.log(ticket);
})