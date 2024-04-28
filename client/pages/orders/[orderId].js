import { useEffect, useState } from "react";
import StripeCheckout from 'react-stripe-checkout'
import useRequest from "../../hooks/useRequest";
import Router from "next/router";

const OrderShow = ({order, currentUser}) => {
  const [timeLeft, setTimeLeft] = useState(0); 
  const {doRequest, errors} = useRequest({
    url:'/api/payments',
    method: 'post',
    body: {
      orderId: order.id
    },
    onSuccess: () => Router.push('/orders')
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft/1000));
    };

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    // invoked when we navigate away / stop showing this component
    return () => {
      clearInterval(timerId);
    };
  }, [order]);

  if(timeLeft < 0) {
    return <div>
      Order Expired
    </div>;
  }

  return <div>
    Time left to pay: {timeLeft} seconds
    <StripeCheckout 
      token={({id}) => doRequest({token: id})}
      stripeKey="pk_test_51P0UIpHAy1SctRkLztohYYG0tqDerttO8MDRbuSEMfEAIIWDM2GX4XpLlFa8MW0CoMDt5Fb4ecfRrIvFEJo0Kopa00WeCVc2Cv"
      amount={order.ticket.price * 100}
      email={currentUser.email}
    />
    {errors}
  </div>
};

OrderShow.getInitialProps = async (context, client) => {
  const {orderId} = context.query;
  const {data} = await client.get(`/api/orders/${orderId}`);
  return {order: data};
};

export default OrderShow;