import asyncHandler from 'express-async-handler';
import Stripe from 'stripe';
import Order from '../models/Order.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create payment intent
// @route   POST /api/payment/create-intent
// @access  Private
const createPaymentIntent = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Check if order belongs to user
    if (order.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized');
    }

    // Check if already paid
    if (order.isPaid) {
        res.status(400);
        throw new Error('Order is already paid');
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(order.totalPrice * 100), // Stripe expects cents
        currency: 'usd',
        metadata: {
            orderId: orderId,
            userId: req.user._id.toString(),
        },
    });

    res.json({
        clientSecret: paymentIntent.client_secret,
    });
});

// @desc    Create checkout session for direct purchase
// @route   POST /api/payment/create-checkout-session
// @access  Private
const createCheckoutSession = asyncHandler(async (req, res) => {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
        res.status(400);
        throw new Error('No items provided');
    }

    // Create line items for Stripe
    const lineItems = items.map((item) => ({
        price_data: {
            currency: 'usd',
            product_data: {
                name: item.name,
                images: item.image ? [item.image] : [],
            },
            unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
    }));

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/cart`,
        metadata: {
            userId: req.user._id.toString(),
            shippingAddress: JSON.stringify(shippingAddress),
        },
    });

    res.json({
        sessionId: session.id,
        url: session.url,
    });
});

// @desc    Handle Stripe webhook
// @route   POST /api/payment/webhook
// @access  Public
const handleWebhook = asyncHandler(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            const orderId = paymentIntent.metadata.orderId;

            if (orderId) {
                await Order.findByIdAndUpdate(orderId, {
                    isPaid: true,
                    paidAt: new Date(),
                    status: 'processing',
                    paymentResult: {
                        id: paymentIntent.id,
                        status: paymentIntent.status,
                        updateTime: new Date().toISOString(),
                    },
                });
            }
            break;

        case 'checkout.session.completed':
            const session = event.data.object;
            // Handle checkout session completion
            console.log('Checkout session completed:', session.id);
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

// @desc    Get Stripe publishable key
// @route   GET /api/payment/config
// @access  Public
const getStripeConfig = asyncHandler(async (req, res) => {
    res.json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder',
    });
});

export {
    createPaymentIntent,
    createCheckoutSession,
    handleWebhook,
    getStripeConfig,
};
