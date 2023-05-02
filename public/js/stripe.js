import axios from 'axios';
import {showAlert} from './alerts';

export const bookTour = async tourId =>
{
    try{
    const stripe = Stripe('pk_test_51MtLGjCpgwRVyPf0uG3TWlMFzjnALdUqHkTh9tjr4blr1kIFcnG30rhdS4qKJrtS07yxiiBmiazOXbtIMBXBgKZM00iPslEhZl');

    //1Get checkout session from api
    // const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`);
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

   // console.log(session);
    //2 Create checkout form + charge credit card
    await stripe.redirectToCheckout({
        sessionId:session.data.session.id
    });

    }
    catch(err)
    {
       // console.log(err);
        showAlert('error',err);
    }
}