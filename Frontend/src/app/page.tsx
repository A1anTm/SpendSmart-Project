// app/page.tsx
'use client';
import AuthForm from '@/app/auth/AuthForm';

export default function Home() {
  return <AuthForm mode="login" />;
}