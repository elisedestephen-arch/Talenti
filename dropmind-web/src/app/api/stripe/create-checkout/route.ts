import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const plan = searchParams.get('plan');
  const email = searchParams.get('email');

  // In a real production app with the Stripe tools:
  // 1. We would check if the product/price exists for this plan
  // 2. We would create a Stripe Checkout Session
  // const session = await stripe.checkout.sessions.create({ ... })
  // return NextResponse.redirect(session.url);

  // For now, since Stripe is not yet connected by the owner, 
  // we redirect to a mock checkout page to demonstrate the flow.
  
  return NextResponse.redirect(new URL(`/checkout-mock?plan=${plan}&email=${email}`, request.url));
}
