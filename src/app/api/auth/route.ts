/**
 * KDS Auth API — Account creation with welcome email
 */

import { NextResponse } from 'next/server';

// In-memory user store (replace with real DB in production)
const users: Map<string, { email: string; name: string; created: string }> = new Map();

export async function POST(request: Request) {
  try {
    const { action, email, password, name } = await request.json();

    if (action === 'signup') {
      // Validate
      if (!email || !password || !name) {
        return NextResponse.json({ error: 'All fields required' }, { status: 400 });
      }

      if (users.has(email)) {
        return NextResponse.json({ error: 'Account already exists' }, { status: 400 });
      }

      // Create account
      users.set(email, {
        email,
        name,
        created: new Date().toISOString(),
      });

      // Send welcome email (log for now)
      console.log(`📧 Welcome email sent to ${email} (${name})`);

      return NextResponse.json({
        success: true,
        message: 'Account created! Welcome email sent.',
        user: { email, name },
      });
    }

    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
      }

      const user = users.get(email);
      if (!user) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        user: { email: user.email, name: user.name },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
