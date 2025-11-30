import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import ClientLayout from './components/ClientLayout';
import AdminLayout from './components/AdminLayout';

export default function App() {
  const [app, setApp] = useState('client'); // 'client' or 'admin'

  return (
    <>
      <Toaster />
      {app === 'admin' ? (
        <AdminLayout goBack={() => setApp('client')} />
      ) : (
        <ClientLayout navigateToAdmin={() => setApp('admin')} />
      )}
    </>
  );
}