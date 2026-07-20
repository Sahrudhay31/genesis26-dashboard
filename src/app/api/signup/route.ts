import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check allowlist
    const allowed = await prisma.allowlistEntry.findUnique({
      where: { email: normalizedEmail }
    });

    if (!allowed) {
      return NextResponse.json({ error: "This email hasn't been added yet — check with the panel" }, { status: 403 });
    }

    // Check if already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password_hash: hashedPassword,
        role: 'recruit'
      }
    });

    // Create session (auto-login)
    await createSession({ id: user.id, email: user.email, role: user.role });

    return NextResponse.json({ success: true, redirect: '/dashboard' });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
