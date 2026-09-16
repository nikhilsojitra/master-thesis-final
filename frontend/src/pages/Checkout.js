import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, Lock, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    const createOrder = async () => {
      try {
        const orderItems = cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity
        }));

        const response = await axios.post('/api/orders', { items: orderItems });
        const newOrderId = response.data.order.id;
        setOrderId(newOrderId);

        // Create payment intent
        const paymentResponse = await axios.post('/api/payments/create-payment-intent', {
          orderId: newOrderId
        });
        setClientSecret(paymentResponse.data.clientSecret);
      } catch (error) {
        console.error('Failed to create order:', error);
        toast.error(error.response?.data?.message || 'Failed to create order');
        navigate('/cart');
      }
    };

    createOrder();
  }, [cartItems, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);

    const card = elements.getElement(CardElement);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: card,
        billing_details: {
          name: user.name,
          email: user.email,
        },
      }
    });

    if (error) {
      console.error('Payment failed:', error);
      toast.error(error.message);
    } else {
      // Payment succeeded
      try {
        await axios.post('/api/payments/confirm-payment', {
          paymentIntentId: paymentIntent.id,
          orderId: orderId
        });
        
        clearCart();
        toast.success('Payment successful! Your order has been placed.');
        navigate(`/orders/${orderId}`);
      } catch (error) {
        console.error('Failed to confirm payment:', error);
        toast.error('Payment processed but failed to update order. Please contact support.');
      }
    }

    setLoading(false);
  };

  const total = getCartTotal();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="order-2 lg:order-1">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Order Summary
              </h2>
            </div>
            <div className="card-content space-y-4">
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.imageUrl || 'https://placehold.co/60x60'}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <hr />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
              </div>

              <hr />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="order-1 lg:order-2">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Information
              </h2>
            </div>
            <div className="card-content">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Details
                  </label>
                  <div className="p-3 border border-gray-300 rounded-md">
                    <CardElement
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': {
                              color: '#aab7c4',
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center text-sm text-gray-600">
                    <Lock className="h-4 w-4 mr-2" />
                    Your payment information is secure and encrypted
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!stripe || loading || !clientSecret}
                  className="w-full btn-primary text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    `Pay $${total.toFixed(2)}`
                  )}
                </button>

                <div className="text-center text-sm text-gray-500">
                  <p>Test card: 4242 4242 4242 4242</p>
                  <p>Use any future date and any 3-digit CVC</p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Checkout = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default Checkout;
