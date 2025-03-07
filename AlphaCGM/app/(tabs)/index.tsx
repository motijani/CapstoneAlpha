// app/index.tsx (if your root is truly just Tabs)
import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/signin');
    }, 0);

    return () => clearTimeout(timer);
  }, [router]);

  return null;
}
