/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  try {
    //? Call stripe public key
    const stripe = Stripe(
      'pk_test_51HkkJpHRU9S06zqQiNKjhM56Hoc2cwXkZK6kszMZRtXTeu9uaPVAws0Gd6wwGSOro2i7ZHSEvNhrCiBSn6yXMUa000J2wzRfIZ'
    );

    // 1) Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    // console.log(session);

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    // console.log(err);
    showAlert('error', err);
  }
};
